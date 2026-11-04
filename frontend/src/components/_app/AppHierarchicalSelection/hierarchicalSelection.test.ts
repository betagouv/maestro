import { describe, expect, test } from 'vitest';
import {
  filterParents,
  type Hierarchy,
  isChildSelected,
  removeParent,
  toggleChild,
  toggleParent
} from './hierarchicalSelection';

type Parent = 'Fruits' | 'Légumes' | 'Épices';
type Child = 'Pomme' | 'Poire' | 'Prune' | 'Carotte';

const childrenByParent: Record<Parent, Child[]> = {
  Fruits: ['Pomme', 'Poire', 'Prune'],
  Légumes: ['Carotte'],
  Épices: []
};

const hierarchy: Hierarchy<Parent, Child> = {
  parents: ['Fruits', 'Légumes', 'Épices'],
  childrenOf: (parent) => childrenByParent[parent],
  parentLabel: (parent) => parent,
  childLabel: (child) => child
};

describe('isChildSelected', () => {
  test('should select every child of a whole parent', () => {
    expect(isChildSelected({ parent: 'Fruits', children: [] }, 'Poire')).toBe(
      true
    );
  });

  test('should select only the listed children', () => {
    expect(
      isChildSelected({ parent: 'Fruits', children: ['Pomme'] }, 'Poire')
    ).toBe(false);
    expect(isChildSelected(undefined, 'Poire')).toBe(false);
  });
});

describe('removeParent', () => {
  test('should remove the parent with its children', () => {
    expect(
      removeParent(
        [
          { parent: 'Légumes', children: [] },
          { parent: 'Fruits', children: ['Pomme'] }
        ],
        'Fruits'
      )
    ).toStrictEqual([{ parent: 'Légumes', children: [] }]);
  });
});

describe('toggleParent', () => {
  test('should select the whole unselected parent', () => {
    expect(toggleParent([], 'Fruits')).toStrictEqual([
      { parent: 'Fruits', children: [] }
    ]);
  });

  test('should select the whole partially selected parent', () => {
    expect(
      toggleParent(
        [
          { parent: 'Fruits', children: ['Pomme', 'Poire'] },
          { parent: 'Légumes', children: [] }
        ],
        'Fruits'
      )
    ).toStrictEqual([
      { parent: 'Fruits', children: [] },
      { parent: 'Légumes', children: [] }
    ]);
  });

  test('should remove a whole parent', () => {
    expect(
      toggleParent(
        [
          { parent: 'Légumes', children: [] },
          { parent: 'Fruits', children: [] }
        ],
        'Fruits'
      )
    ).toStrictEqual([{ parent: 'Légumes', children: [] }]);
  });
});

describe('toggleChild', () => {
  test('should add the parent when checking one of its children', () => {
    expect(
      toggleChild(
        hierarchy,
        [{ parent: 'Légumes', children: [] }],
        'Fruits',
        'Poire'
      )
    ).toStrictEqual([
      { parent: 'Légumes', children: [] },
      { parent: 'Fruits', children: ['Poire'] }
    ]);
  });

  test('should keep the children in the hierarchy order', () => {
    expect(
      toggleChild(
        hierarchy,
        [{ parent: 'Fruits', children: ['Prune'] }],
        'Fruits',
        'Pomme'
      )
    ).toStrictEqual([{ parent: 'Fruits', children: ['Pomme', 'Prune'] }]);
  });

  test('should list the other children when unchecking a child of a whole parent', () => {
    expect(
      toggleChild(
        hierarchy,
        [{ parent: 'Fruits', children: [] }],
        'Fruits',
        'Poire'
      )
    ).toStrictEqual([{ parent: 'Fruits', children: ['Pomme', 'Prune'] }]);
  });

  test('should select the whole parent when checking its last unchecked child', () => {
    expect(
      toggleChild(
        hierarchy,
        [{ parent: 'Fruits', children: ['Pomme', 'Prune'] }],
        'Fruits',
        'Poire'
      )
    ).toStrictEqual([{ parent: 'Fruits', children: [] }]);
  });

  test('should select the whole parent when checking its only child', () => {
    expect(toggleChild(hierarchy, [], 'Légumes', 'Carotte')).toStrictEqual([
      { parent: 'Légumes', children: [] }
    ]);
  });

  test('should remove the parent when unchecking its last checked child', () => {
    expect(
      toggleChild(
        hierarchy,
        [
          { parent: 'Légumes', children: [] },
          { parent: 'Fruits', children: ['Pomme'] }
        ],
        'Fruits',
        'Pomme'
      )
    ).toStrictEqual([{ parent: 'Légumes', children: [] }]);
  });
});

describe('filterParents', () => {
  test('should list every parent with all its children without search', () => {
    expect(filterParents(hierarchy, ' ')).toStrictEqual([
      {
        parent: 'Fruits',
        children: ['Pomme', 'Poire', 'Prune'],
        matchedByChild: false
      },
      { parent: 'Légumes', children: ['Carotte'], matchedByChild: false },
      { parent: 'Épices', children: [], matchedByChild: false }
    ]);
  });

  test('should keep all the children of a parent matching by label, ignoring accents and case', () => {
    expect(filterParents(hierarchy, 'LEGUM')).toStrictEqual([
      { parent: 'Légumes', children: ['Carotte'], matchedByChild: false }
    ]);
  });

  test('should keep only the matching children of a parent matching by child', () => {
    expect(filterParents(hierarchy, 'pr')).toStrictEqual([
      { parent: 'Fruits', children: ['Prune'], matchedByChild: true }
    ]);
  });
});
