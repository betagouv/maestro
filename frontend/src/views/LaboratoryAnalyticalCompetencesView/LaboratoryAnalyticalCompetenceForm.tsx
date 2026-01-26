import Badge from '@codegouvfr/react-dsfr/Badge';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { format } from 'date-fns';
import {
  OptionalBoolean,
  OptionalBooleanLabels,
  OptionalBooleanList
} from 'maestro-shared/referential/OptionnalBoolean';
import {
  getAnalytes,
  getResidueKind
} from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import {
  SSD2IdLabel,
  SSD2Referential
} from 'maestro-shared/referential/Residue/SSD2Referential';
import {
  AnalysisMethodLabels,
  AnalysisMethodList
} from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { ResidueKindLabels } from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import {
  LaboratoryAnalyticalCompetence,
  LaboratoryAnalyticalCompetenceToSave
} from 'maestro-shared/schema/Laboratory/LaboratoryAnalyticalCompetence';
import { LaboratoryAnalyticalMethodList } from 'maestro-shared/schema/Laboratory/LaboratoryAnalyticalMethod';
import {
  LaboratoryValidationMethod,
  LaboratoryValidationMethodList
} from 'maestro-shared/schema/Laboratory/LaboratoryValidationMethod';
import React, { useContext, useState } from 'react';
import AppSelect from '../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../components/_app/AppSelect/AppSelectOption';
import AppTextInput from '../../components/_app/AppTextInput/AppTextInput';
import TableHeaderCell from '../../components/TableHeaderCell/TableHeaderCell';
import { useForm } from '../../hooks/useForm';
import { ApiClientContext } from '../../services/apiClient';
import './LaboratoryAnalyticalCompetences.scss';

type Props = {
  laboratoryId: string;
  residueAnalyticalCompetence?: LaboratoryAnalyticalCompetence;
  analyteAnalyticalCompetences?: LaboratoryAnalyticalCompetence[];
  ssd2Referential: (typeof SSD2Referential)[keyof typeof SSD2Referential];
};

