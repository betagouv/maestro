import Badge from '@codegouvfr/react-dsfr/Badge';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import Table from '@codegouvfr/react-dsfr/Table';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import {
  OptionalBooleanLabels,
  OptionalBooleanList
} from 'maestro-shared/referential/OptionnalBoolean';
import { getResidueKind } from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import { SSD2Referential } from 'maestro-shared/referential/Residue/SSD2Referential';
import {
  AnalysisMethodLabels,
  AnalysisMethodList
} from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { ResidueKindLabels } from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { LaboratoryAnalyticalCompetence } from 'maestro-shared/schema/Laboratory/LaboratoryAnalyticalCompetence';
import { LaboratoryAnalyticalMethodList } from 'maestro-shared/schema/Laboratory/LaboratoryAnalyticalMethod';
import { LaboratoryValidationMethodList } from 'maestro-shared/schema/Laboratory/LaboratoryValidationMethod';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import microscope from 'src/assets/illustrations/microscope.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { z } from 'zod';
import AppSelect from '../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../components/_app/AppSelect/AppSelectOption';
import AppTextInput from '../../components/_app/AppTextInput/AppTextInput';
import TableHeaderCell from '../../components/TableHeaderCell/TableHeaderCell';
import { useForm } from '../../hooks/useForm';
import { getURLQuery } from '../../utils/fetchUtils';
import './LaboratoryAnalyticalCompetences.scss';

