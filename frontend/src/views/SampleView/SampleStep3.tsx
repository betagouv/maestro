import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PartialSample, Sample } from 'shared/schema/Sample/Sample';
import { PartialSampleItem } from 'shared/schema/Sample/SampleItem';
import { isDefinedAndNotNull } from 'shared/utils/utils';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useUpdateSampleItemsMutation } from 'src/services/sample.service';
interface Props {
  partialSample: PartialSample;
}

const SampleStep3 = ({ partialSample }: Props) => {
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

  const [updateSampleItems, { isSuccess: isUpdateSuccess }] =
    useUpdateSampleItemsMutation();

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
      await save(true);
    });
  };

  const save = async (isSubmitted: boolean) => {
    await updateSampleItems({
      id: partialSample.id,
      items,
    })
      .unwrap()
      .then((result) => {
        if (isSubmitted) {
          navigate(`/prelevements/${partialSample.id}?etape=4`, {
            replace: true,
          });
        }
      })
      .catch(() => {
        //TODO handle error
      });
  };

  const changeItems = (item: PartialSampleItem, index: number) => {
    const newItems = [...items];
    newItems[index] = item;
    setItems(newItems);
  };

  return (
    <>
      <form data-testid="draft_sample_2_form">
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
                options={selectOptionsFromList(['kg', 'g', 'mg', 'µg'])}
                onChange={(e) =>
                  changeItems({ ...item, quantityUnit: e.target.value }, index)
                }
                inputForm={form}
                inputKey="items"
                inputPathFromKey={[index, 'quantityUnit']}
                whenValid="Unité de quantité correctement renseignée."
                data-testid="quantityunit-select"
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
                      sealId: isNaN(Number(e.target.value))
                        ? items[index].sealId
                        : Number(e.target.value),
                    },
                    index
                  )
                }
                inputForm={form}
                inputKey="items"
                inputPathFromKey={[index, 'sealId']}
                whenValid="Numéro de scellé correctement renseigné."
                data-testid="sealid-input"
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
                  changeItems({ ...item, pooling: checked }, index)
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
                  data-testid="poolingcount-input"
                  label="Nombre d'unités (obligatoire)"
                  required
                />
              </div>
            )}
          </div>
        ))}
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
        >
          Ajouter un échantillon
        </Button>
        {isUpdateSuccess && (
          <Alert
            severity="success"
            title="Les données ont bien été enregistrées."
            className={cx('fr-mb-2w')}
          />
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
                children: 'Enregistrer',
                onClick: () => save(false),
                priority: 'secondary',
                type: 'button',
                nativeButtonProps: {
                  'data-testid': 'save-button',
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

export default SampleStep3;
