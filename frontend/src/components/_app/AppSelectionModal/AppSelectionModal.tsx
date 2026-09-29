import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import type { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import type React from 'react';
import type { ReactNode } from 'react';
import { assert, type Equals } from 'tsafe';
import './AppSelectionModal.scss';

type Props = Pick<ModalProps, 'title' | 'iconId' | 'buttons'> & {
  modal: {
    Component: (props: ModalProps) => React.JSX.Element;
  };
  listHeader?: ReactNode;
  searchLabel: string;
  search: string;
  onSearchChange: (search: string) => void;
  selection: ReactNode;
  children: ReactNode;
};

export const AppSelectionModal = ({
  modal,
  title,
  iconId,
  buttons,
  listHeader,
  searchLabel,
  search,
  onSearchChange,
  selection,
  children,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <modal.Component
      title={title}
      iconId={iconId}
      className="app-selection-modal"
      concealingBackdrop={false}
      size="large"
      buttons={buttons}
    >
      <div className="app-selection-modal__layout">
        <div className="app-selection-modal__list">
          <div
            className={clsx(cx('fr-mb-2w'), 'app-selection-modal__list-search')}
          >
            {listHeader}
            <div className="search-input-wrapper">
              <Input
                label={searchLabel}
                hideLabel
                iconId="fr-icon-search-line"
                nativeInputProps={{
                  placeholder: searchLabel,
                  value: search,
                  onChange: (e) => onSearchChange(e.target.value)
                }}
              />
              {search && (
                <Button
                  iconId="fr-icon-close-line"
                  priority="tertiary no outline"
                  size="small"
                  title="Effacer la recherche"
                  className="search-input-clear"
                  onClick={() => onSearchChange('')}
                />
              )}
            </div>
          </div>
          <div className="app-selection-modal__list-body">{children}</div>
        </div>
        <div className="app-selection-modal__selection">{selection}</div>
      </div>
    </modal.Component>
  );
};
