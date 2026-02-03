import { describe, expect, test } from 'vitest';
import { sachaConfRepository } from './sachaConfRepository';

describe('sachaConfRepository', () => {
  test('get and update version', async () => {
    const conf = await sachaConfRepository.get();
    expect(conf.versionReferenceStandardisees).toBe('v0');

    await sachaConfRepository.update({ versionReferenceStandardisees: 'v2' });

    const updatedConf = await sachaConfRepository.get();
    expect(updatedConf.versionReferenceStandardisees).toBe('v2');
  });
});
