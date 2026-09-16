import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import type { TagProps } from '@codegouvfr/react-dsfr/Tag';
import TagsGroup from '@codegouvfr/react-dsfr/TagsGroup';
import clsx from 'clsx';
import {
  addProgrammingPlanSample,
  defaultProgrammingPlanSample,
  type ProgrammingPlanSampleCopySetting,
  ProgrammingPlanSampleMaxCount,
  type ProgrammingPlanSampleSetting
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import type { ProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';
import type { ProgrammingLevelSettingsForm } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import { SampleItemRecipientKindLabels } from 'maestro-shared/schema/Sample/SampleItemRecipientKind';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useState } from 'react';
import type { UseForm } from 'src/hooks/useForm';
import { assert, type Equals } from 'tsafe';
import { useSettingInheritance } from '../ProgrammingPlanSettingInheritance/ProgrammingPlanSettingInheritance';
import { ProgrammingPlanSampleCopyModal } from './ProgrammingPlanSampleCopyModal';
import './ProgrammingPlanSampleSettings.scss';

const copyModal = createModal({
  id: 'programming-plan-sample-copy-modal',
  isOpenedByDefault: false
});

const recipientLabel = ({ recipientKinds }: ProgrammingPlanSampleCopySetting) =>
  recipientKinds
    .map((recipientKind, index) =>
      index === 0
        ? SampleItemRecipientKindLabels[recipientKind]
        : SampleItemRecipientKindLabels[recipientKind].toLowerCase()
    )
    .join(' ou ');

type EditedCopy = {
  sampleIndex: number;
  copyIndex: 1 | 2;
  copy: ProgrammingPlanSampleCopySetting;
};

type Props<T extends ProgrammingPlanSettings> = {
  settings: T;
  planSettings: ProgrammingPlanSettings | undefined;
  inputForm: UseForm<typeof ProgrammingLevelSettingsForm>;
  onChange: (settings: T) => void;
};

export const ProgrammingPlanSampleSettings = <
  T extends ProgrammingPlanSettings
>({
  settings,
  planSettings,
  inputForm,
  onChange,
  ..._rest
}: Props<T>) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [editedCopy, setEditedCopy] = useState<EditedCopy>({
    sampleIndex: 0,
    copyIndex: 1,
    copy: defaultProgrammingPlanSample.copies[1]
  });

  const samples = settings.samples ?? [defaultProgrammingPlanSample];

  const [firstSubstanceKind, ...otherSubstanceKinds] = [
    ...(settings.substanceKinds ?? [])
  ].sort((a, b) =>
    SubstanceKindLabels[a].localeCompare(SubstanceKindLabels[b])
  );

  const changeSamples = (samples: ProgrammingPlanSampleSetting[]) =>
    onChange({ ...settings, samples });

  const changeSample = (
    sampleIndex: number,
    sample: ProgrammingPlanSampleSetting
  ) =>
    changeSamples(
      samples.map((current, index) =>
        index === sampleIndex ? sample : current
      )
    );

  const saveCopy = (copy: ProgrammingPlanSampleCopySetting) => {
    const sample = samples[editedCopy.sampleIndex];
    const copies: ProgrammingPlanSampleSetting['copies'] = [...sample.copies];
    copies[editedCopy.copyIndex] = copy;
    changeSample(editedCopy.sampleIndex, { ...sample, copies });
  };

  const inheritanceDisabledReason = planSettings
    ? settings.substanceKindsManaged
      ? 'Les analytes de ce sous-plan sont détachés du plan : ses échantillons le sont aussi.'
      : undefined
    : settings.substanceKindsManaged
      ? undefined
      : 'Paramétrez d’abord les analytes au niveau du plan.';

  const {
    isInherited: disabled,
    isFieldVisible,
    lockButton,
    toggle,
    disabledReasonHint
  } = useSettingInheritance({
    settingKey: 'samples',
    label: 'Échantillons / Exemplaires',
    settings,
    planSettings,
    inheritanceDisabledReason,
    onChange
  });

  return (
    <>
      <div className="programming-plan-sample-settings">
        <div
          className={clsx(
            'programming-plan-sample-settings__header',
            'd-flex-align-center'
          )}
        >
          {lockButton}
          <span className={cx('fr-text--bold', 'fr-mb-0')}>
            1. Échantillons / Exemplaires
          </span>
          <div className="programming-plan-sample-settings__rule" />
          {toggle}
        </div>
        {disabledReasonHint}
        {isFieldVisible && (
          <>
            <div
              className={clsx('border-bottom', 'border-right', 'border-left')}
            >
              {samples.map((sample, sampleIndex) => (
                <div
                  key={`sample-${sampleIndex}`}
                  className={clsx('border-top', cx('fr-p-3w'))}
                  data-testid={`sample-${sampleIndex}`}
                >
                  <div
                    className={clsx(
                      'd-flex-row',
                      'd-flex-align-center',
                      cx('fr-mb-2w')
                    )}
                    style={{ gap: '1rem' }}
                  >
                    <span className={cx('fr-text--lg', 'fr-mb-0')}>
                      Échantillon {sampleIndex + 1}
                    </span>
                    <div className={cx('fr-ml-auto')}>
                      {firstSubstanceKind ? (
                        <TagsGroup
                          className={cx('fr-mb-0')}
                          smallTags={true}
                          tags={
                            [firstSubstanceKind, ...otherSubstanceKinds].map(
                              (substanceKind): TagProps => ({
                                children: SubstanceKindLabels[substanceKind],
                                pressed: sample.substanceKind === substanceKind,
                                nativeButtonProps: {
                                  disabled,
                                  onClick: () =>
                                    changeSample(sampleIndex, {
                                      ...sample,
                                      substanceKind:
                                        sample.substanceKind === substanceKind
                                          ? null
                                          : substanceKind
                                    })
                                }
                              })
                            ) as [TagProps, ...TagProps[]]
                          }
                        />
                      ) : (
                        <span className={cx('fr-text--sm', 'fr-mb-0')}>
                          Aucun analyte paramétré
                        </span>
                      )}
                    </div>
                    <Button
                      priority="secondary"
                      iconId="fr-icon-delete-line"
                      title={`Supprimer l’échantillon ${sampleIndex + 1}`}
                      style={{ flexShrink: 0 }}
                      disabled={disabled || samples.length === 1}
                      onClick={() =>
                        changeSamples(
                          samples.filter((_, index) => index !== sampleIndex)
                        )
                      }
                    />
                  </div>
                  <p className={cx('fr-mb-1w')}>
                    {sample.copies.length} exemplaires :
                  </p>
                  <div className="programming-plan-sample-settings__copies">
                    {sample.copies.map((copy, copyIndex) => (
                      <Button
                        key={`copy-${copyIndex}`}
                        priority="tertiary"
                        size="small"
                        disabled={disabled || copyIndex === 0}
                        title={`Modifier l’exemplaire ${copyIndex + 1} de l’échantillon ${sampleIndex + 1}`}
                        onClick={() => {
                          setEditedCopy({
                            sampleIndex,
                            copyIndex: copyIndex as EditedCopy['copyIndex'],
                            copy
                          });
                          copyModal.open();
                        }}
                      >
                        <b>{recipientLabel(copy)}</b>
                        <span className={cx('fr-ml-1v')}>
                          ({copy.required ? 'obligatoire' : 'optionnel'})
                        </span>
                      </Button>
                    ))}
                  </div>
                  {inputForm.hasIssue('samples', [
                    sampleIndex,
                    'substanceKind'
                  ]) && (
                    <p className={cx('fr-error-text')}>
                      {inputForm.message('samples', [
                        sampleIndex,
                        'substanceKind'
                      ])}
                    </p>
                  )}
                </div>
              ))}
              <div
                className={clsx(
                  'd-flex-justify-center',
                  'border-top',
                  cx('fr-p-3w')
                )}
              >
                <Button
                  priority="secondary"
                  iconId="fr-icon-add-line"
                  disabled={
                    disabled || samples.length >= ProgrammingPlanSampleMaxCount
                  }
                  onClick={() =>
                    changeSamples(addProgrammingPlanSample(samples))
                  }
                >
                  Ajouter un échantillon
                </Button>
              </div>
            </div>
            {inputForm.hasIssue('samples') && (
              <p className={cx('fr-error-text')}>
                {inputForm.message('samples')}
              </p>
            )}
          </>
        )}
      </div>
      <ProgrammingPlanSampleCopyModal
        modal={copyModal}
        copyNumber={editedCopy.copyIndex + 1}
        copy={editedCopy.copy}
        onSave={saveCopy}
      />
    </>
  );
};
