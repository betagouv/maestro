import { pluralize } from 'maestro-frontend/src/utils/stringUtils';
import { expect, test } from 'vitest';
import { convertKeysToCamelCase } from './utils';

test('convertKeysToCamelCase', () => {
  expect(convertKeysToCamelCase({})).toMatchInlineSnapshot(`{}`);
  expect(convertKeysToCamelCase({ foo: 'foo' })).toMatchInlineSnapshot(`
      {
        "foo": "foo",
      }
    `);
  expect(convertKeysToCamelCase({ fooFoo: 'fooFoo' })).toMatchInlineSnapshot(`
      {
        "fooFoo": "fooFoo",
      }
    `);
  expect(convertKeysToCamelCase({ foo_foo: 'foo_foo' })).toMatchInlineSnapshot(`
      {
        "fooFoo": "foo_foo",
      }
    `);
  expect(convertKeysToCamelCase({ fooFii: 'fooFii', foo_foo: 'foo_foo' }))
    .toMatchInlineSnapshot(`
      {
        "fooFii": "fooFii",
        "fooFoo": "foo_foo",
      }
    `);
  expect(
    convertKeysToCamelCase({
      foo_foo: {
        foo_foo: 'foo'
      }
    })
  ).toMatchInlineSnapshot(`
        {
          "fooFoo": {
            "fooFoo": "foo",
          },
        }
      `);
  expect(
    convertKeysToCamelCase({
      foo_foo: [
        {
          foo_foo: 'foo'
        }
      ]
    })
  ).toMatchInlineSnapshot(`
        {
          "fooFoo": [
            {
              "fooFoo": "foo",
            },
          ],
        }
      `);
  expect(convertKeysToCamelCase({ foo_foo: [3] })).toMatchInlineSnapshot(`
      {
        "fooFoo": [
          3,
        ],
      }
    `);
});

test('pluralize', () => {
  expect(pluralize(1)('prélèvement')).toBe('prélèvement');
  expect(pluralize(2)('prélèvement')).toBe('prélèvements');
  expect(pluralize(1)('prélèvement attribué')).toBe('prélèvement attribué');
  expect(pluralize(2)('prélèvement attribué')).toBe('prélèvements attribués');
  expect(pluralize(1, { preserveCount: true })('prélèvement attribué')).toBe(
    '1 prélèvement attribué'
  );
  expect(pluralize(2, { preserveCount: true })('prélèvement attribué')).toBe(
    '2 prélèvements attribués'
  );
  expect(
    pluralize(1, {
      replacements: [{ old: 'beau', new: 'beaux' }],
      ignores: ['à', 'attribuer']
    })('beau prélèvement à attribuer')
  ).toBe('beau prélèvement à attribuer');
  expect(
    pluralize(2, {
      preserveCount: true,
      replacements: [{ old: 'beau', new: 'beaux' }],
      ignores: ['à', 'attribuer']
    })('beau prélèvement à attribuer')
  ).toBe('2 beaux prélèvements à attribuer');
});
