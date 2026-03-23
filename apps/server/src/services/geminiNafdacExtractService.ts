import {
  GoogleGenerativeAI,
  SchemaType,
  type ObjectSchema,
} from '@google/generative-ai';
import { logger } from '../utils/logger.js';
import {
  isPlausibleNafdacCertificate,
  normalizeNafdac,
} from '../utils/nafdacFromOcrText.js';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite';

const GEMINI_NAFDAC_RESPONSE_SCHEMA: ObjectSchema = {
  type: SchemaType.OBJECT,
  properties: {
    result: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['FOUND_SINGLE', 'AMBIGUOUS', 'NOT_FOUND', 'UNCLEAR_OCR'],
    },
    nafdac: {
      type: SchemaType.STRING,
      description:
        'Single registration with hyphen when result is FOUND_SINGLE; otherwise empty.',
    },
    candidates: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description:
        'Up to 5 hyphenated registrations when result is AMBIGUOUS; otherwise empty.',
    },
  },
  required: ['result', 'nafdac', 'candidates'],
};

function uniquePlausible(strings: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of strings) {
    const n = normalizeNafdac(String(s));
    if (!n || !isPlausibleNafdacCertificate(n) || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

function buildPrompt(ocrBundle: string): string {
  return `You are an expert at reading Nigerian regulated product labels. Input below is raw text from Google Cloud Vision OCR (typos, broken lines, and reordering are common).

--- OCR TEXT ---
${ocrBundle}
--- END OCR ---

## NAFDAC registration number (what to extract)
The official NAFDAC product registration / certificate number printed on the pack. Common shapes:
- Two digits, hyphen, four or five digits (e.g. 01-5713, 04-81234).
- Letter+digit or short alphanumeric prefix, hyphen, four or five digits (e.g. A1-5645). OCR may use "O" vs "0" — infer from context.
If digits run together without a hyphen, normalize mentally to PREFIX-SUFFIX with a single hyphen before the last 4-5 digits when that matches a label.

## Critical rule (many packs have several similar digit strings)
Labels often show **multiple** hyphenated or digit-heavy values (batch, lot, B/N, MFG, expiry, internal codes). **Do not pick a value only because it looks like a registration.** Prefer the number that appears **next to NAFDAC wording** (same line, following line, after colon).

**Anti-pattern:** Do **not** default to the first XX-XXXX-like string in reading order. If "NAFDAC Reg No" (or similar) points to A1-5645 and an earlier token looks like 03-106, choose A1-5645.

### Strong NAFDAC label cues (case-insensitive; OCR may garble)
NAFDAC Reg No, Nafdac Reg, NAFDAC Registration No, NAFDAC No, NAFDAC Number, NAFDAC Certificate No, N.R.N., NRN when clearly product registration (not unrelated codes).

### Do NOT treat as the NAFDAC registration
Batch, Lot, B/N, L/N, MFG, BB, Exp, Expiry, barcode chunks, phone numbers, SON when labeled SON, net weight.

## Structured result (required)
You must set "result" exactly one of:
- FOUND_SINGLE — one clear registration; set "nafdac" to the hyphenated value, "candidates" [].
- AMBIGUOUS — two or more plausible registrations you cannot disambiguate; set "nafdac" "", "candidates" up to 5 distinct hyphenated values.
- NOT_FOUND — no registration identifiable on the label; "nafdac" "", "candidates" [].
- UNCLEAR_OCR — text too corrupted or cropped to decide; "nafdac" "", "candidates" [].`;
}

export type GeminiNafdacOutcome =
  | { kind: 'one'; nafdac: string }
  | { kind: 'ambiguous'; candidates: string[] }
  | { kind: 'none' }
  | { kind: 'unavailable' };

type GeminiResultField =
  | 'FOUND_SINGLE'
  | 'AMBIGUOUS'
  | 'NOT_FOUND'
  | 'UNCLEAR_OCR';

function parseOutcomeFromStructured(parsed: {
  result?: string;
  nafdac?: string;
  candidates?: unknown;
}): GeminiNafdacOutcome {
  const result = parsed.result as GeminiResultField | undefined;

  const primaryRaw = typeof parsed.nafdac === 'string' ? parsed.nafdac : '';
  const primary = normalizeNafdac(primaryRaw);

  const listRaw = Array.isArray(parsed.candidates)
    ? parsed.candidates.map(String)
    : [];
  const plausibleList = uniquePlausible(listRaw);

  switch (result) {
    case 'FOUND_SINGLE': {
      if (primary && isPlausibleNafdacCertificate(primary)) {
        return { kind: 'one', nafdac: primary };
      }
      if (plausibleList.length === 1) {
        return { kind: 'one', nafdac: plausibleList[0]! };
      }
      if (plausibleList.length > 1) {
        return { kind: 'ambiguous', candidates: plausibleList };
      }
      return { kind: 'none' };
    }
    case 'AMBIGUOUS': {
      if (plausibleList.length > 1) {
        return { kind: 'ambiguous', candidates: plausibleList };
      }
      if (plausibleList.length === 1) {
        return { kind: 'one', nafdac: plausibleList[0]! };
      }
      if (primary && isPlausibleNafdacCertificate(primary)) {
        return { kind: 'one', nafdac: primary };
      }
      return { kind: 'none' };
    }
    case 'NOT_FOUND':
    case 'UNCLEAR_OCR':
      return { kind: 'none' };
    default:
      logger.warn('Gemini NAFDAC: unexpected result field', { result });
      return { kind: 'none' };
  }
}

export async function extractNafdacFromOcrTextWithGemini(
  ocrBundle: string,
): Promise<GeminiNafdacOutcome> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    return { kind: 'unavailable' };
  }

  const trimmed = ocrBundle.trim();
  if (!trimmed) {
    return { kind: 'none' };
  }

  const modelName = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
        responseMimeType: 'application/json',
        responseSchema: GEMINI_NAFDAC_RESPONSE_SCHEMA,
      },
    });

    const result = await model.generateContent(buildPrompt(trimmed));

    let text = result.response.text().trim();
    text = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const parsed = JSON.parse(text) as {
      result?: string;
      nafdac?: string;
      candidates?: unknown;
    };

    return parseOutcomeFromStructured(parsed);
  } catch (err) {
    logger.warn('Gemini NAFDAC extract from OCR text failed', {
      message: String(err),
    });
    return { kind: 'unavailable' };
  }
}
