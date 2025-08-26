import child_process from 'node:child_process';
import { rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const exec = promisify(child_process.exec);

export const importPublicKey = async (publicKey: string) => {
  const fileName = uuidv4();

  const filePath = path.join(tmpdir(), `${fileName}.gpg`);

  await writeFile(
    filePath,
    `-----BEGIN PGP PUBLIC KEY BLOCK-----
    
${publicKey}
-----END PGP PUBLIC KEY BLOCK-----
  `
  );

  await exec(`gpg --import ${fileName}`, {
    cwd: tmpdir()
  });

  await rm(filePath);
  return;
};

export const encryptFile = async (
  filePath: string,
  recipientEmail: string,
  outputFilename: string
): Promise<string> => {
  await exec(
    `gpg --output ${outputFilename} --encrypt --recipient ${recipientEmail} ${filePath}`,
    {
      cwd: tmpdir()
    }
  );

  return path.join(tmpdir(), outputFilename);
};
