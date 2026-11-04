import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { assert, type Equals } from 'tsafe';
import {
  type HierarchicalSelection,
  type Hierarchy,
  removeParent,
  toggleChild
} from './hierarchicalSelection';
import './AppHierarchicalSelection.scss';

type Props<P extends string, C extends string> = {
  hierarchy: Hierarchy<P, C>;
  allChildrenLabel: string;
  selection: HierarchicalSelection<P, C>;
  disabled?: boolean;
  onChange: (selection: HierarchicalSelection<P, C>) => void;
};

export const AppHierarchicalSelectionRows = <
  P extends string,
  C extends string
>({
  hierarchy,
  allChildrenLabel,
  selection,
  disabled,
  onChange,
  ..._rest
}: Props<P, C>) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div style={{ width: '100%' }}>
      {selection.map(({ parent, children }, index) => (
        <div
          key={parent}
          className={clsx(
            'd-flex-row',
            'd-flex-justify-between',
            cx('fr-py-1w'),
            index > 0 && 'border-top'
          )}
          style={{ gap: '1rem' }}
        >
          <div>
            {disabled ? (
              <Tag small>{hierarchy.parentLabel(parent)}</Tag>
            ) : (
              <Tag
                small
                dismissible
                nativeButtonProps={{
                  onClick: () => onChange(removeParent(selection, parent))
                }}
              >
                {hierarchy.parentLabel(parent)}
              </Tag>
            )}
          </div>
          <div
            className={clsx('d-flex-row', 'd-flex-justify-end')}
            style={{ flexWrap: 'wrap', gap: '0.5rem' }}
          >
            {children.length === 0 ? (
              <i className={clsx(cx('fr-text--sm', 'fr-mb-0'), 'text-grey')}>
                {allChildrenLabel}
              </i>
            ) : (
              children.map((child) =>
                disabled ? (
                  <Tag
                    key={child}
                    small
                    className="app-hierarchical-selection__child-tag"
                  >
                    {hierarchy.childLabel(child)}
                  </Tag>
                ) : (
                  <Tag
                    key={child}
                    small
                    dismissible
                    className="app-hierarchical-selection__child-tag"
                    nativeButtonProps={{
                      onClick: () =>
                        onChange(
                          toggleChild(hierarchy, selection, parent, child)
                        )
                    }}
                  >
                    {hierarchy.childLabel(child)}
                  </Tag>
                )
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
