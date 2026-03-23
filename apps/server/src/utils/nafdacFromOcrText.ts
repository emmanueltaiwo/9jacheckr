export function normalizeNafdac(raw: string): string {
  const t = raw.trim().toUpperCase().replace(/\s+/g, '').replace(/[–—]/g, '-');
  if (!t) return '';
  if (t.includes('-')) return t;

  if (/^\d+$/.test(t)) {
    if (t.length === 6) return `${t.slice(0, 2)}-${t.slice(2)}`;
    if (t.length === 7) return `${t.slice(0, 3)}-${t.slice(3)}`;
  }

  return t;
}

export function isPlausibleNafdacCertificate(n: string): boolean {
  const t = normalizeNafdac(n);
  if (!t || !t.includes('-')) return false;
  const parts = t.split('-');
  if (parts.length !== 2) return false;
  const [left, right] = parts;
  if (!left || !right) return false;

  if (!/^\d{4,5}$/.test(right)) return false;
  if (/^\d{2}$/.test(left)) return true;
  if (/^[A-Z]\d$/i.test(left)) return true;
  if (/^[A-Z]{2}$/i.test(left)) return true;
  if (/^[A-Z][A-Z0-9]{0,2}$/i.test(left) && left.length <= 3) return true;

  return false;
}

export function extractNafdacCandidates(ocrText: string): string[] {
  const s = ocrText.replace(/\r\n/g, '\n');
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (raw: string) => {
    const n = normalizeNafdac(raw);
    if (!n || seen.has(n)) return;
    seen.add(n);
    out.push(n);
  };

  const reDash = /\d{2}\s*[-–—]?\s*\d{4,5}/g;
  let m: RegExpExecArray | null;
  while ((m = reDash.exec(s)) !== null) {
    push(m[0].replace(/\s+/g, ''));
  }

  const re6 = /\d{6}(?!\d)/g;
  while ((m = re6.exec(s)) !== null) {
    push(m[0]);
  }

  const re7 = /\d{7}(?!\d)/g;
  while ((m = re7.exec(s)) !== null) {
    push(m[0]);
  }

  return out;
}

type VisionSymbol = { text?: string | null };
type VisionWord = { symbols?: VisionSymbol[] | null };
type VisionParagraph = { words?: VisionWord[] | null };
type VisionBlock = { paragraphs?: VisionParagraph[] | null };
type VisionPage = { blocks?: VisionBlock[] | null };

export type VisionFullTextAnnotation = {
  text?: string | null;
  pages?: VisionPage[] | null;
};

function visionWordStrings(
  annotation: VisionFullTextAnnotation | null | undefined,
): string[] {
  const out: string[] = [];
  for (const page of annotation?.pages ?? []) {
    for (const block of page.blocks ?? []) {
      for (const para of block.paragraphs ?? []) {
        for (const word of para.words ?? []) {
          const t = (word.symbols ?? []).map((s) => s.text ?? '').join('');
          if (t.trim()) out.push(t);
        }
      }
    }
  }
  return out;
}

const GEMINI_OCR_MAX_CHARS = 28_000;

export function formatVisionOcrForGemini(
  annotation: VisionFullTextAnnotation | null | undefined,
): string {
  const full = annotation?.text?.trim() ?? '';
  const words = visionWordStrings(annotation);
  const lineWords = words.join(' ');
  if (!full && !lineWords) return '';
  const parts = [
    '## Document text (Google Cloud Vision fullTextAnnotation)',
    full || '(none)',
    '',
    '## Words in reading order (OCR tokens)',
    lineWords || '(none)',
  ];
  let s = parts.join('\n');
  if (s.length > GEMINI_OCR_MAX_CHARS) {
    s = `${s.slice(0, GEMINI_OCR_MAX_CHARS)}\n...[truncated]`;
  }
  return s;
}

function mergeUniqueCandidates(chunks: string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  const add = (list: string[]) => {
    for (const c of list) {
      if (!seen.has(c)) {
        seen.add(c);
        ordered.push(c);
      }
    }
  };
  for (const chunk of chunks) {
    if (chunk.trim()) add(extractNafdacCandidates(chunk));
  }
  return ordered;
}

export function extractNafdacCandidatesFromVisionAnnotation(
  annotation: VisionFullTextAnnotation | null | undefined,
): string[] {
  const full = annotation?.text?.trim() ?? '';
  const words = visionWordStrings(annotation);
  const joined = words.join(' ');

  const chunks: string[] = [full, joined];
  for (const w of words) {
    chunks.push(w);
  }

  const maxSpan = Math.min(6, Math.max(0, words.length));
  for (let i = 0; i < words.length; i++) {
    for (let span = 2; span <= maxSpan && i + span <= words.length; span++) {
      const slice = words.slice(i, i + span);
      chunks.push(slice.join(''));
      chunks.push(slice.join(' '));
      chunks.push(slice.join('-'));
    }
  }

  return mergeUniqueCandidates(chunks);
}
