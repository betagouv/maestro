import { describe, expect, test } from 'vitest';
import { sampleRepository } from './sampleRepository';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';

describe('count samples', async () => {

  test('count without options', async () => {
    const count = await sampleRepository.count({programmingPlanId: Sample11Fixture.programmingPlanId})
    expect(count).toEqual(4);
  })


  test('count with department option', async () => {
    let count = await sampleRepository.count({programmingPlanId: Sample11Fixture.programmingPlanId,  department: '72'})
    expect(count).toEqual(0);

    count = await sampleRepository.count({programmingPlanId: Sample11Fixture.programmingPlanId,  department: Sample11Fixture.department})
    expect(count).toEqual(1);
  })
});

describe('findMany samples', async () => {

  test('find without options', async () => {
    const samples = await sampleRepository.findMany({programmingPlanId: Sample11Fixture.programmingPlanId})
    expect(samples).toHaveLength(4)
  })


  test('find with department option', async () => {
    let samples = await sampleRepository.findMany({programmingPlanId: Sample11Fixture.programmingPlanId,  department: '72'})
    expect(samples).toEqual([]);

    samples = await sampleRepository.findMany({programmingPlanId: Sample11Fixture.programmingPlanId,  department: Sample11Fixture.department})
    expect(samples).toHaveLength(1);
  })
});
