import { describe, expect, it } from 'vitest';
import { chunkDocumentText } from '../src/modules/documents/chunking.service.js';

describe('document chunking', () => {
  it('keeps Markdown heading context with its chunks', () => {
    const chunks = chunkDocumentText(
      '# Handbook\n\n## Leave\n\nEmployees receive twenty days of annual leave. Managers approve leave requests.',
      { targetCharacters: 55, overlapCharacters: 10 },
    );

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.headingPath.join(' > ') === 'Handbook > Leave')).toBe(
      true,
    );
    expect(chunks.every((chunk) => chunk.text.startsWith('Handbook > Leave'))).toBe(true);
    expect(chunks.every((chunk) => chunk.text.length <= 55)).toBe(true);
  });

  it('keeps table rows intact and repeats their header after a split', () => {
    const chunks = chunkDocumentText(
      '# Benefits\n\n| Plan | Days |\n| --- | --- |\n| Standard | 20 |\n| Extended | 30 |\n| Executive | 40 |',
      { targetCharacters: 50, overlapCharacters: 8 },
    );

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[1]?.text).toContain('| Plan | Days |');
    expect(chunks.every((chunk) => chunk.text.includes('|'))).toBe(true);
  });

  it('adds paragraph overlap and returns stable chunk indexes', () => {
    const chunks = chunkDocumentText(
      'Alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu.',
      { targetCharacters: 35, overlapCharacters: 10 },
    );

    expect(chunks.map((chunk) => chunk.chunkIndex)).toEqual(chunks.map((_, index) => index));
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[1]?.text).toMatch(/theta|epsilon|zeta/);
    expect(chunks.every((chunk) => chunk.endOffset > chunk.startOffset)).toBe(true);
  });

  it('returns no chunks for empty text and validates overlap settings', () => {
    expect(chunkDocumentText('  \n', { targetCharacters: 100, overlapCharacters: 10 })).toEqual([]);
    expect(() =>
      chunkDocumentText('text', { targetCharacters: 10, overlapCharacters: 10 }),
    ).toThrow('Chunk target must be positive and larger than the overlap.');
  });
});
