import { describe, expect, test } from 'vitest';
import { sachaConfRepository } from './sachaConfRepository';

describe('sachaConfRepository', () => {
  test('get and update version', async () => {
    const conf = await sachaConfRepository.get();
    expect(conf.versionReferenceStandardisees).toBe('v0');
    expect(conf.versionReferencePrescripteur).toBe('v0');

    await sachaConfRepository.update({ versionReferenceStandardisees: 'v2' });

    let updatedConf = await sachaConfRepository.get();
    expect(updatedConf.versionReferenceStandardisees).toBe('v2');
    expect(updatedConf.versionReferencePrescripteur).toBe('v0');

    await sachaConfRepository.update({ versionReferencePrescripteur: 'v2' });

    updatedConf = await sachaConfRepository.get();
    expect(updatedConf.versionReferenceStandardisees).toBe('v2');
    expect(updatedConf.versionReferencePrescripteur).toBe('v2');
  });
});
