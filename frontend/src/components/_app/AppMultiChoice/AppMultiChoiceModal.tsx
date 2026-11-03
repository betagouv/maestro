import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { includesIgnoringAccents } from 'maestro-shared/utils/utils';
import { useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { AppSelectionModal } from '../AppSelectionModal/AppSelectionModal';
import {
  type AppMultiChoiceOption,
  orderedValues
} from './AppMultiChoiceOption';

type Props<T extends string> = {
  modal: ReturnType<typeof createModal>;
  title: string;
  options: AppMultiChoiceOption<T>[];
  values: T[];
  onSave: (values: T[]) => void;
};

export const AppMultiChoiceModal = <T extends string>({
  modal,
  title,
  options,
  values,
  onSave,
  ..._rest
}: Props<T>) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [draft, setDraft] = useState<T[]>(values);
  const [search, setSearch] = useState('');

  useIsModalOpen(modal, {
    onDisclose: () => setDraft(values),
    onConceal: () => setSearch('')
  });

  const visibleOptions = options.filter((option) =>
    includesIgnoringAccents(option.label, search)
  );
  const visibleSelectedCount = visibleOptions.filter((option) =>
    draft.includes(option.value)
  ).length;
  const allVisibleSelected =
    visibleOptions.length > 0 && visibleSelectedCount === visibleOptions.length;

  const toggleVisible = () => {
    const visibleValues = visibleOptions.map((option) => option.value);
    setDraft(
      orderedValues(
        options,
        allVisibleSelected
          ? draft.filter((value) => !visibleValues.includes(value))
          : [...draft, ...visibleValues]
      )
    );
  };

  const toggle = (value: T) =>
    setDraft(
      draft.includes(value)
        ? draft.filter((_) => _ !== value)
        : orderedValues(options, [...draft, value])
    );

  return (
    <AppSelectionModal
      modal={modal}
      title={title}
      buttons={[
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
      listHeader={
        <Checkbox
          small
          className={clsx(cx('fr-mb-1w'), 'checkbox-indeterminate')}
          options={[
            {
              label: `Tout sélectionner (${visibleOptions.length})`,
              nativeInputProps: {
                checked: allVisibleSelected,
                disabled: visibleOptions.length === 0,
                ref: (input: HTMLInputElement | null) => {
                  if (input) {
                    input.indeterminate =
                      visibleSelectedCount > 0 && !allVisibleSelected;
                  }
                },
                onChange: toggleVisible
              }
            }
          ]}
        />
      }
      searchLabel="Rechercher une option"
      search={search}
      onSearchChange={setSearch}
      selection={orderedValues(options, draft).map((value) => (
        <Tag
          key={value}
          small
          dismissible
          nativeButtonProps={{ onClick: () => toggle(value) }}
        >
          {options.find((option) => option.value === value)?.label}
        </Tag>
      ))}
    >
      {options.length === 0 ? (
        <p className={cx('fr-text--sm')}>Aucune option disponible.</p>
      ) : (
        visibleOptions.length > 0 && (
          <Checkbox
            small
            className="checkbox-list-compact"
            legend={title}
            classes={{ legend: 'fr-sr-only' }}
            options={visibleOptions.map((option) => ({
              label: option.label,
              nativeInputProps: {
                value: option.value,
                checked: draft.includes(option.value),
                onChange: () => toggle(option.value)
              }
            }))}
          />
        )
      )}
    </AppSelectionModal>
  );
};
