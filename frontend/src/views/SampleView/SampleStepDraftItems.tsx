import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PrimaryQuantityUnitList,
  QuantityUnit,
  QuantityUnitLabels,
  SecondaryQuantityUnitList,
} from 'shared/referential/QuantityUnit';
import { PartialSample, Sample } from 'shared/schema/Sample/Sample';
import { PartialSampleItem } from 'shared/schema/Sample/SampleItem';
import { isDefinedAndNotNull } from 'shared/utils/utils';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import {
  useUpdateSampleItemsMutation,
  useUpdateSampleMutation,
} from 'src/services/sample.service';

export const MaxItemCount = 3;

interface Props {
  partialSample: PartialSample;
}

const SampleStepDraftItems = ({ partialSample }: Props) => {
  const navigate = useNavigate();

  const [items, setItems] = useState<PartialSampleItem[]>(
    !isDefinedAndNotNull(partialSample.items) ||
      partialSample.items.length === 0
      ? [
          {
            sampleId: partialSample.id,
            itemNumber: 1,
          },
        ]
      : partialSample.items
  );

  const [updateSampleItems] = useUpdateSampleItemsMutation();
  const [updateSample] = useUpdateSampleMutation();

  const Form = Sample.pick({
    items: true,
  });

  const form = useForm(Form, {
    items,
  });

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      await save();
      await updateSample({
        ...partialSample,
        status: 'Submitted',
      });
      navigate(`/prelevements/${partialSample.id}?etape=5`, {
        replace: true,
      });
    });
  };

  const save = async () => {
    await updateSampleItems({
      id: partialSample.id,
      items,
    });
  };

  const changeItems = (item: PartialSampleItem, index: number) => {
    const newItems = [...items];
    newItems[index] = item;
    setItems(newItems);
  };

  return (
    <>
      <form
        data-testid="draft_sample_items_form"
        onChange={async (e) => {
          e.preventDefault();
          await save();
        }}
      >
        {items?.map((item, index) => (
          <div
            key={`item_${index}`}
            className={cx('fr-grid-row', 'fr-grid-row--gutters')}
            style={{
              border: '1px solid #e5e5e5',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h3
              className={cx('fr-col-12', 'fr-mb-0')}
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              Echantillon {index + 1}
              <Button
                title="Supprimer"
                iconId="fr-icon-delete-line"
                priority="tertiary no outline"
                className={cx('fr-mx-2w')}
                onClick={(e) => {
                  e.preventDefault();
                  const newItems = [...items];
                  newItems.splice(index, 1);
                  setItems(newItems);
                }}
                data-testid={`remove-item-button-${index}`}
              />
            </h3>
            <div className={cx('fr-col-12', 'fr-col-sm-4')}>
              <AppTextInput<FormShape>
                value={item.quantity ?? ''}
                onChange={(e) =>
                  changeItems(
                    { ...item, quantity: Number(e.target.value) },
                    index
                  )
                }
                type="number"
                inputForm={form}
                inputKey="items"
                inputPathFromKey={[index, 'quantity']}
                whenValid="Quantité valide"
                data-testid={`item-quantity-input-${index}`}
                label="Quantité (obligatoire)"
                min={0}
                required
              />
            </div>
            <div className={cx('fr-col-12', 'fr-col-sm-4')}>
              <AppSelect<FormShape>
                value={item.quantityUnit ?? ''}
                options={[
                  ...selectOptionsFromList(PrimaryQuantityUnitList, {
                    labels: QuantityUnitLabels,
                  }),
                  ...selectOptionsFromList(SecondaryQuantityUnitList, {
                    labels: QuantityUnitLabels,
                    withDefault: false,
                  }),
                ]}
                onChange={(e) =>
                  changeItems(
                    { ...item, quantityUnit: e.target.value as QuantityUnit },
                    index
                  )
                }
                inputForm={form}
                inputKey="items"
                inputPathFromKey={[index, 'quantityUnit']}
                whenValid="Unité de quantité correctement renseignée."
                data-testid={`item-unit-select-${index}`}
                label="Unité de quantité (obligatoire)"
                required
              />
            </div>
            <div className={cx('fr-col-12', 'fr-col-sm-4')}>
              <AppTextInput<FormShape>
                value={item.sealId ?? ''}
                onChange={(e) =>
                  changeItems(
                    {
                      ...item,
                      sealId: e.target.value,
                    },
                    index
                  )
                }
                inputForm={form}
                inputKey="items"
                inputPathFromKey={[index, 'sealId']}
                whenValid="Numéro de scellé correctement renseigné."
                data-testid={`item-sealid-input-${index}`}
                label="Numéro de scellé (obligatoire)"
                required
              />
            </div>
            <div className={cx('fr-col-12', 'fr-col-sm-12')}>
              <ToggleSwitch
                label="Respect directive 2002/63"
                checked={item.compliance200263 ?? false}
                onChange={(checked) =>
                  changeItems({ ...item, compliance200263: checked }, index)
                }
                showCheckedHint={false}
              />
            </div>
            <div className={cx('fr-col-12', 'fr-col-sm-4')}>
              <ToggleSwitch
                label="Recours au poolage"
                checked={item.pooling ?? false}
                onChange={(checked) =>
                  changeItems(
                    { ...item, pooling: checked, poolingCount: undefined },
                    index
                  )
                }
                showCheckedHint={false}
              />
            </div>
            {item.pooling && (
              <div className={cx('fr-col-12', 'fr-col-sm-4')}>
                <AppTextInput<FormShape>
                  value={item.poolingCount ?? ''}
                  type="number"
                  onChange={(e) =>
                    changeItems(
                      {
                        ...item,
                        poolingCount: Number(e.target.value),
                      },
                      index
                    )
                  }
                  inputForm={form}
                  inputKey="items"
                  inputPathFromKey={[index, 'poolingCount']}
                  whenValid="Nombre d'unités correctement renseigné."
                  data-testid={`item-poolingcount-input-${index}`}
                  label="Nombre d'unités (obligatoire)"
                  required
                />
              </div>
            )}
          </div>
        ))}
        {items.length < MaxItemCount && (
          <Button
            iconId="fr-icon-add-line"
            priority="tertiary no outline"
            onClick={(e) => {
              e.preventDefault();
              setItems([
                ...items,
                {
                  sampleId: partialSample.id,
                  itemNumber: items.length + 1,
                },
              ]);
            }}
            className={cx('fr-mb-2w')}
            data-testid="add-item-button"
          >
            Ajouter un échantillon
          </Button>
        )}
        {form.hasIssue('items') && (
          <Alert
            severity="error"
            description={form.message('items') as string}
            small
            className={cx('fr-mb-4w')}
          />
        )}
        <div className={cx('fr-col-12')}>
          <ButtonsGroup
            inlineLayoutWhen="md and up"
            buttons={[
              {
                children: 'Etape précédente',
                priority: 'secondary',
                onClick: async (e) => {
                  e.preventDefault();
                  await updateSample({
                    ...partialSample,
                    status: 'DraftInfos',
                  });
                  navigate(`/prelevements/${partialSample.id}?etape=3`, {
                    replace: true,
                  });
                },
                nativeButtonProps: {
                  'data-testid': 'previous-button',
                },
              },
              {
                children: 'Etape suivante',
                onClick: submit,
                nativeButtonProps: {
                  'data-testid': 'submit-button',
                },
              },
            ]}
          />
        </div>
      </form>
    </>
  );
};

export default SampleStepDraftItems;
