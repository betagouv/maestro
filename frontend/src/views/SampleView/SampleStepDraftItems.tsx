import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PartialSample, Sample } from 'shared/schema/Sample/Sample';
import { PartialSampleItem } from 'shared/schema/Sample/SampleItem';
import { isDefinedAndNotNull } from 'shared/utils/utils';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import { useForm } from 'src/hooks/useForm';
import {
  useUpdateSampleItemsMutation,
  useUpdateSampleMutation,
} from 'src/services/sample.service';
import PreviousButton from 'src/views/SampleView/PreviousButton';
import SampleItemsCallout from 'src/views/SampleView/SampleItemsCallout';

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
  const [notesOnItems, setNotesOnItems] = useState(partialSample?.notesOnItems);

  const [updateSampleItems] = useUpdateSampleItemsMutation();
  const [updateSample] = useUpdateSampleMutation();

  const Form = Sample.pick({
    items: true,
    notesOnItems: true,
  });

  const form = useForm(Form, {
    items,
    notesOnItems,
  });

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      await save('Submitted');
      navigate(`/prelevements/${partialSample.id}?etape=4`, {
        replace: true,
      });
    });
  };

  const save = async (status = partialSample.status) => {
    await updateSampleItems({
      id: partialSample.id,
      items,
    });
    await updateSample({
      ...partialSample,
      notesOnItems,
      status,
    });
  };

  const changeItems = (item: PartialSampleItem, index: number) => {
    const newItems = [...items];
    newItems[index] = item;
    setItems(newItems);
  };

  return (
    <form
      data-testid="draft_sample_items_form"
      onChange={async (e) => {
        e.preventDefault();
        await save();
      }}
      className="sample-form"
    >
      <AppRequiredText />
      <div className="sample-items">
        <SampleItemsCallout
          items={items}
          onChangeItem={changeItems}
          itemsForm={form}
        />
        {items.length < MaxItemCount && (
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
                },
              ]);
            }}
            style={{
              alignSelf: 'center',
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
            label="Note additionnelle"
            hintText="Champ facultatif pour précisions supplémentaires"
          />
        </div>
      </div>
      <hr className={cx('fr-mx-0')} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
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
                  [
                    PreviousButton({
                      sampleId: partialSample.id,
                      onSave: async () => save('DraftMatrix'),
                      currentStep: 3,
                    }),
                    {
                      children: 'Enregistrer en brouillon',
                      iconId: 'fr-icon-save-line',
                      priority: 'tertiary',
                      onClick: async (e: React.MouseEvent<HTMLElement>) => {
                        e.preventDefault();
                        await save();
                      },
                    },
                  ] as any
                }
              />
            </li>
            <li>
              <Button
                children="Continuer"
                onClick={submit}
                iconId="fr-icon-arrow-right-line"
                iconPosition="right"
                data-testid="submit-button"
              />
            </li>
          </ul>
        </div>
      </div>
    </form>
  );
};

export default SampleStepDraftItems;
