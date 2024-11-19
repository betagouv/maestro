import { NextFunction, Request, Response } from 'express';

const parseCommaSeparatedParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.query = Object.fromEntries(
    Object.entries(req.query).map(([key, value]) => {
      if (typeof value === 'string' && value.includes(',')) {
        // Transforme une chaîne séparée par des virgules en tableau
        return [key, value.split(',').map((item) => item.trim())];
      }
      return [key, value];
    })
  );
  next();
};

export default parseCommaSeparatedParams;
