import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { AppSelectionModal } from 'src/components/_app/AppSelectionModal/AppSelectionModal';
import { assert, type Equals } from 'tsafe';
import { AppHierarchicalSelectionRows } from './AppHierarchicalSelectionRows';
import {
  filterParents,
  type HierarchicalSelection,
  type Hierarchy,
  isChildSelected,
  toggleChild,
  toggleParent
} from './hierarchicalSelection';

type Props<P extends string, C extends string> = {
  modal: ReturnType<typeof createModal>;
  title: string;
  searchLabel: string;
  allChildrenLabel: string;
  hierarchy: Hierarchy<P, C>;
  selection: HierarchicalSelection<P, C>;
  onSave: (selection: HierarchicalSelection<P, C>) => void;
};

export const AppHierarchicalSelectionModal = <
  P extends string,
  C extends string
>({
  modal,
  title,
  searchLabel,
  allChildrenLabel,
  hierarchy,
  selection,
  onSave,
  ..._rest
}: Props<P, C>) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [draft, setDraft] = useState<HierarchicalSelection<P, C>>(selection);
  const [search, setSearch] = useState('');
  const [expandedParents, setExpandedParents] = useState<P[]>([]);

  const isOpen = useIsModalOpen(modal, {
    onDisclose: () => setDraft(selection),
    onConceal: () => {
      setSearch('');
      setExpandedParents([]);
    }
  });

  const options = useMemo(
    () => filterParents(hierarchy, search),
    [hierarchy, search]
  );

  const toggleExpanded = (parent: P) =>
    setExpandedParents((expanded) =>
      expanded.includes(parent)
        ? expanded.filter((p) => p !== parent)
        : [...expanded, parent]
    );

  return (
    <AppSelectionModal
      modal={modal}
      title={title}
      buttons={[
        {
          children: 'Tout désélectionner',
          iconId: 'fr-icon-close-circle-line',
          priority: 'tertiary no outline',
          className: 'link-underline',
          doClosesModal: false,
          onClick: () => setDraft([])
        },
        {
          children: 'Enregistrer',
          priority: 'primary',
          doClosesModal: false,
          onClick: () => {
            onSave(draft);
            modal.close();
          }
        }
      ]}
      searchLabel={searchLabel}
      search={search}
      onSearchChange={setSearch}
      selection={
        isOpen && (
          <AppHierarchicalSelectionRows
            hierarchy={hierarchy}
            allChildrenLabel={allChildrenLabel}
            selection={draft}
            onChange={setDraft}
          />
        )
      }
    >
      {options.map(({ parent, children, matchedByChild }) => {
        const selected = draft.find((item) => item.parent === parent);
        const childCount = hierarchy.childrenOf(parent).length;
        const expanded = matchedByChild || expandedParents.includes(parent);
        const parentLabel = hierarchy.parentLabel(parent);
        return (
          <div key={parent} className="border-bottom">
            <div className="d-flex-row d-flex-align-center d-flex-justify-between">
              <Checkbox
                small
                className={clsx(cx('fr-my-1w'), 'checkbox-indeterminate')}
                options={[
                  {
                    label: (
                      <span>
                        <b>{parentLabel}</b>
                        {childCount > 0 && ` (${childCount})`}
                      </span>
                    ),
                    nativeInputProps: {
                      checked: selected?.children.length === 0,
                      ref: (input: HTMLInputElement | null) => {
                        if (input) {
                          input.indeterminate =
                            (selected?.children.length ?? 0) > 0;
                        }
                      },
                      onChange: () => setDraft(toggleParent(draft, parent))
                    }
                  }
                ]}
              />
              {childCount > 0 && (
                <Button
                  iconId={
                    expanded
                      ? 'fr-icon-arrow-up-s-line'
                      : 'fr-icon-arrow-down-s-line'
                  }
                  priority="tertiary no outline"
                  size="small"
                  title={
                    expanded
                      ? `Replier ${parentLabel}`
                      : `Déplier ${parentLabel}`
                  }
                  onClick={() => toggleExpanded(parent)}
                />
              )}
            </div>
            {expanded && (
              <Checkbox
                small
                className={clsx(
                  cx('fr-ml-3w', 'fr-mb-1w'),
                  'checkbox-list-compact'
                )}
                options={children.map((child) => ({
                  label: hierarchy.childLabel(child),
                  nativeInputProps: {
                    checked: isChildSelected(selected, child),
                    onChange: () =>
                      setDraft(toggleChild(hierarchy, draft, parent, child))
                  }
                }))}
              />
            )}
          </div>
        );
      })}
    </AppSelectionModal>
  );
};
