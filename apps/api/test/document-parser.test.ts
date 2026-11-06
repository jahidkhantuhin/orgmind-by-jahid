import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { extractDocumentText } from '../src/modules/documents/text-extraction.service.js';

describe('document text extraction', () => {
  it('extracts text from PDF, DOCX, Markdown, and TXT fixtures', async () => {
    const fixtures = new URL('./fixtures/', import.meta.url);
    const [pdf, docx, markdown, text] = await Promise.all([
      readFile(new URL('sample.pdf', fixtures)),
      readFile(new URL('sample.docx', fixtures)),
      readFile(new URL('sample.md', fixtures)),
      readFile(new URL('sample.txt', fixtures)),
    ]);

    await expect(extractDocumentText('pdf', pdf)).resolves.toContain('OrgMind PDF fixture text');
    await expect(extractDocumentText('docx', docx)).resolves.toContain('OrgMind DOCX fixture text');
    await expect(extractDocumentText('md', markdown)).resolves.toContain('Team handbook');
    await expect(extractDocumentText('txt', text)).resolves.toContain('Plain text fixture');
  });

  it('rejects empty and invalid documents', async () => {
    await expect(extractDocumentText('txt', Buffer.from('  \0\n'))).rejects.toThrow(
      'No extractable text was found',
    );
    await expect(extractDocumentText('docx', Buffer.from('not a docx'))).rejects.toThrow();
  });

  it('truncates extracted text at the configured byte boundary', async () => {
    const result = await extractDocumentText('txt', Buffer.from('Hello World'), 5);
    expect(result).toBe('Hello');
  });
});
