import { beforeAll, expect, test } from 'vitest';
import { departmentsSeed } from '../database/seeds/departments/departmentsSeed';
import { departmentRepository } from './departmentRepository';

beforeAll(async () => {
  await departmentsSeed()
})
test('getDepartment', async () => {
  const departement = await departmentRepository.getDepartement(0.352688,47.757038)
  expect(departement).toBe('72')
})