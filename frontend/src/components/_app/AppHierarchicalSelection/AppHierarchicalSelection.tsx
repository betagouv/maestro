import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import AppRequiredInput from 'src/components/_app/AppRequired/AppRequiredInput';
import { assert, type Equals } from 'tsafe';
import { AppHierarchicalSelectionModal } from './AppHierarchicalSelectionModal';
import { AppHierarchicalSelectionRows } from './AppHierarchicalSelectionRows';
import type { HierarchicalSelection, Hierarchy } from './hierarchicalSelection';

type Props<P extends string, C extends string> = {
  modal: ReturnType<typeof createModal>;
  label: ReactNode;
  required: boolean;
  disabled: boolean;
  errorMessage: string | undefined;
  texts: {
    add: string;
    edit: string;
    modalTitle: string;
    search: string;
    allChildren: string;
  };
  hierarchy: Hierarchy<P, C>;
  selection: HierarchicalSelection<P, C>;
  header?: ReactNode;
  onChange: (selection: HierarchicalSelection<P, C>) => void;
};

export const AppHierarchicalSelection = <P extends string, C extends string>({
  modal,
  label,
  required,
  disabled,
  errorMessage,
  texts,
  hierarchy,
  selection,
  header,
  onChange,
  ..._rest
}: Props<P, C>) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div>
      <span className={cx('fr-label', 'fr-mb-1w')}>
        {label}
        {required && <AppRequiredInput />}
      </span>
      {selection.length === 0 ? (
        !disabled && (
          <Button
            iconId="fr-icon-add-line"
            priority="secondary"
            size="small"
            onClick={() => modal.open()}
          >
            {texts.add}
          </Button>
        )
      ) : (
        <>
          {header}
          <AppHierarchicalSelectionRows
            hierarchy={hierarchy}
            allChildrenLabel={texts.allChildren}
            selection={selection}
            disabled={disabled}
            onChange={onChange}
          />
          {!disabled && (
            <div className={clsx('border-top', cx('fr-pt-2w'))}>
              <Button
                iconId="fr-icon-edit-line"
                priority="secondary"
                size="small"
                title={texts.edit}
                onClick={() => modal.open()}
              />
            </div>
          )}
        </>
      )}
      {errorMessage && <p className={cx('fr-error-text')}>{errorMessage}</p>}
      <AppHierarchicalSelectionModal
        modal={modal}
        title={texts.modalTitle}
        searchLabel={texts.search}
        allChildrenLabel={texts.allChildren}
        hierarchy={hierarchy}
        selection={selection}
        onSave={onChange}
      />
    </div>
  );
};
