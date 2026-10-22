import { expect, test } from 'vitest';
import { convertKeysToCamelCase, includesIgnoringAccents } from './utils';

test('includesIgnoringAccents', () => {
  expect(includesIgnoringAccents('Hélène Dupré', ' helene ')).toBe(true);
  expect(includesIgnoringAccents('Helene Dupre', 'HÉLÈNE')).toBe(true);
  expect(includesIgnoringAccents('Hélène Dupré', 'martin')).toBe(false);
});

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
  expect(
    convertKeysToCamelCase({ fooFii: 'fooFii', foo_foo: 'foo_foo' })
  ).toMatchInlineSnapshot(`
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
