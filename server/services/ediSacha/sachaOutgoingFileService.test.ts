import { Readable } from 'node:stream';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { SachaOutgoingFileId } from '../../repositories/kysely.type';
import { sachaOutgoingFileRepository } from '../../repositories/sachaOutgoingFileRepository';
import { documentService } from '../documentService';
import { tchapService } from '../tchapService';
import { unzip } from '../zipService';
import { depositSachaFiles } from './sachaOutgoingFileService';

vi.mock('../../repositories/sachaOutgoingFileRepository', () => ({
  sachaOutgoingFileRepository: {
    findUndeposited: vi.fn(),
    markDeposited: vi.fn()
  }
}));
vi.mock('../documentService', () => ({
  documentService: { getDocument: vi.fn() }
}));
vi.mock('../tchapService', () => ({
  tchapService: { send: vi.fn() }
}));

const dateNow = new Date('2026-11-17T14:00:00+01:00').getTime();

const da01Files = [
  {
    id: '00000000-0000-0000-0000-0000000000f1' as SachaOutgoingFileId,
    fileName: 'DA01DDSV41LVD041261117103000000',
    documentId: 'doc-1',
    sachaSigle: 'lvd041'
  },
  {
    id: '00000000-0000-0000-0000-0000000000f2' as SachaOutgoingFileId,
    fileName: 'DA01DDSV13LVD010261117113000000',
    documentId: 'doc-2',
    sachaSigle: 'LVD010'
  }
];

const an01Files = [
  {
    id: '00000000-0000-0000-0000-0000000000f3' as SachaOutgoingFileId,
    fileName: 'AN01DDSV41LVD041261117120000000',
    documentId: 'doc-3',
    sachaSigle: 'LVD041'
  }
];

const sftpClient = { put: vi.fn(), delete: vi.fn() };

const putPaths = () => sftpClient.put.mock.calls.map(([, remote]) => remote);

describe('depositSachaFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sftpClient.put.mockResolvedValue('ok');
    sftpClient.delete.mockResolvedValue('ok');
    vi.mocked(sachaOutgoingFileRepository.findUndeposited).mockImplementation(
      async (fileType) => (fileType === 'DA01' ? da01Files : an01Files)
    );
    vi.mocked(documentService.getDocument).mockImplementation(
      async (documentId) =>
        ({
          file: Readable.from(Buffer.from(`<xml>${documentId}</xml>`))
        }) as never
    );
  });

  test('dépose un zip par type, un dossier par labo, puis son déclencheur vide', async () => {
    await depositSachaFiles(sftpClient as never, dateNow);

    expect(putPaths()).toEqual([
      '/uploads/Maestro-Sigal-Labo/DA01/DA01_2611171400.zip',
      '/uploads/Maestro-Sigal-Labo/DA01/Decl_DA01_2611171400',
      '/uploads/Maestro-Sigal-Labo/AN01/AN01_2611171400.zip',
      '/uploads/Maestro-Sigal-Labo/AN01/Decl_AN01_2611171400'
    ]);

    const entries = unzip(sftpClient.put.mock.calls[0][0]);
    expect(
      Object.fromEntries(
        Object.entries(entries).map(([name, content]) => [
          name,
          Buffer.from(content).toString()
        ])
      )
    ).toEqual({
      'LVD041/DA01DDSV41LVD041261117103000000.xml': '<xml>doc-1</xml>',
      'LVD010/DA01DDSV13LVD010261117113000000.xml': '<xml>doc-2</xml>'
    });
    expect(sftpClient.put.mock.calls[1][0]).toEqual(Buffer.alloc(0));

    expect(sachaOutgoingFileRepository.markDeposited).toHaveBeenCalledWith(
      da01Files.map(({ id }) => id),
      'DA01_2611171400.zip',
      expect.any(Date)
    );
    expect(sachaOutgoingFileRepository.markDeposited).toHaveBeenCalledWith(
      an01Files.map(({ id }) => id),
      'AN01_2611171400.zip',
      expect.any(Date)
    );
  });

  test('ne dépose rien quand aucun fichier n’attend', async () => {
    vi.mocked(sachaOutgoingFileRepository.findUndeposited).mockResolvedValue(
      []
    );

    await depositSachaFiles(sftpClient as never, dateNow);

    expect(sftpClient.put).not.toHaveBeenCalled();
    expect(sachaOutgoingFileRepository.markDeposited).not.toHaveBeenCalled();
  });

  test('échec du zip : rien n’est marqué déposé, alerte, et l’autre type part quand même', async () => {
    sftpClient.put.mockRejectedValueOnce(new Error('SFTP indisponible'));

    await depositSachaFiles(sftpClient as never, dateNow);

    expect(putPaths()).not.toContain(
      '/uploads/Maestro-Sigal-Labo/DA01/Decl_DA01_2611171400'
    );
    expect(sachaOutgoingFileRepository.markDeposited).toHaveBeenCalledOnce();
    expect(sachaOutgoingFileRepository.markDeposited).toHaveBeenCalledWith(
      an01Files.map(({ id }) => id),
      'AN01_2611171400.zip',
      expect.any(Date)
    );
    expect(tchapService.send).toHaveBeenCalledWith(
      expect.stringContaining('SFTP indisponible')
    );
  });

  test('échec du déclencheur : le zip orphelin est supprimé, rien n’est marqué déposé', async () => {
    sftpClient.put
      .mockResolvedValueOnce('ok')
      .mockRejectedValueOnce(new Error('quota dépassé'));

    await depositSachaFiles(sftpClient as never, dateNow);

    expect(sftpClient.delete).toHaveBeenCalledWith(
      '/uploads/Maestro-Sigal-Labo/DA01/DA01_2611171400.zip',
      true
    );
    expect(sachaOutgoingFileRepository.markDeposited).not.toHaveBeenCalledWith(
      da01Files.map(({ id }) => id),
      expect.anything(),
      expect.anything()
    );
    expect(tchapService.send).toHaveBeenCalledWith(
      expect.stringContaining('quota dépassé')
    );
  });
});
