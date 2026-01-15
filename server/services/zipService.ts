import child_process from 'node:child_process';
import { promisify } from 'node:util';
import path from 'path';
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
