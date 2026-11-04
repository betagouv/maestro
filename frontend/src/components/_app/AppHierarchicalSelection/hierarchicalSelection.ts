import { includesIgnoringAccents } from 'maestro-shared/utils/utils';

export type Hierarchy<P extends string, C extends string> = {
  parents: P[];
  childrenOf: (parent: P) => C[];
  parentLabel: (parent: P) => string;
  childLabel: (child: C) => string;
};

export type HierarchicalItem<P extends string, C extends string> = {
  parent: P;
  children: C[];
};

export type HierarchicalSelection<
  P extends string,
  C extends string
> = HierarchicalItem<P, C>[];

type ParentOption<P extends string, C extends string> = {
  parent: P;
  children: C[];
  matchedByChild: boolean;
};

export const isChildSelected = <P extends string, C extends string>(
  item: HierarchicalItem<P, C> | undefined,
  child: C
): boolean =>
  item !== undefined &&
  (item.children.length === 0 || item.children.includes(child));

export const removeParent = <P extends string, C extends string>(
  selection: HierarchicalSelection<P, C>,
  parent: P
): HierarchicalSelection<P, C> =>
  selection.filter((item) => item.parent !== parent);

export const toggleParent = <P extends string, C extends string>(
  selection: HierarchicalSelection<P, C>,
  parent: P
): HierarchicalSelection<P, C> => {
  const item = selection.find((item) => item.parent === parent);
  if (item === undefined) {
    return [...selection, { parent, children: [] }];
  }
  return item.children.length === 0
    ? removeParent(selection, parent)
    : selection.map((item) =>
        item.parent === parent ? { parent, children: [] } : item
      );
};

export const toggleChild = <P extends string, C extends string>(
  hierarchy: Hierarchy<P, C>,
  selection: HierarchicalSelection<P, C>,
  parent: P,
  child: C
): HierarchicalSelection<P, C> => {
  const item = selection.find((item) => item.parent === parent);
  const allChildren = hierarchy.childrenOf(parent);
  const children = allChildren.filter(
    (c) => isChildSelected(item, c) !== (c === child)
  );
  if (children.length === 0) {
    return removeParent(selection, parent);
  }
  const next = {
    parent,
    children: children.length === allChildren.length ? [] : children
  };
  return item === undefined
    ? [...selection, next]
    : selection.map((item) => (item.parent === parent ? next : item));
};

export const filterParents = <P extends string, C extends string>(
  hierarchy: Hierarchy<P, C>,
  search: string
): ParentOption<P, C>[] => {
  const matches = (label: string) => includesIgnoringAccents(label, search);

  return hierarchy.parents.flatMap((parent): ParentOption<P, C>[] => {
    const children = hierarchy.childrenOf(parent);
    if (!search.trim() || matches(hierarchy.parentLabel(parent))) {
      return [{ parent, children, matchedByChild: false }];
    }
    const matchingChildren = children.filter((child) =>
      matches(hierarchy.childLabel(child))
    );
    return matchingChildren.length > 0
      ? [{ parent, children: matchingChildren, matchedByChild: true }]
      : [];
  });
};
