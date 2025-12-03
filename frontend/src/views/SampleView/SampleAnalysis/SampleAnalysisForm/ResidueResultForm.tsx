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
import {
  AnalysisMethod,
  AnalysisMethodLabels,
  AnalysisMethodList
} from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import {
  ResidueKind,
  ResidueKindLabels
} from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import AppRadioButtons from '../../../../components/_app/AppRadioButtons/AppRadioButtons';
import AppSearchInput from '../../../../components/_app/AppSearchInput/AppSearchInput';
import { selectOptionsFromList } from '../../../../components/_app/AppSelect/AppSelectOption';
import { UseForm } from '../../../../hooks/useForm';
import { ResidueHeader } from '../SampleAnalysisOverview/ResidueResultOverview';
import '../SampleAnalysisOverview/ResidueResultOverview.scss';
import ResidueComplexForm from './ResidueComplexForm';
import { ResidueInterpretationForm } from './ResidueInterpretationForm';
import ResidueSimpleForm from './ResidueSimpleForm';
import { ResiduesLmrValidator } from './SampleAnalysisForm';

type Props = {
  residue: PartialResidue | undefined;
  residueIndex: number;
  form: UseForm<ResiduesLmrValidator>;
  onDelete: () => void;
  onChange: (residue: PartialResidue, index: number) => void;
};
export const ResidueResultForm: FunctionComponent<Props> = ({
  residue,
  residueIndex,
  form,
  onDelete,
  onChange,

  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  if (!residue) {
    return null;
  }
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
    <div className={clsx('residue-detail-container')}>
      <div className={clsx('d-flex-align-center')}>
        <ResidueHeader residue={residue} />
        <Button
          iconId={'fr-icon-delete-line'}
          size={'small'}
          type={'button'}
          title={`supprimer le résidu numéro ${residue.residueNumber}`}
          priority={'secondary'}
          onClick={onDelete}
          className={cx('fr-ml-auto')}
        />
      </div>
      <hr />
      <div className={clsx('result-detail-bloc')}>
        <h6 className={cx('fr-mb-0')}>Analyse</h6>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppRadioButtons
              legend="Méthode d’analyse"
              options={selectOptionsFromList(AnalysisMethodList, {
                labels: AnalysisMethodLabels,
                withDefault: false
              }).map(({ label, value }) => ({
                key: `residue-${residue.residueNumber}-analysisMethod-option-${value}`,
                label,
                nativeInputProps: {
                  checked: residue.analysisMethod === value,
                  onChange: () => {
                    onChange(
                      {
                        ...residue,
                        analysisMethod: value as AnalysisMethod
                      },
                      residueIndex
                    );
                  }
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
              onSelect={(value) => {
                onChange(
                  {
                    ...residue,
                    reference: value as SSD2Id
                  },
                  residueIndex
                );
              }}
              renderOption={(props, option) => {
                // eslint-disable-next-line react/prop-types
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
      </div>
      {residue.reference !== undefined ? (
        <>
          {kind === 'Simple' && (
            <ResidueSimpleForm
              form={form}
              residue={residue}
              residueIndex={residueIndex}
              changeResidue={onChange}
            />
          )}
          {kind === 'Complex' && (
            <ResidueComplexForm
              form={form}
              residue={residue}
              residueReference={residue.reference}
              residueIndex={residueIndex}
              changeResidue={onChange}
            />
          )}
          {kind && (
            <ResidueInterpretationForm
              form={form}
              onChangeResidue={onChange}
              residue={residue}
              residueIndex={residueIndex}
            />
          )}
        </>
      ) : null}
    </div>
  );
};
