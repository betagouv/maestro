import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { format, parse } from 'date-fns';
import { isNil, uniqBy } from 'lodash-es';
import { SubstanceKindLaboratorySort } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  isCreatedPartialSample,
  isProgrammingPlanSample,
  PartialSample,
  PartialSampleToCreate,
  SampleItemsDataChecked,
  sampleItemSealIdCheck
} from 'maestro-shared/schema/Sample/Sample';
import { PartialSampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { SampleStatusSteps } from 'maestro-shared/schema/Sample/SampleStatus';
import { MaestroDate } from 'maestro-shared/utils/date';
import { toArray } from 'maestro-shared/utils/utils';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import { useForm } from 'src/hooks/useForm';
import { usePartialSample } from 'src/hooks/usePartialSample';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import PreviousButton from 'src/views/SampleView/DraftSample/PreviousButton';
import SavedAlert from 'src/views/SampleView/SavedAlert';
import { z } from 'zod';
import AppServiceErrorAlert from '../../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppTextInput from '../../../../components/_app/AppTextInput/AppTextInput';
import SampleItems from '../../../../components/Sample/SampleItems/SampleItems';
import SampleProcedure from '../../../../components/Sample/SampleProcedure/SampleProcedure';
import { useAnalytics } from '../../../../hooks/useAnalytics';
import { useAuthentication } from '../../../../hooks/useAuthentication';
import { useAppSelector } from '../../../../hooks/useStore';
import { ApiClientContext } from '../../../../services/apiClient';
import NextButton from '../NextButton';
import SupportDocumentDownload from '../SupportDocumentDownload';

const ItemsStep = ({ partialSample }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { navigateToSample } = useSamplesLink();
  const { readonly } = usePartialSample(partialSample);
  const { trackEvent } = useAnalytics();
  const { user } = useAuthentication();

  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  const isSubmittingRef = useRef<boolean>(false);

  const [sampledAt, setSampledAt] = useState(
    format(partialSample.sampledAt ?? new Date(), 'yyyy-MM-dd HH:mm')
  );
  const [shippingDate, setShippingDate] = useState(partialSample.shippingDate);
  const [items, setItems] = useState(partialSample.items ?? []);
  const [notesOnItems, setNotesOnItems] = useState(partialSample.notesOnItems);
  const [isSaved, setIsSaved] = useState(false);

  const { initialSampledAt, isDefaultSampledAt } = useMemo(
    () =>
      partialSample.sampledAt
        ? {
            initialSampledAt: format(
              partialSample.sampledAt,
              'yyyy-MM-dd HH:mm'
            ),
            isDefaultSampledAt: false
          }
        : {
            initialSampledAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
            isDefaultSampledAt: true
          },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [createOrUpdateSample, createOrUpdateSampleCall] =
    apiClient.useCreateOrUpdateSampleMutation();

  const { data } = apiClient.useFindLocalPrescriptionsQuery(
    {
      programmingPlanId: partialSample.programmingPlanId as string,
      prescriptionId: partialSample.prescriptionId,
      contexts: toArray(
        ProgrammingPlanContext.safeParse(partialSample.context).data
      ),
      region: isCreatedPartialSample(partialSample)
        ? partialSample.region
        : user?.region,
      includes: 'laboratories',
      ...((programmingPlan as ProgrammingPlanChecked).distributionKind ===
      'SLAUGHTERHOUSE'
        ? {
            department: partialSample.department
          }
        : {})
    },
    {
      skip: !programmingPlan || !isProgrammingPlanSample(partialSample)
    }
  );

  const localPrescription = useMemo(
    () =>
      data?.find((_) =>
        (programmingPlan as ProgrammingPlanChecked).distributionKind ===
        'SLAUGHTERHOUSE'
          ? isNil(_.companySiret)
          : isNil(_.department)
      ),
    [data, programmingPlan]
  );

  useEffect(() => {
    if (
      programmingPlan &&
      !items?.length &&
      (localPrescription || !isProgrammingPlanSample(partialSample))
    ) {
      setItems(
        [
          ...(localPrescription?.substanceKindsLaboratories ??
            programmingPlan.substanceKinds.map((substanceKind) => ({
              substanceKind,
              laboratoryId: undefined
            })))
        ]
          .sort(SubstanceKindLaboratorySort)
          .map((substanceKindLaboratory, index) => ({
            sampleId: partialSample.id,
            itemNumber: index + 1,
            copyNumber: 1,
            recipientKind: 'Laboratory',
            laboratoryId: substanceKindLaboratory.laboratoryId,
            substanceKind: substanceKindLaboratory.substanceKind,
            compliance200263:
              partialSample.specificData.programmingPlanKind === 'PPV'
                ? undefined
                : true
          }))
      );
    }
  }, [localPrescription, programmingPlan]); // eslint-disable-line react-hooks/exhaustive-deps

  const Form = z.object(SampleItemsDataChecked.shape).pick({
    context: true,
    sampledAt: true,
    shippingDate: true,
    notesOnItems: true,
    items: true
  });

  const FormChecked = Form.check(sampleItemSealIdCheck).check((ctx) => {
    ctx.value.items.forEach((item, index) => {
      if (
        item.copyNumber === 1 &&
        isNil(item.laboratoryId) &&
        !isProgrammingPlanSample(partialSample)
      ) {
        ctx.issues.push({
          code: 'custom' as const,
          path: ['items', index, 'laboratoryId'],
          input: 'items',
          message: 'Veuillez sélectionner un laboratoire.'
        });
      }
    });
  });

  useEffect(
    () => {
      if (isSubmittingRef.current && !createOrUpdateSampleCall.isLoading) {
        isSubmittingRef.current = false;

        if (createOrUpdateSampleCall.isSuccess) {
          trackEvent(
            'sample',
            `submit_${partialSample.status}`,
            partialSample.id
          );
          if (initialSampledAt !== sampledAt) {
            trackEvent(
              'sample',
              isDefaultSampledAt
                ? 'change_default_sampled_at'
                : 'change_sampled_at',
              partialSample.id
            );
          }
          navigateToSample(partialSample.id, 4);
        }
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      createOrUpdateSampleCall.isSuccess,
      createOrUpdateSampleCall.isLoading,
      partialSample.id
    ]
  );

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      isSubmittingRef.current = true;
      await save('Submitted');
    });
  };

  const save = async (status = partialSample.status) => {
    await createOrUpdateSample({
      ...partialSample,
      sampledAt: parse(sampledAt, 'yyyy-MM-dd HH:mm', new Date()),
      shippingDate,
      notesOnItems,
      items: items.map((item) => ({
        ...item,
        laboratoryId: item.laboratoryId || undefined
      })),
      status
    });
  };

  const changeItem = (item: PartialSampleItem) =>
    setItems(
      items.map((_) =>
        _.itemNumber === item.itemNumber && _.copyNumber === item.copyNumber
          ? item
          : _
      )
    );

  const addItem = (item: PartialSampleItem) => {
    setItems([...items, item]);
  };

  const removeItem = (item: PartialSampleItem) => {
    setItems(
      items.filter(
        (_) =>
          !(
            _.itemNumber === item.itemNumber && _.copyNumber === item.copyNumber
          )
      )
    );
  };

  const form = useForm(
    FormChecked,
    {
      context: partialSample.context,
      sampledAt,
      shippingDate,
      items,
      notesOnItems
    },
    save
  );

  return (
    <form data-testid="draft_sample_items_form" className="sample-form">
      <div>
        <div className={clsx(cx('fr-mb-1v'), 'd-flex-align-center')}>
          <div className={clsx('flex-grow-1')}>
            <Button
              {...PreviousButton({
                sampleId: partialSample.id,
                currentStep: 3,
                onSave: readonly ? undefined : () => save('DraftMatrix')
              })}
              size="small"
              priority="tertiary no outline"
              className={cx('fr-pl-0')}
            >
              Étape précédente
            </Button>
          </div>
          {(!readonly ||
            (SampleStatusSteps[partialSample.status] as number) > 3) && (
            <Button
              size="small"
              priority="tertiary no outline"
              className={cx('fr-pr-0')}
              iconId="fr-icon-arrow-right-line"
              iconPosition="right"
              onClick={async (e) =>
                readonly ? navigateToSample(partialSample.id, 4) : submit(e)
              }
            >
              Étape suivante
            </Button>
          )}
        </div>
        <AppRequiredText />
      </div>
      <SampleProcedure partialSample={partialSample} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-6')}>
          <AppTextInput
            type="datetime-local"
            defaultValue={sampledAt}
            onChange={(e) => setSampledAt(e.target.value.replace('T', ' '))}
            inputForm={form}
            inputKey="sampledAt"
            whenValid="Date et heure de prélèvement correctement renseignés."
            data-testid="sampledAt-input"
            label="Date et heure de prélèvement"
            hintText="Format attendu › JJ/MM/AAAA HH:MM"
            required
            disabled={readonly}
          />
        </div>
        <div className={cx('fr-col-6')}>
          <AppTextInput
            type="date"
            defaultValue={shippingDate ?? ''}
            onChange={(e) => setShippingDate(e.target.value as MaestroDate)}
            inputForm={form}
            inputKey="shippingDate"
            whenValid="Date d'expédition"
            label="Date d'expédition"
            hintText="Format attendu › JJ/MM/AAAA"
            disabled={readonly}
          />
        </div>
      </div>
      <hr />
      <div>
        <h5>Échantillons</h5>
        <SampleItems
          partialSample={partialSample}
          items={items}
          onChangeItem={changeItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          readonly={readonly}
          form={form}
        />
      </div>

      {form.hasIssue('items') && (
        <Alert
          severity="error"
          description={form.message('items') as string}
          small
        />
      )}
      {form.hasIssue('items', [], {
        partial: true
      }) && (
        <div>
          {uniqBy(
            items.filter((_, itemIndex) =>
              form.hasIssue('items', [itemIndex], {
                partial: true
              })
            ),
            (_) => _.itemNumber
          ).map((item) => (
            <Alert
              severity="error"
              description={`La saisie de l'échantillon n°${item.itemNumber} est incorrecte`}
              key={`item-error-${item.itemNumber}`}
              small
            />
          ))}
        </div>
      )}
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppTextAreaInput
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
          <AppServiceErrorAlert call={createOrUpdateSampleCall} />
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
                  children="Récapitulatif"
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
        {isCreatedPartialSample(partialSample) && !readonly && (
          <SupportDocumentDownload partialSample={partialSample} />
        )}
      </div>
      <SavedAlert isOpen={isSaved} isDraft />
    </form>
  );
};

type Props = {
  partialSample: PartialSample | PartialSampleToCreate;
};

export default ItemsStep;
