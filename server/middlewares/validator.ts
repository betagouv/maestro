import type { Request } from 'express';
import sanitizeHtml from 'sanitize-html';
import { type ZodObject, type ZodType, z } from 'zod';

const sanitizeObject = (obj: unknown): any => {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce(
      (acc, key) => {
        acc[key] = sanitizeObject((obj as Record<string, unknown>)[key]);
        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  return obj;
};

// Les valeurs de req.query / req.params arrivent toujours en string (ou string[]).
// Plutôt que de polluer les schémas Zod partagés avec `z.coerce.*`, on coerce ici
const unwrap = (schema: ZodType): ZodType => {
  let s: ZodType = schema;
  while (
    s instanceof z.ZodOptional ||
    s instanceof z.ZodNullable ||
    s instanceof z.ZodDefault
  ) {
    s = (s as z.ZodOptional<ZodType>).unwrap();
  }
  return s;
};

const coerceLeaf = (value: unknown, schema: ZodType): unknown => {
  if (value === undefined || value === null) return value;
  const inner = unwrap(schema);

  if (inner instanceof z.ZodArray) {
    const arr = Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value.split(',')
        : [value];
    return arr.map((v) => coerceLeaf(v, inner.element as ZodType));
  }
  if (inner instanceof z.ZodDate && typeof value === 'string') {
    return new Date(value);
  }
  if (inner instanceof z.ZodNumber && typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  }
  if (inner instanceof z.ZodBoolean) {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return value;
};

const coerceForSchema = (
  value: unknown,
  schema: ZodType | undefined
): unknown => {
  if (!schema) return value;
  const inner = unwrap(schema);
  if (!(inner instanceof z.ZodObject)) return value;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value;
  }
  const obj = value as Record<string, unknown>;
  const shape = inner.shape as Record<string, ZodType>;
  const result: Record<string, unknown> = { ...obj };
  for (const key of Object.keys(shape)) {
    if (key in obj) {
      result[key] = coerceLeaf(obj[key], shape[key]);
    }
  }
  return result;
};

export const validateRequest = async <T extends ZodObject>(
  req: Request,
  schema: T,
  options: { skipSanitization: boolean }
): Promise<z.infer<T>> => {
  const shape = schema.shape as Record<string, ZodType | undefined>;
  const query = options.skipSanitization
    ? req.query
    : sanitizeObject(req.query);
  const params = options.skipSanitization
    ? req.params
    : sanitizeObject(req.params);
  const body = options.skipSanitization ? req.body : sanitizeObject(req.body);

  return schema.parseAsync({
    body,
    query: coerceForSchema(query, shape.query),
    params: coerceForSchema(params, shape.params)
  });
};
