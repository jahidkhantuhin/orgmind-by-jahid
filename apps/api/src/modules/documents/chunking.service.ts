export type TextChunk = {
  chunkIndex: number;
  text: string;
  headingPath: string[];
  startOffset: number;
  endOffset: number;
};

type Block = {
  text: string;
  headingPath: string[];
  startOffset: number;
  endOffset: number;
  isTable: boolean;
};

type Piece = Omit<Block, 'headingPath'>;

function isTableRow(line: string): boolean {
  return /^\s*\|.*\|\s*$/.test(line);
}

function splitWords(text: string, startOffset: number, maximum: number): Piece[] {
  const pieces: Piece[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    let end = Math.min(cursor + maximum, text.length);
    if (end < text.length) {
      const boundary = text.lastIndexOf(' ', end);
      const newline = text.lastIndexOf('\n', end);
      end = Math.max(boundary, newline, cursor + Math.floor(maximum * 0.6));
    }
    const raw = text.slice(cursor, end);
    const leading = raw.length - raw.trimStart().length;
    const trailingTrimmed = raw.trimEnd();
    if (!trailingTrimmed) {
      cursor = end;
      continue;
    }
    const pieceStart = cursor + leading;
    const pieceEnd = cursor + trailingTrimmed.length;
    pieces.push({
      text: text.slice(pieceStart, pieceEnd),
      startOffset: startOffset + pieceStart,
      endOffset: startOffset + pieceEnd,
      isTable: false,
    });
    cursor = end;
    while (cursor < text.length && /\s/.test(text[cursor] ?? '')) cursor += 1;
  }
  return pieces;
}

function splitTable(block: Block, maximum: number): Piece[] {
  const rows = block.text.split('\n');
  if (block.text.length <= maximum) {
    return [
      {
        text: block.text,
        startOffset: block.startOffset,
        endOffset: block.endOffset,
        isTable: true,
      },
    ];
  }

  const rowOffsets: number[] = [];
  let searchFrom = 0;
  for (const row of rows) {
    const found = block.text.indexOf(row, searchFrom);
    rowOffsets.push(found);
    searchFrom = found + row.length + 1;
  }
  const headerRows = rows.length > 1 && /^\s*\|?\s*:?-{3,}/.test(rows[1] ?? '') ? 2 : 1;
  const pieces: Piece[] = [];
  let index = 0;

  while (index < rows.length) {
    const begin = index;
    const repeatedHeader = begin > 0 ? rows.slice(0, headerRows) : [];
    const selected = [...repeatedHeader];
    let end = begin;
    let length = selected.join('\n').length;
    while (end < rows.length) {
      const row = rows[end] ?? '';
      if (end < headerRows && begin > 0) {
        end += 1;
        continue;
      }
      if (length > 0 && length + row.length + 1 > maximum) break;
      selected.push(row);
      length += row.length + 1;
      end += 1;
      if (row.length > maximum) break;
    }
    if (end === begin) end += 1;
    const firstSourceIndex = begin > 0 ? begin : 0;
    const lastSourceIndex = Math.max(firstSourceIndex, end - 1);
    const firstOffset = rowOffsets[firstSourceIndex] ?? 0;
    const lastRow = rows[lastSourceIndex] ?? '';
    pieces.push({
      text: selected.join('\n').trim(),
      startOffset: block.startOffset + firstOffset,
      endOffset: block.startOffset + (rowOffsets[lastSourceIndex] ?? firstOffset) + lastRow.length,
      isTable: true,
    });
    index = end;
  }
  return pieces;
}

