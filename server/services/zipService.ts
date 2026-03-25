import child_process from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(child_process.exec);

export const zip = async (
  folderToZipPath: string,
  desiredNameOfZipFile: string
): Promise<string> => {
  await exec(`zip -r ${desiredNameOfZipFile} *`, {
    cwd: folderToZipPath
  });

  return path.join(folderToZipPath, desiredNameOfZipFile);
};

export const unzip = async (
  folderToUnzipPath: string,
  archiveName: string
): Promise<void> => {
  await exec(`unzip ${archiveName}`, {
    cwd: folderToUnzipPath
  });
};
