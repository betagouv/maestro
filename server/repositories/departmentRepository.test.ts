import { beforeAll, expect, test } from 'vitest';
import { departmentsSeed } from '../database/seeds/departments/departmentsSeed';
import { departmentRepository } from './departmentRepository';

beforeAll(async () => {
  await departmentsSeed()
})
test('getDepartment', async () => {
  const departement = await departmentRepository.getDepartement(47.757038,0.352688)
  expect(departement).toBe('72')
})