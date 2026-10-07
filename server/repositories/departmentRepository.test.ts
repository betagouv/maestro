import { beforeAll, expect, test } from 'vitest';
import { seedTestDepartments } from '../test/testUtils';
import { departmentRepository } from './departmentRepository';

beforeAll(async () => {
  await seedTestDepartments();
});
test('getDepartment', async () => {
  const department = await departmentRepository.getDepartment(
    47.757038,
    0.352688
  );
  expect(department).toBe('72');
});
