import { unzipSync, zipSync } from 'fflate';

export const zip = (files: Record<string, Uint8Array>): Uint8Array =>
  zipSync(files);

export const unzip = (archive: Uint8Array): Record<string, Uint8Array> =>
  unzipSync(archive);