const LaboratoryAnalyticalCompetencesForm = ({
  laboratoryId,
  residueAnalyticalCompetence,
  analyteAnalyticalCompetences,
  ssd2Referential
}: Props) => {
  const apiClient = useContext(ApiClientContext);

  const [updateLaboratoryAnalyticalCompetence] =
    apiClient.useUpdateLaboratoryAnalyticalCompetenceMutation();
  const [createLaboratoryAnalyticalCompetence] =
    apiClient.useCreateLaboratoryAnalyticalCompetenceMutation();

  const [isCompleteDefinitionAnalysis, setIsCompleteDefinitionAnalysis] =
    useState(residueAnalyticalCompetence?.isCompleteDefinitionAnalysis);
  const [quantificationLimit, setQuantificationLimit] = useState(
    residueAnalyticalCompetence?.quantificationLimit
  );
  const [detectionLimit, setDetectionLimit] = useState(
    residueAnalyticalCompetence?.detectionLimit
  );
  const [analyticalMethod, setAnalyticalMethod] = useState(
    residueAnalyticalCompetence?.analyticalMethod
  );
  const [validationMethod, setValidationMethod] = useState(
    residueAnalyticalCompetence?.validationMethod
  );
  const [analysisMethod, setAnalysisMethod] = useState(
    residueAnalyticalCompetence?.analysisMethod
  );
  const [analyteCompetences, setAnalyteCompetences] = useState<
    LaboratoryAnalyticalCompetenceToSave['analyteAnalyticalCompetences']
  >(
    getResidueKind(ssd2Referential.reference) === 'Complex'
      ? Array.from(getAnalytes(ssd2Referential.reference)).map(
          (analyteReference) =>
            analyteAnalyticalCompetences?.find(
              (_) => _.analyteReference === analyteReference
            ) ?? {
              residueReference: ssd2Referential.reference,
              analyteReference
            }
        )
      : undefined
  );

  const laboratoryAnalyticalCompetenceFormData = {
    residueReference: ssd2Referential.reference,
    analyteReference: undefined,
    detectionLimit,
    quantificationLimit,
    analyticalMethod,
    isCompleteDefinitionAnalysis,
    validationMethod,
    analysisMethod,
    analyteAnalyticalCompetences: analyteCompetences
  };

  const form = useForm(LaboratoryAnalyticalCompetenceToSave, {
    laboratoryId,
    ...laboratoryAnalyticalCompetenceFormData
  });

  const save = async (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();

    await form.validate(async () => {
      if (!residueAnalyticalCompetence) {
        await createLaboratoryAnalyticalCompetence({
          laboratoryId,
          laboratoryAnalyticalCompetence: laboratoryAnalyticalCompetenceFormData
        });
      } else {
        await updateLaboratoryAnalyticalCompetence({
          laboratoryId,
          analyticalCompetenceId: residueAnalyticalCompetence.id as string,
          laboratoryAnalyticalCompetence: laboratoryAnalyticalCompetenceFormData
        });
      }
    });
  };

  const cancel = () => {
    form.reset();
    setDetectionLimit(residueAnalyticalCompetence?.detectionLimit);
    setQuantificationLimit(residueAnalyticalCompetence?.quantificationLimit);
    setAnalyticalMethod(residueAnalyticalCompetence?.analyticalMethod);
    setIsCompleteDefinitionAnalysis(
      residueAnalyticalCompetence?.isCompleteDefinitionAnalysis
    );
    setValidationMethod(residueAnalyticalCompetence?.validationMethod);
    setAnalysisMethod(residueAnalyticalCompetence?.analysisMethod);
  };

  const getAnalyseCompetence = (analyteReference: SSD2Id) => {
    return analyteCompetences?.find(
      (_) => _.analyteReference === analyteReference
    );
  };

  const changeAnalyteCompetence = (
    analyteReference: SSD2Id,
    updatedCompetence: Partial<LaboratoryAnalyticalCompetence>
  ) => {
    const updatedCompetences = analyteCompetences?.map((_) =>
      _.analyteReference === analyteReference
        ? { ..._, ...updatedCompetence }
        : _
    );
    console.log(updatedCompetences);
    setAnalyteCompetences(updatedCompetences);
  };

  return (
    <div
      className={clsx(
        cx('fr-px-4w', 'fr-pt-4w', 'fr-pb-3w'),
        'white-container',
        'analytical-competence-container'
      )}
    >
      <div className="d-flex-align-center">
        <Badge noIcon className={cx('fr-badge--purple-glycine')} as="span">
          {ResidueKindLabels[getResidueKind(ssd2Referential.reference)]}
        </Badge>
        <Tag
          className={clsx(cx('fr-mx-2w'), 'no-wrap', 'residue-reference')}
          as="span"
        >
          {ssd2Referential.reference}
        </Tag>
        <div
          className={clsx(
            cx('fr-text--lg', 'fr-text--bold', 'fr-m-0'),
            'residue-name'
          )}
        >
          {ssd2Referential.name}
        </div>
      </div>
      <Table
        bordered={false}
        noCaption
        noScroll
        headers={[
          <TableHeaderCell
            name={'Analyse selon définition complète'}
            key={`header-1`}
          />,
          <TableHeaderCell name={'Limites (en mg/kg)'} key={`header-2`} />,
          <TableHeaderCell name={'Méthode analytique'} key={`header-3`} />,
          <TableHeaderCell name={'Validation'} key={`header-4`} />,
          <TableHeaderCell name={'Résidu recherché'} key={`header-5`} />
        ]}
        data={[
          [
            <AppSelect
              key={`row-1`}
              value={isCompleteDefinitionAnalysis ?? ''}
              onChange={(e) =>
                setIsCompleteDefinitionAnalysis(
                  e.target.value as OptionalBoolean
                )
              }
              label="Le résidu est-il analysé selon la définition complète ?"
              inputForm={form}
              inputKey="isCompleteDefinitionAnalysis"
              options={selectOptionsFromList(OptionalBooleanList, {
                labels: OptionalBooleanLabels
              })}
            />,
            <div key={`row-2`} className="d-flex-align-center">
              <AppTextInput
                value={detectionLimit ?? ''}
                onChange={(e) => setDetectionLimit(Number(e.target.value))}
                type="number"
                label="Détection"
                inputForm={form}
                inputKey="detectionLimit"
                min={0}
              />
              <AppTextInput
                value={quantificationLimit ?? ''}
                onChange={(e) => setQuantificationLimit(Number(e.target.value))}
                type="number"
                label="Quantification"
                inputForm={form}
                inputKey="quantificationLimit"
                min={0}
              />
            </div>,
            <AppSelect
              key={`row-3`}
              value={analyticalMethod ?? ''}
              onChange={(e) =>
                setAnalyticalMethod(
                  e.target
                    .value as LaboratoryAnalyticalCompetence['analyticalMethod']
                )
              }
              label="Méthode analytique"
              inputForm={form}
              inputKey="analyticalMethod"
              options={selectOptionsFromList(LaboratoryAnalyticalMethodList)}
            />,
            <div key={`row-4`} className={cx('fr-pt-1w')}>
              <Checkbox
                small
                options={selectOptionsFromList(LaboratoryValidationMethodList, {
                  withDefault: false
                }).map(({ label, value }) => ({
                  key: `validationMethod-option-${value}`,
                  label,
                  nativeInputProps: {
                    checked: validationMethod === value,
                    onChange: () =>
                      setValidationMethod(value as LaboratoryValidationMethod)
                  }
                }))}
              />
            </div>,
            <div key={`row-5`} className={cx('fr-pt-1w')}>
              <Checkbox
                small
                options={selectOptionsFromList(AnalysisMethodList, {
                  labels: AnalysisMethodLabels,
                  withDefault: false
                }).map(({ label, value }) => ({
                  key: `analysisMethod-option-${value}`,
                  label,
                  nativeInputProps: {
                    checked: analysisMethod === value,
                    onChange: () =>
                      setAnalysisMethod(
                        value as LaboratoryAnalyticalCompetence['analysisMethod']
                      )
                  }
                }))}
              />
            </div>
          ]
        ]}
      />
      {getResidueKind(ssd2Referential.reference) === 'Complex' &&
        analyteCompetences && (
          <Table
            bordered={false}
            noCaption
            noScroll
            headers={[
              <TableHeaderCell
                name={'Analytes du résidu complexe'}
                key={`header-1`}
              />,
              <TableHeaderCell name={'Limites (en mg/kg)'} key={`header-2`} />,
              <TableHeaderCell name={'Méthode analytique'} key={`header-3`} />,
              <TableHeaderCell name={'Validation'} key={`header-4`} />,
              <TableHeaderCell name={'Résidu recherché'} key={`header-5`} />
            ]}
            data={Array.from(getAnalytes(ssd2Referential.reference)).map(
              (analyteReference, analyteIndex) => [
                <div key={`row-1`}>
                  <Tag
                    className={clsx('no-wrap', 'residue-reference')}
                    as="span"
                  >
                    {ssd2Referential.reference}
                  </Tag>
                  <div className={cx('fr-text--bold', 'fr-mt-1w')}>
                    {SSD2IdLabel[analyteReference]}
                  </div>
                </div>,
                <div key={`row-2`} className="d-flex-align-center">
                  <AppTextInput
                    value={
                      getAnalyseCompetence(analyteReference)?.detectionLimit ??
                      ''
                    }
                    onChange={(e) =>
                      changeAnalyteCompetence(analyteReference, {
                        detectionLimit: Number(e.target.value)
                      })
                    }
                    type="number"
                    label="Détection"
                    inputForm={form}
                    inputKey="analyteAnalyticalCompetences"
                    inputPathFromKey={[analyteIndex, 'detectionLimit']}
                    min={0}
                  />
                  <AppTextInput
                    value={
                      getAnalyseCompetence(analyteReference)
                        ?.quantificationLimit ?? ''
                    }
                    onChange={(e) =>
                      changeAnalyteCompetence(analyteReference, {
                        quantificationLimit: Number(e.target.value)
                      })
                    }
                    type="number"
                    label="Quantification"
                    inputForm={form}
                    inputKey="quantificationLimit"
                    inputPathFromKey={[analyteIndex, 'quantificationLimit']}
                    min={0}
                  />
                </div>,
                <AppSelect
                  key={`row-3`}
                  value={
                    getAnalyseCompetence(analyteReference)?.analyticalMethod ??
                    ''
                  }
                  onChange={(e) =>
                    changeAnalyteCompetence(analyteReference, {
                      analyticalMethod: e.target
                        .value as LaboratoryAnalyticalCompetence['analyticalMethod']
                    })
                  }
                  label="Méthode analytique"
                  inputForm={form}
                  inputKey="analyticalMethod"
                  inputPathFromKey={[analyteIndex, 'analyticalMethod']}
                  options={selectOptionsFromList(
                    LaboratoryAnalyticalMethodList
                  )}
                />,
                <div key={`row-4`} className={cx('fr-pt-1w')}>
                  <Checkbox
                    small
                    options={selectOptionsFromList(
                      LaboratoryValidationMethodList,
                      {
                        withDefault: false
                      }
                    ).map(({ label, value }) => ({
                      key: `validationMethod-option-${value}`,
                      label,
                      nativeInputProps: {
                        checked:
                          getAnalyseCompetence(analyteReference)
                            ?.validationMethod === value,
                        onChange: () =>
                          changeAnalyteCompetence(analyteReference, {
                            validationMethod:
                              value as LaboratoryValidationMethod
                          })
                      }
                    }))}
                  />
                </div>,
                <div key={`row-5`} className={cx('fr-pt-1w')}>
                  <Checkbox
                    small
                    options={selectOptionsFromList(AnalysisMethodList, {
                      labels: AnalysisMethodLabels,
                      withDefault: false
                    }).map(({ label, value }) => ({
                      key: `analysisMethod-option-${value}`,
                      label,
                      nativeInputProps: {
                        checked:
                          getAnalyseCompetence(analyteReference)
                            ?.analysisMethod === value,
                        onChange: () =>
                          changeAnalyteCompetence(analyteReference, {
                            analysisMethod:
                              value as LaboratoryAnalyticalCompetence['analysisMethod']
                          })
                      }
                    }))}
                  />
                </div>
              ]
            )}
          />
        )}
      <div className="d-flex-align-center">
        <span className={clsx(cx('fr-text--light'), 'flex-grow-1')}>
          {residueAnalyticalCompetence?.lastUpdatedAt && (
            <i>
              Paramétrages enregistrés le{' '}
              {format(residueAnalyticalCompetence.lastUpdatedAt, 'dd/MM/yyyy')}
            </i>
          )}
        </span>
        <ButtonsGroup
          alignment="right"
          inlineLayoutWhen="always"
          buttons={[
            {
              children: 'Annuler',
              type: 'button',
              priority: 'tertiary',
              onClick: cancel
            },
            {
              children: 'Enregistrer',
              type: 'button',
              priority: 'secondary',
              onClick: save,
              iconId: 'fr-icon-save-line',
              iconPosition: 'right'
            }
          ]}
        />
      </div>
    </div>
  );
};

export default LaboratoryAnalyticalCompetencesForm;
