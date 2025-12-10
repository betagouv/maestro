import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import {
  PrimaryQuantityUnitList,
  QuantityUnit,
  QuantityUnitLabels,
  SecondaryQuantityUnitList
} from 'maestro-shared/referential/QuantityUnit';
import {
  getLaboratoryFullName,
  Laboratory
} from 'maestro-shared/schema/Laboratory/Laboratory';
import {
  isProgrammingPlanSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { PartialSampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import {
  SampleItemRecipientKind,
  SampleItemRecipientKindLabels
} from 'maestro-shared/schema/Sample/SampleItemRecipientKind';
import {
  SubstanceKind,
  SubstanceKindLabels
} from 'maestro-shared/schema/Substance/SubstanceKind';
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppResponsiveButton from 'src/components/_app/AppResponsiveButton/AppResponsiveButton';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import {
  defaultAppSelectOption,
  selectOptionsFromList
} from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { UseForm, useForm } from 'src/hooks/useForm';
import { z } from 'zod';
import { usePartialSample } from '../../../hooks/usePartialSample';
import useWindowSize from '../../../hooks/useWindowSize';
import { ApiClientContext } from '../../../services/apiClient';

const Form = z.object({
  items: z.array(z.looseObject({}))
});

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
  item: PartialSampleItem;
  itemIndex: number;
  onRemoveItem?: (item: PartialSampleItem) => void;
  onChangeItem?: (item: PartialSampleItem) => void;
  onChangeLaboratory?: (laboratoryId: string) => void;
  itemsForm?: UseForm<typeof Form>;
  laboratory?: Laboratory | null;
  children?: React.ReactNode;
  readonly?: boolean;
}

const SampleItemContent = ({
  partialSample,
  item,
  itemIndex,
  onRemoveItem,
  onChangeItem,
  itemsForm,
  readonly: forceReadonly
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { isMobile } = useWindowSize();

  const fakeForm = useForm(Form, {
    items: []
  });

  const { getSampleItemLaboratory } = usePartialSample(partialSample);

  const form = itemsForm ?? fakeForm;
  const readonly = useMemo(
    () => !itemsForm || forceReadonly,
    [itemsForm, forceReadonly]
  );

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery();

  return (
    <div className={cx('fr-py-4w', 'fr-px-5w')}>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div
          className={clsx(cx('fr-col-12', 'fr-mb-2w'), 'd-flex-align-center')}
        >
          <div className={clsx('flex-grow-1', 'd-flex-align-center')}>
            <Badge
              className={cx('fr-badge--yellow-tournesol')}
              noIcon
              severity="info"
            >
              Exemplaire n°{item.copyNumber}
            </Badge>
            {item.copyNumber > 1 && !readonly && (
              <AppResponsiveButton
                title="Supprimer"
                iconId="fr-icon-delete-line"
                priority="tertiary no outline"
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  onRemoveItem?.(item);
                }}
                data-testid={`remove-item-button-${itemIndex}`}
              />
            )}
          </div>
          <div className={clsx('d-flex-align-center')}>
            <span className={cx('fr-mr-1w')}>Analyse</span>
            {SubstanceKindLabels[item.substanceKind as SubstanceKind]
              .split(' et ')
              .map((label) => (
                <Tag key={label}>{label}</Tag>
              ))}
          </div>
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-6', 'fr-col-sm-3')}>
          <AppTextInput
            value={item.quantity ?? ''}
            onChange={(e) =>
              onChangeItem?.({ ...item, quantity: Number(e.target.value) })
            }
            type="number"
            inputForm={form}
            inputKey="items"
            inputPathFromKey={[itemIndex, 'quantity']}
            whenValid="Quantité valide"
            data-testid={`item-quantity-input-${itemIndex}`}
            label="Quantité prélevée"
            hintText="Nombre"
            min={0}
            disabled={readonly}
            required
          />
        </div>
        <div className={cx('fr-col-6', 'fr-col-sm-3')}>
          <AppSelect
            value={item.quantityUnit ?? ''}
            options={[
              ...selectOptionsFromList(PrimaryQuantityUnitList, {
                labels: QuantityUnitLabels
              }),
              ...selectOptionsFromList(SecondaryQuantityUnitList, {
                labels: QuantityUnitLabels,
                withDefault: false
              })
            ]}
            onChange={(e) =>
              onChangeItem?.({
                ...item,
                quantityUnit: QuantityUnit.safeParse(e.target.value).data
              })
            }
            inputForm={form}
            inputKey="items"
            inputPathFromKey={[itemIndex, 'quantityUnit']}
            whenValid="Unité de quantité correctement renseignée."
            data-testid={`item-unit-select-${itemIndex}`}
            hint="Unité de mesure"
            disabled={readonly}
            required
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppTextInput
            value={item.sealId ?? ''}
            onChange={(e) =>
              onChangeItem?.({
                ...item,
                sealId: e.target.value
              })
            }
            inputForm={form}
            inputKey="items"
            inputPathFromKey={[itemIndex, 'sealId']}
            whenValid="Numéro de scellé correctement renseigné."
            data-testid={`item-sealid-input-${itemIndex}`}
            label="Numéro de scellé"
            hintText="Inscrit sur le lien autobloquant de scellé"
            disabled={readonly}
            required
          />
        </div>
        <div className={cx('fr-col-12')}>
          {item.copyNumber === 1 ? (
            <>
              {isProgrammingPlanSample(partialSample) ? (
                <>
                  Laboratoire destinataire :{' '}
                  {item.laboratoryId ? (
                    <b>
                      {getLaboratoryFullName(
                        getSampleItemLaboratory(item.itemNumber)
                      )}
                    </b>
                  ) : (
                    <span className="missing-data">
                      Information non disponible
                    </span>
                  )}
                </>
              ) : (
                <AppSelect
                  value={item.laboratoryId ?? ''}
                  options={[
                    defaultAppSelectOption('Sélectionner un laboratoire'),
                    ...(laboratories ?? []).map((laboratory) => ({
                      label: laboratory.shortName,
                      value: laboratory.id
                    }))
                  ]}
                  onChange={(e) =>
                    onChangeItem?.({
                      ...item,
                      laboratoryId: e.target.value
                    })
                  }
                  inputForm={form}
                  inputKey="items"
                  inputPathFromKey={[itemIndex, 'laboratoryId']}
                  whenValid="Laboratoire valide"
                  label="Laboratoire"
                  disabled={readonly}
                  required
                />
              )}
            </>
          ) : (
            <AppRadioButtons
              legend="Destinataire de l’échantillon"
              options={
                selectOptionsFromList(['Operator', 'Sampler'], {
                  labels: SampleItemRecipientKindLabels,
                  withDefault: false
                }).map(({ label, value }) => ({
                  key: `recipientKind-option-${value}`,
                  label,
                  nativeInputProps: {
                    checked: item.recipientKind === value,
                    onChange: () =>
                      onChangeItem?.({
                        ...item,
                        recipientKind: value as SampleItemRecipientKind
                      })
                  }
                })) ?? []
              }
              colSm={6}
              inputForm={form}
              inputKey="items"
              inputPathFromKey={[itemIndex, 'recipientKind']}
              disabled={readonly}
              required
              data-testid={`recipientKind-radio-${itemIndex}`}
            />
          )}
        </div>
        {partialSample?.specificData.programmingPlanKind === 'PPV' && (
          <>
            <div className={cx('fr-col-12', 'fr-col-sm-6')}>
              {itemsForm ? (
                <AppRadioButtons
                  legend="Directive 2002/63"
                  options={[
                    {
                      label: 'Respectée',
                      nativeInputProps: {
                        checked: item.compliance200263 === true,
                        onChange: () =>
                          onChangeItem?.({ ...item, compliance200263: true })
                      }
                    },
                    {
                      label: 'Non respectée',
                      nativeInputProps: {
                        checked: item.compliance200263 === false,
                        onChange: () =>
                          onChangeItem?.({ ...item, compliance200263: false })
                      }
                    }
                  ]}
                  colSm={6}
                  inputForm={form}
                  inputKey="items"
                  inputPathFromKey={[itemIndex, 'compliance200263']}
                  whenValid="Directive 2002/63 correctement renseignée."
                  disabled={readonly}
                  required
                />
              ) : (
                <div className="icon-text">
                  <div
                    className={cx('fr-icon-bookmark-fill', {
                      'fr-label--error': !item.compliance200263,
                      'fr-label--success': item.compliance200263
                    })}
                  />
                  <div>
                    Directive 2002/63{' '}
                    <b> {!item.compliance200263 && 'non '}respectée</b>
                  </div>
                </div>
              )}
            </div>
            {itemsForm && (
              <div className={cx('fr-col-12', 'fr-col-sm-6')}>
                <Link
                  to="https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:02002L0063-20020723"
                  className={clsx(cx('fr-link'), { 'float-right': !isMobile })}
                  target="_blank"
                >
                  Directive 2002/63
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SampleItemContent;
