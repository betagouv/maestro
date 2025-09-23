import { Request } from 'express';
import sanitizeHtml from 'sanitize-html';
import { z, ZodObject } from 'zod';

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
        return {
          ...acc,
          [key]: sanitizeObject((obj as Record<string, unknown>)[key])
        };
      },
      {} as Record<string, unknown>
    );
  }

  return obj;
};


export  const validateRequest = async <T extends ZodObject>(
  req: Request,
  schema: T,
  options: { skipSanitization: boolean } = { skipSanitization: false }
): Promise<z.infer<T>> => {
    return  schema.parseAsync({
      body: options.skipSanitization ? req.body : sanitizeObject(req.body),
      query: options.skipSanitization ? req.query : sanitizeObject(req.query),
      params: options.skipSanitization
        ? req.params
        : sanitizeObject(req.params)
    });


}

