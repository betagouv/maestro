import { z } from 'zod';

z.config({
  customError: (issue) => {
    if (issue.code === 'invalid_value') {
      return `Invalid option: got ${JSON.stringify(issue.input)}, expected one of ${issue.values
        .map((v) => JSON.stringify(v))
        .join('|')} (path: ${(issue.path ?? []).join('.')})`;
    }
  }
});
