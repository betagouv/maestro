import { z } from 'zod';

export const AddressSearchResult = z.object({
  geometry: z.object({
    type: z.string(),
    coordinates: z.array(z.number()),
  }),
  properties: z.object({
    label: z.string(),
    score: z.number(),
    housenumber: z.string().nullish(),
    id: z.string(),
    type: z.string(),
    name: z.string(),
    postcode: z.string(),
    citycode: z.string(),
    x: z.number(),
    y: z.number(),
    city: z.string(),
    context: z.string(),
    importance: z.number(),
    street: z.string().nullish(),
  }),
});

export const AddressSearchResults = z.object({
  type: z.string(),
  version: z.string(),
  features: z.array(AddressSearchResult),
  attribution: z.string(),
  licence: z.string(),
  query: z.string(),
  limit: z.number(),
});

export type AddressSearchResult = z.infer<typeof AddressSearchResult>;
export type AddressSearchResults = z.infer<typeof AddressSearchResults>;
