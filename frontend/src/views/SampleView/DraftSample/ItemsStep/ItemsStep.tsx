import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { uniqBy } from 'lodash-es';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import {
  PartialSampleItem,
  SampleItem
} from 'maestro-shared/schema/Sample/SampleItem';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import React, { useState } from 'react';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import { useForm } from 'src/hooks/useForm';
import { usePartialSample } from 'src/hooks/usePartialSample';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { useCreateOrUpdateSampleMutation } from 'src/services/sample.service';
import PreviousButton from 'src/views/SampleView/DraftSample/PreviousButton';
import SampleItemDetails from 'src/views/SampleView/SampleItemDetails/SampleItemDetails';
import SavedAlert from 'src/views/SampleView/SavedAlert';
import { z } from 'zod';
import NextButton from '../NextButton';

const MaxItemCount = 3;

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
}

const ItemsStep = ({ partialSample }: Props) => {
  const { navigateToSample } = useSamplesLink();
  const { laboratory, readonly } = usePartialSample(partialSample);

  const [items, setItems] = useState<PartialSampleItem[]>(
    !isDefinedAndNotNull(partialSample.items) ||
      partialSample.items.length === 0
      ? [
          {
            sampleId: partialSample.id,
            itemNumber: 1,
            recipientKind: 'Laboratory'
          }
        ]
      : partialSample.items
  );
  const [notesOnItems, setNotesOnItems] = useState(partialSample?.notesOnItems);
  const [isSaved, setIsSaved] = useState(false);

  const [createOrUpdateSample] = useCreateOrUpdateSampleMutation();

  const Form = z.object({
    items: z
      .array(SampleItem)
      .min(1, { message: 'Veuillez renseigner au moins un échantillon.' })
      .refine(
        (items) => uniqBy(items, (item) => item.sealId).length === items.length,
        'Les numéros de scellés doivent être uniques.'
      ),
    notesOnItems: z.string().nullish()
  });

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      await save('Submitted');
      navigateToSample(partialSample.id, 4);
    });
  };

  const save = async (status = partialSample.status) => {
    await createOrUpdateSample({
      ...partialSample,
      notesOnItems,
      items: items.map((item) => ({
        ...item,
        compliance200263: item.compliance200263 ?? false
      })),
      status
    });
  };

  const changeItems = (item: PartialSampleItem, index: number) => {
    const newItems = [...items];
    newItems[index] = item;
    setItems(newItems);
  };

  const form = useForm(
    Form,
    {
      items,
      notesOnItems
    },
    save
  );

  return (
    <form data-testid="draft_sample_items_form" className="sample-form">
      <AppRequiredText />
      <div className="sample-items">
        {items?.map((item, itemIndex) => (
          <div
            className={clsx(
              cx('fr-callout', 'fr-callout--pink-tuile', 'fr-mb-0', 'fr-pb-2w'),
              'sample-callout'
            )}
            key={`item-${itemIndex}`}
          >
            <SampleItemDetails
              partialSample={partialSample}
              item={item}
              itemIndex={itemIndex}
              onRemoveItem={(index) => {
                const newItems = [...items];
                newItems.splice(index, 1);
                setItems(newItems);
              }}
              onChangeItem={changeItems}
              itemsForm={form}
              laboratory={laboratory}
              readonly={readonly}
            />
          </div>
        ))}
        {items.length < MaxItemCount && !readonly && (
          <Button
            iconId="fr-icon-add-line"
            priority="secondary"
            onClick={(e) => {
              e.preventDefault();
              setItems([
                ...items,
                {
                  sampleId: partialSample.id,
                  itemNumber: items.length + 1,
                  quantity: items[items.length - 1]?.quantity,
                  quantityUnit: items[items.length - 1]?.quantityUnit
                }
              ]);
            }}
            style={{
              alignSelf: 'center'
            }}
            data-testid="add-item-button"
          >
            Ajouter un échantillon
          </Button>
        )}
      </div>
      {form.hasIssue('items') && (
        <Alert
          severity="error"
          description={form.message('items') as string}
          small
          className={cx('fr-mb-4w')}
        />
      )}
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppTextAreaInput<FormShape>
            rows={1}
            defaultValue={notesOnItems ?? ''}
            onChange={(e) => setNotesOnItems(e.target.value)}
            inputForm={form}
            inputKey="notesOnItems"
            whenValid="Note correctement renseignée."
            data-testid="notes-input"
            label="Note additionnelle concernant les échantillons"
            disabled={readonly}
          />
        </div>
      </div>
      <hr className={cx('fr-mx-0')} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={clsx(cx('fr-col-12'), 'sample-actions')}>
          <ul
            className={cx(
              'fr-btns-group',
              'fr-btns-group--inline-md',
              'fr-btns-group--between',
              'fr-btns-group--icon-left'
            )}
          >
            <li>
              <ButtonsGroup
                alignment="left"
                inlineLayoutWhen="md and up"
                buttons={
                  !readonly
                    ? [
                        PreviousButton({
                          sampleId: partialSample.id,
                          onSave: async () => save('DraftMatrix'),
                          currentStep: 3
                        }),
                        {
                          children: 'Enregistrer en brouillon',
                          iconId: 'fr-icon-save-line',
                          priority: 'tertiary',
                          onClick: async (e: React.MouseEvent<HTMLElement>) => {
                            e.preventDefault();
                            await save();
                            setIsSaved(true);
                          }
                        }
                      ]
                    : [
                        PreviousButton({
                          sampleId: partialSample.id,
                          currentStep: 3
                        })
                      ]
                }
              />
            </li>
            <li>
              {!readonly ? (
                <Button
                  children="Continuer"
                  onClick={submit}
                  iconId="fr-icon-arrow-right-line"
                  iconPosition="right"
                  data-testid="submit-button"
                />
              ) : (
                <NextButton partialSample={partialSample} currentStep={3} />
              )}
            </li>
          </ul>
        </div>
      </div>
      <SavedAlert isOpen={isSaved} isDraft />
    </form>
  );
};

export default ItemsStep;
