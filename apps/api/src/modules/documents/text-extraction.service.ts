import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import type { DocumentExtension } from '@orgmind/shared';
import { env } from '../../config/env.js';

function normalizeText(value: string, maximumBytes: number): string {
  const normalized = value.replace(/\r\n?/g, '\n').replace(/\0/g, '').trim();
  if (Buffer.byteLength(normalized, 'utf8') <= maximumBytes) return normalized;

  let text = '';
  let bytes = 0;
  for (const character of normalized) {
    const characterBytes = Buffer.byteLength(character, 'utf8');
    if (bytes + characterBytes > maximumBytes) break;
    text += character;
    bytes += characterBytes;
  }
  return text.trimEnd();
}

export async function extractDocumentText(
  extension: DocumentExtension,
  contents: Buffer,
  maximumBytes = env.MAX_DOCUMENT_TEXT_BYTES,
): Promise<string> {
  let text: string;
  switch (extension) {
    case 'pdf': {
      const parser = new PDFParse({ data: contents });
      try {
        text = (await parser.getText()).text;
      } finally {
        await parser.destroy();
      }
      break;
    }
    case 'docx':
      text = (await mammoth.extractRawText({ buffer: contents })).value;
      break;
    case 'md':
    case 'txt':
      text = contents.toString('utf8').replace(/^\uFEFF/, '');
      break;
  }

  const extractedText = normalizeText(text, maximumBytes);
  if (!extractedText) throw new Error('No extractable text was found in this document.');
  return extractedText;
}
