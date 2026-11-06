import { describe, expect, it, vi } from 'vitest';
import {
  createGeminiEmbeddingProvider,
  type EmbedContentClient,
  type EmbedContentParameters,
  type EmbeddingTask,
} from '../src/modules/documents/embedding.service.js';

type EmbedFunction = (_parameters: EmbedContentParameters) => Promise<{
  embeddings?: Array<{ values?: number[] }>;
}>;

function mockClient(embedContent: EmbedFunction): EmbedContentClient {
  return { models: { embedContent } };
}

describe('Gemini embedding provider', () => {
  it('batches document inputs, sets retrieval task options, and normalizes vectors', async () => {
    const embedContent = vi.fn(async ({ contents }: EmbedContentParameters) => ({
      embeddings: contents.map(() => ({ values: [3, 4] })),
    })) as unknown as EmbedFunction & ReturnType<typeof vi.fn>;
    const provider = createGeminiEmbeddingProvider({
      apiKey: 'test-key',
      model: 'gemini-embedding-001',
      dimensions: 2,
      batchSize: 2,
      createClient: async () => mockClient(embedContent),
    });

    const vectors = await provider.embed(['one', 'two', 'three']);

    expect(embedContent).toHaveBeenCalledTimes(2);
    expect(embedContent.mock.calls[0]?.[0]).toMatchObject({
      model: 'gemini-embedding-001',
      contents: ['one', 'two'],
      config: { taskType: 'RETRIEVAL_DOCUMENT', outputDimensionality: 2 },
    });
    expect(Array.from(vectors[0] ?? [])).toEqual([expect.closeTo(0.6), expect.closeTo(0.8)]);
  });

  it('uses the query task when embedding a search query', async () => {
    const embedContent = vi.fn(async (_parameters: EmbedContentParameters) => ({
      embeddings: [{ values: [1, 0] }],
    })) as unknown as EmbedFunction & ReturnType<typeof vi.fn>;
    const provider = createGeminiEmbeddingProvider({
      apiKey: 'test-key',
      model: 'gemini-embedding-001',
      dimensions: 2,
      batchSize: 8,
      createClient: async () => mockClient(embedContent),
    });

    await provider.embed(['find policy'], 'query' satisfies EmbeddingTask);

    expect(embedContent.mock.calls[0]?.[0]).toMatchObject({
      config: { taskType: 'RETRIEVAL_QUERY' },
    });
  });

  it('retries rate limits with exponential delay and rejects malformed vectors', async () => {
    const embedContent = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error('Embed content tokens per minute quota exceeded'), { status: 429 }),
      )
      .mockResolvedValueOnce({ embeddings: [{ values: [0, 2] }] }) as unknown as EmbedFunction &
      ReturnType<typeof vi.fn>;
    const wait = vi.fn(async (_milliseconds: number) => undefined);
    const provider = createGeminiEmbeddingProvider({
      apiKey: 'test-key',
      model: 'gemini-embedding-001',
      dimensions: 2,
      batchSize: 1,
      wait,
      createClient: async () => mockClient(embedContent),
    });

    await expect(provider.embed(['one'])).resolves.toHaveLength(1);
    expect(embedContent).toHaveBeenCalledTimes(2);
    expect(wait).toHaveBeenCalledTimes(1);
    expect(wait.mock.calls[0]?.[0]).toBeGreaterThanOrEqual(65_000);

    const invalid = createGeminiEmbeddingProvider({
      apiKey: 'test-key',
      model: 'gemini-embedding-001',
      dimensions: 2,
      batchSize: 1,
      createClient: async () =>
        mockClient(
          vi.fn(async (_parameters: EmbedContentParameters) => ({
            embeddings: [{ values: [1] }],
          })) as unknown as EmbedFunction & ReturnType<typeof vi.fn>,
        ),
    });
    await expect(invalid.embed(['one'])).rejects.toThrow('invalid 1-dimension vector');
  });
});
