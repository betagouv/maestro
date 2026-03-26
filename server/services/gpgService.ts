import child_process from 'node:child_process';
import { rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { v4 as uuidv4 } from 'uuid';
import { kysely } from '../repositories/kysely';

const exec = promisify(child_process.exec);

export const initGpgForSacha = async (): Promise<void> => {
  const laboratories = await kysely
    .selectFrom('laboratories')
    .select('sachaGpgPublicKey')
    .where('sachaGpgPublicKey', 'is not', null)
    .execute();

  for (const laboratory of laboratories) {
    if (laboratory.sachaGpgPublicKey) {
      await importPublicKey(laboratory.sachaGpgPublicKey);
    }
  }
};

const importPublicKey = async (publicKey: string) => {
  const fileName = `${uuidv4()}.gpg`;

  const filePath = path.join(tmpdir(), fileName);

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
