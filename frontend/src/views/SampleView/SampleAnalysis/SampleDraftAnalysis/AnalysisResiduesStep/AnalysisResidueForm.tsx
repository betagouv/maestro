import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Box } from '@mui/material';
import clsx from 'clsx';
import { isComplex } from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import { SSD2Id, SSD2Ids } from 'maestro-shared/referential/Residue/SSD2Id';
import {
  SSD2IdLabel,
  SSD2Referential
} from 'maestro-shared/referential/Residue/SSD2Referential';
import { Analysis } from 'maestro-shared/schema/Analysis/Analysis';
import {
  AnalysisMethod,
  AnalysisMethodLabels,
  AnalysisMethodList
} from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { type PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import {
  ResidueKind,
  ResidueKindLabels
} from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import AppRadioButtons from '../../../../../components/_app/AppRadioButtons/AppRadioButtons';
import AppSearchInput from '../../../../../components/_app/AppSearchInput/AppSearchInput';
import { selectOptionsFromList } from '../../../../../components/_app/AppSelect/AppSelectOption';
import { UseForm } from '../../../../../hooks/useForm';
import ComplexResidueForm from './ComplexResidueForm';
import { ResidueInterpretationForm } from './ResidueInterpretationForm';
import SimpleResidueForm from './SimpleResidueForm';

const _validator = Analysis.pick({ residues: true });
export type Props = {
  residueIndex: number;
  residue: PartialResidue;
  form: UseForm<typeof _validator>;
  onDeleteResidue: () => void;
  changeResidue: (residue: PartialResidue, residueIndex: number) => void;
};
export const AnalysisResidueForm: FunctionComponent<Props> = ({
  residueIndex,
  residue,
  onDeleteResidue,
  changeResidue,
  form,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const kind: ResidueKind =
    residue.reference && isComplex(residue.reference) ? 'Complex' : 'Simple';

  const references = SSD2Ids.filter((id) => {
    // Permet de modifier une référence deprecated mais déjà en bdd
    if (id === residue.reference) {
      return true;
    }
    const reference = SSD2Referential[id as keyof typeof SSD2Referential];
    return !('deprecated' in reference) || !reference.deprecated;
  });

  return (
    <>
      <div
        className={clsx(cx('fr-icon-microscope-line', 'fr-mr-1w'), 'icon-grey')}
      ></div>
      <div className={clsx(cx('fr-px-0'), 'residue-form')}>
        <h5>
          <div>Résidu n°{residueIndex + 1}</div>
          {residueIndex > 0 && (
            <>
              <div className="border-middle"></div>
              <Button
                title="Supprimer"
                iconId="fr-icon-delete-line"
                priority="tertiary"
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  onDeleteResidue();
                }}
                className={cx('fr-mt-0')}
              />
            </>
          )}
        </h5>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppRadioButtons
              legend="Méthode d’analyse"
              options={selectOptionsFromList(AnalysisMethodList, {
                labels: AnalysisMethodLabels,
                withDefault: false
              }).map(({ label, value }) => ({
                key: `residue-${residueIndex}-analysisMethod-option-${value}`,
                label,
                nativeInputProps: {
                  checked: residue.analysisMethod === value,
                  onChange: () =>
                    changeResidue(
                      {
                        ...residue,
                        analysisMethod: value as AnalysisMethod
                      },
                      residueIndex
                    )
                }
              }))}
              colSm={6}
              inputForm={form}
              inputKey="residues"
              inputPathFromKey={[residueIndex, 'analysisMethod']}
              whenValid="Méthode d’analyse correctement renseignée"
              required
            />
          </div>
        </div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppSearchInput
              options={selectOptionsFromList(references, {
                labels: SSD2IdLabel,
                withSort: true,
                withDefault: false
              })}
              value={residue.reference ?? ''}
              state={form.messageType('residues', [residueIndex, 'reference'])}
              stateRelatedMessage={form.message('residues', [
                residueIndex,
                'reference'
              ])}
              onSelect={(value) =>
                changeResidue(
                  {
                    ...residue,
                    reference: value as SSD2Id
                  },
                  residueIndex
                )
              }
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <Box
                    key={key}
                    component="li"
                    style={{ display: 'flex' }}
                    {...optionProps}
                  >
                    <span>{option.label}</span>
                    <Tag
                      className={cx('fr-text--regular')}
                      style={{ marginLeft: 'auto', flexShrink: 0 }}
                    >
                      {
                        ResidueKindLabels[
                          isComplex(option.value as SSD2Id)
                            ? 'Complex'
                            : 'Simple'
                        ]
                      }
                    </Tag>
                  </Box>
                );
              }}
              label="Résidu"
              whenValid={`Résidu correctement renseigné`}
              required
            />
          </div>
        </div>
        {residue.reference !== undefined ? (
          <>
            {kind === 'Simple' && (
              <SimpleResidueForm
                form={form}
                residue={residue}
                residueIndex={residueIndex}
                changeResidue={changeResidue}
              />
            )}
            {kind === 'Complex' && (
              <ComplexResidueForm
                form={form}
                residue={residue}
                residueReference={residue.reference}
                residueIndex={residueIndex}
                changeResidue={changeResidue}
              />
            )}
            {kind && (
              <ResidueInterpretationForm
                form={form}
                onChangeResidue={changeResidue}
                residue={residue}
                residueIndex={residueIndex}
              />
            )}{' '}
          </>
        ) : null}
      </div>
    </>
  );
};
