import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import {
  PrimaryQuantityUnitList,
  QuantityUnit,
  QuantityUnitLabels,
  SecondaryQuantityUnitList,
} from 'shared/referential/QuantityUnit';
import { Sample } from 'shared/schema/Sample/Sample';
import { PartialSampleItem } from 'shared/schema/Sample/SampleItem';
import AppResponsiveButton from 'src/components/_app/AppResponsiveButton/AppResponsiveButton';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';

interface Props {
  items: PartialSampleItem[];
  onRemoveItem?: (itemIndex: number) => void;
  onChangeItem?: (item: PartialSampleItem, itemIndex: number) => void;
  itemsForm?: ReturnType<typeof useForm>;
}

const SampleItemsCallout = ({
  items,
  onRemoveItem,
  onChangeItem,
  itemsForm,
}: Props) => {
  const Form = Sample.pick({
    items: true,
  });

  type FormShape = typeof Form.shape;

  const fakeForm = useForm(Form, {
    items,
  });

  const form = itemsForm ?? fakeForm;

  return (
    <>
      {items?.map((item, itemIndex) => (
        <div
          className={clsx(
            cx('fr-callout', 'fr-callout--pink-tuile', 'fr-mb-0', 'fr-pb-2w'),
            'sample-item'
          )}
          key={`item-${itemIndex}`}
        >
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-8')}>
              <Badge noIcon severity="warning">
                Echantillon {itemIndex + 1}
              </Badge>
            </div>
            <div className={cx('fr-col-4')}>
              {itemIndex > 0 && itemsForm && (
                <AppResponsiveButton
                  children="Supprimer"
                  title="Supprimer"
                  iconId="fr-icon-delete-line"
                  priority="tertiary"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    onRemoveItem?.(itemIndex);
                  }}
                  className={clsx(cx('fr-mt-0'), 'float-right')}
                  data-testid={`remove-item-button-${itemIndex}`}
                />
              )}
            </div>
            <div className={cx('fr-col-6', 'fr-col-sm-3')}>
              <AppTextInput<FormShape>
                value={item.quantity ?? ''}
                onChange={(e) =>
                  onChangeItem?.(
                    { ...item, quantity: Number(e.target.value) },
                    itemIndex
                  )
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
                disabled={!itemsForm}
                required
              />
            </div>
            <div className={cx('fr-col-6', 'fr-col-sm-3')}>
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
                  onChangeItem?.(
                    {
                      ...item,
                      quantityUnit: e.target.value as QuantityUnit,
                    },
                    itemIndex
                  )
                }
                inputForm={form}
                inputKey="items"
                inputPathFromKey={[itemIndex, 'quantityUnit']}
                whenValid="Unité de quantité correctement renseignée."
                data-testid={`item-unit-select-${itemIndex}`}
                hint="Unité de mesure"
                disabled={!itemsForm}
                required
              />
            </div>
            <div className={cx('fr-col-12', 'fr-col-sm-6')}>
              <AppTextInput<FormShape>
                value={item.sealId ?? ''}
                onChange={(e) =>
                  onChangeItem?.(
                    {
                      ...item,
                      sealId: e.target.value,
                    },
                    itemIndex
                  )
                }
                inputForm={form}
                inputKey="items"
                inputPathFromKey={[itemIndex, 'sealId']}
                whenValid="Numéro de scellé correctement renseigné."
                data-testid={`item-sealid-input-${itemIndex}`}
                label="Numéro de scellé"
                hintText="Inscrit sur le lien autobloquant de scellé"
                disabled={!itemsForm}
                required
              />
            </div>
            <div className={cx('fr-col-12', 'fr-col-sm-12')}>
              <ToggleSwitch
                label="Respect directive 2002/63"
                checked={item.compliance200263 ?? false}
                onChange={(checked) =>
                  onChangeItem?.(
                    { ...item, compliance200263: checked },
                    itemIndex
                  )
                }
                showCheckedHint={false}
                disabled={!itemsForm}
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SampleItemsCallout;