function parseBlocks(source: string): Block[] {
  const lines = source.split('\n');
  const headings: Array<string | undefined> = [];
  const blocks: Block[] = [];
  let pending: Array<{ text: string; offset: number }> = [];
  let pendingIsTable = false;
  let offset = 0;

  const flush = () => {
    if (pending.length === 0) return;
    const text = pending
      .map((line) => line.text)
      .join('\n')
      .trim();
    if (text) {
      const first = pending[0]!;
      const last = pending[pending.length - 1]!;
      blocks.push({
        text,
        headingPath: headings.filter((heading): heading is string => Boolean(heading)),
        startOffset: first.offset,
        endOffset: last.offset + last.text.length,
        isTable: pendingIsTable,
      });
    }
    pending = [];
  };

  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line.trim());
    if (heading) {
      flush();
      const level = heading[1]!.length;
      headings.length = level;
      headings[level - 1] = heading[2]!.trim();
      offset += line.length + 1;
      continue;
    }
    if (!line.trim()) {
      flush();
      offset += line.length + 1;
      continue;
    }
    const table = isTableRow(line);
    if (pending.length > 0 && table !== pendingIsTable) flush();
    pendingIsTable = table;
    pending.push({ text: line, offset });
    offset += line.length + 1;
  }
  flush();
  return blocks;
}

function splitBlock(block: Block, maximum: number): Piece[] {
  if (block.text.length <= maximum) {
    return [
      {
        text: block.text,
        startOffset: block.startOffset,
        endOffset: block.endOffset,
        isTable: block.isTable,
      },
    ];
  }
  if (block.isTable) return splitTable(block, maximum);
  return splitWords(block.text, block.startOffset, maximum);
}

export function chunkDocumentText(
  source: string,
  options: { targetCharacters: number; overlapCharacters: number },
): TextChunk[] {
  const normalized = source.replace(/\r\n?/g, '\n').trim();
  if (!normalized) return [];
  if (
    options.targetCharacters < 1 ||
    options.overlapCharacters < 0 ||
    options.overlapCharacters >= options.targetCharacters
  ) {
    throw new Error('Chunk target must be positive and larger than the overlap.');
  }

  const output: TextChunk[] = [];
  let body = '';
  let sectionPath: string[] = [];
  let startOffset = 0;
  let endOffset = 0;
  let previousBody = '';
  let previousEndOffset = 0;
  let canOverlap = false;

  const headingPrefix = (path: string[]) => (path.length ? `${path.join(' > ')}\n\n` : '');
  const emit = () => {
    const text = `${headingPrefix(sectionPath)}${body.trim()}`.trim();
    if (text) {
      output.push({
        chunkIndex: output.length,
        text,
        headingPath: sectionPath,
        startOffset,
        endOffset,
      });
      previousBody = body.trim();
      previousEndOffset = endOffset;
      canOverlap = true;
    }
    body = '';
  };

  for (const block of parseBlocks(normalized)) {
    const nextPath = block.headingPath;
    if (body && nextPath.join('\u0000') !== sectionPath.join('\u0000')) {
      emit();
      canOverlap = false;
    }
    sectionPath = nextPath;
    const prefixLength = headingPrefix(sectionPath).length;
    const available = Math.max(1, options.targetCharacters - prefixLength);
    for (const piece of splitBlock(block, available)) {
      const separator = body ? '\n\n' : '';
      if (body && body.length + separator.length + piece.text.length > available) emit();

      if (!body && canOverlap && !piece.isTable && options.overlapCharacters > 0) {
        let overlap = previousBody.slice(-options.overlapCharacters);
        const firstSpace = overlap.indexOf(' ');
        if (firstSpace >= 0) overlap = overlap.slice(firstSpace + 1);
        if (overlap.length + piece.text.length + 2 <= available) {
          body = overlap;
          startOffset = Math.max(0, previousEndOffset - overlap.length);
          endOffset = previousEndOffset;
        }
      }

      const joiner = body ? '\n\n' : '';
      if (body && body.length + joiner.length + piece.text.length > available) emit();
      if (!body) startOffset = piece.startOffset;
      body = body ? `${body}${joiner}${piece.text}` : piece.text;
      endOffset = piece.endOffset;
      canOverlap = !piece.isTable;
      if (piece.text.length >= available) emit();
    }
  }
  emit();
  return output;
}