const LaboratoryAnalyticalCompetencesView = () => {
  useDocumentTitle('Compétence analytique des laboratoires');

  const [searchParams] = useSearchParams();

  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const allResidues = Object.entries(SSD2Referential);
  const [laboratoryAnalyticalCompetences, setLaboratoryAnalyticalCompetences] =
    useState<LaboratoryAnalyticalCompetence[]>(new Array(allResidues.length));

  const residues = allResidues.slice(
    (page - 1) * defaultPerPage,
    page * defaultPerPage
  );

  const Form = z.object({
    laboratoryAnalyticalCompetences: z.array(LaboratoryAnalyticalCompetence)
  });

  const form = useForm(Form, {
    laboratoryAnalyticalCompetences
  });

  return (
    <section
      className={clsx(
        cx('fr-container'),
        'analytical-competences-container',
        'main-section'
      )}
    >
      <SectionHeader
        title="Compétence analytique des laboratoires"
        illustration={microscope}
      />
      {residues.map(([ssd2Code, ssd2], residueIndex) => (
        <div
          key={ssd2Code}
          className={clsx(
            cx('fr-px-4w', 'fr-pt-4w', 'fr-pb-3w'),
            'white-container',
            'analytical-competence-container'
          )}
        >
          <div className="d-flex-align-center">
            <Badge noIcon className={cx('fr-badge--purple-glycine')} as="span">
              {ResidueKindLabels[getResidueKind(ssd2.reference)]}
            </Badge>
            <Tag
              className={clsx(cx('fr-mx-2w'), 'no-wrap', 'residue-reference')}
              as="span"
            >
              {ssd2.reference}
            </Tag>
            <div
              className={clsx(
                cx('fr-text--lg', 'fr-text--bold', 'fr-m-0'),
                'residue-name'
              )}
            >
              {ssd2.name}
            </div>
          </div>
          <Table
            bordered={false}
            noCaption
            noScroll
            headers={[
              <TableHeaderCell
                name={'Analyse selon définition complète'}
                key={`${ssd2Code}-header-1`}
              />,
              <TableHeaderCell
                name={'Limites (en mg/kg)'}
                key={`${ssd2Code}-header-2`}
              />,
              <TableHeaderCell
                name={'Méthode analytique'}
                key={`${ssd2Code}-header-3`}
              />,
              <TableHeaderCell
                name={'Validation'}
                key={`${ssd2Code}-header-4`}
              />,
              <TableHeaderCell
                name={'Résidu recherché'}
                key={`${ssd2Code}-header-5`}
              />
            ]}
            data={[
              [
                <AppSelect
                  key={`${ssd2Code}-row-1`}
                  label="Le résidu est-il analysé selon la définition complète ?"
                  inputForm={form}
                  inputKey="laboratoryAnalyticalCompetences"
                  inputPathFromKey={[residueIndex, 'quantityUnit']}
                  options={selectOptionsFromList(OptionalBooleanList, {
                    labels: OptionalBooleanLabels
                  })}
                />,
                <div key={`${ssd2Code}-row-2`} className="d-flex-align-center">
                  <AppTextInput
                    label="Détection"
                    inputForm={form}
                    inputKey="laboratoryAnalyticalCompetences"
                    inputPathFromKey={[residueIndex, 'detectionLimit']}
                    min={0}
                  />
                  <AppTextInput
                    label="Quantification"
                    inputForm={form}
                    inputKey="laboratoryAnalyticalCompetences"
                    inputPathFromKey={[residueIndex, 'quantificationLimit']}
                    min={0}
                  />
                </div>,
                <AppSelect
                  key={`${ssd2Code}-row-3`}
                  label="Méthode analytique"
                  inputForm={form}
                  inputKey="laboratoryAnalyticalCompetences"
                  inputPathFromKey={[residueIndex, 'analyticalMethod']}
                  options={selectOptionsFromList(
                    LaboratoryAnalyticalMethodList
                  )}
                />,
                <div key={`${ssd2Code}-row-4`} className={cx('fr-pt-1w')}>
                  <Checkbox
                    small
                    options={selectOptionsFromList(
                      LaboratoryValidationMethodList,
                      {
                        withDefault: false
                      }
                    ).map(({ label, value }) => ({
                      key: `${ssd2Code}-validationMethod-option-${value}`,
                      label,
                      nativeInputProps: {
                        // checked:
                        //   form.values.laboratoryAnalyticalCompetences?.[
                        //     residueIndex
                        //   ]?.validationMethod === value,
                        // onChange: () =>
                        //   onChangeItem?.({
                        //     ...item,
                        //     recipientKind: value as SampleItemRecipientKind
                        //   })
                      }
                    }))}
                  />
                </div>,
                <div key={`${ssd2Code}-row-5`} className={cx('fr-pt-1w')}>
                  <Checkbox
                    small
                    options={selectOptionsFromList(AnalysisMethodList, {
                      labels: AnalysisMethodLabels,
                      withDefault: false
                    }).map(({ label, value }) => ({
                      key: `${ssd2Code}-analysisMethod-option-${value}`,
                      label,
                      nativeInputProps: {
                        // checked:
                        //   form.values.laboratoryAnalyticalCompetences?.[
                        //     residueIndex
                        //   ]?.validationMethod === value,
                        // onChange: () =>
                        //   onChangeItem?.({
                        //     ...item,
                        //     recipientKind: value as SampleItemRecipientKind
                        //   })
                      }
                    }))}
                  />
                </div>
              ]
            ]}
          />
          <ButtonsGroup
            alignment="right"
            inlineLayoutWhen="always"
            buttons={[
              {
                children: 'Annuler',
                type: 'button',
                priority: 'tertiary',
                onClick: () => {}
              },
              {
                children: 'Enregistrer',
                type: 'button',
                priority: 'secondary',
                onClick: () => {},
                iconId: 'fr-icon-save-line',
                iconPosition: 'right'
              }
            ]}
          />
        </div>
      ))}
      <Pagination
        count={Math.floor(allResidues.length / defaultPerPage) + 1}
        defaultPage={page}
        getPageLinkProps={(page: number) => ({
          to: getURLQuery({
            page: page.toString()
          })
        })}
        className={cx('fr-mt-5w')}
      />
    </section>
  );
};

export default LaboratoryAnalyticalCompetencesView;
