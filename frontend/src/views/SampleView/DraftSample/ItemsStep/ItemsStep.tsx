import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { isNil, uniqBy } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import type { Region } from 'maestro-shared/referential/Region';
import { SubstanceKindLaboratorySort } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  isCreatedPartialSample,
  isProgrammingPlanSample,
  type PartialSample,
  type PartialSampleToCreate,
  SampleItemsDataChecked,
  sampleItemSealIdCheck
} from 'maestro-shared/schema/Sample/Sample';

import type { PartialSampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { SampleSteps } from 'maestro-shared/schema/Sample/SampleStep';
import { formatWithTz, type MaestroDate } from 'maestro-shared/utils/date';
import { checkSchema } from 'maestro-shared/utils/zod';
import type React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
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
import { ApiClientContext } from '../../../../services/apiClient';
import NextButton from '../NextButton';
import SupportDocumentDownload from '../SupportDocumentDownload';

const ItemsStep = ({ partialSample }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { navigateToSample } = useSamplesLink();
  const { readonly, programmingPlan } = usePartialSample(partialSample);
  const { trackEvent } = useAnalytics();
  const { user } = useAuthentication();

  const isSubmittingRef = useRef<boolean>(false);

  const [sampledDateTime, setSampledDateTime] = useState(
    `${partialSample.sampledDate ?? formatWithTz(new Date(), 'yyyy-MM-dd')}T${partialSample.sampledTime ?? formatWithTz(new Date(), 'HH:mm')}`
  );
  const [items, setItems] = useState(partialSample.items ?? []);
  const [notesOnItems, setNotesOnItems] = useState(partialSample.notesOnItems);
  const [isSaved, setIsSaved] = useState(false);

  const [createOrUpdateSample, createOrUpdateSampleCall] =
    apiClient.useCreateOrUpdateSampleMutation();

  const isSlaughterhouse =
    (programmingPlan as ProgrammingPlanChecked).distributionKind ===
    'SLAUGHTERHOUSE';
  const skipQuery = !partialSample.prescriptionId || !user?.region;
  const prescriptionQueryBase = {
    prescriptionId: partialSample.prescriptionId as string,
    region: isCreatedPartialSample(partialSample)
      ? partialSample.region
      : (user?.region as Region),
    includes: 'laboratories' as const
  };

  const { data: localPrescriptionByRegion } =
    apiClient.useGetLocalPrescriptionQuery(prescriptionQueryBase, {
      skip: skipQuery || isSlaughterhouse
    });
  const { data: localPrescriptionByCompany } =
    apiClient.useGetLocalPrescriptionByCompanyQuery(
      {
        ...prescriptionQueryBase,
        department: partialSample.department as Department,
        companySiret: partialSample.company?.siret ?? ''
      },
      { skip: skipQuery || !isSlaughterhouse }
    );
  const localPrescription =
    localPrescriptionByRegion ?? localPrescriptionByCompany;

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
              partialSample.programmingPlanKind === 'PPV' ? undefined : true
          }))
      );
    }
  }, [localPrescription, programmingPlan]); // eslint-disable-line react-hooks/exhaustive-deps

  const Form = z.object({
    sampledDateTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, {
      error: () => 'La date et heure de prélèvement sont invalides.'
    }),
    notesOnItems: SampleItemsDataChecked.shape.notesOnItems,
    items: SampleItemsDataChecked.shape.items
  });

  const FormChecked = checkSchema(Form, sampleItemSealIdCheck, (ctx) => {
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
    if (!isSubmittingRef.current) {
      await form.validate(async () => {
        isSubmittingRef.current = true;
        await save('Submitted');
      });
    }
  };

  const save = async (step = partialSample.step) => {
    const [sampledDate, sampledTime] = sampledDateTime.split('T') as [
      string,
      string
    ];
    await createOrUpdateSample({
      ...partialSample,
      sampledDate: sampledDate as MaestroDate,
      sampledTime,
      notesOnItems,
      items: items.map((item) => ({
        ...item,
        laboratoryId: item.laboratoryId || undefined
      })),
      step
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
      sampledDateTime,
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
          {(!readonly || SampleSteps[partialSample.step] > 3) && (
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
            defaultValue={sampledDateTime}
            onChange={(e) => setSampledDateTime(e.target.value)}
            inputForm={form}
            inputKey="sampledDateTime"
            whenValid="Date et heure de prélèvement correctement renseignées."
            data-testid="sampledDateTime-input"
            label="Date et heure de prélèvement"
            required
            disabled={readonly}
          />
        </div>
      </div>
      <hr />
      {items && (
        <div>
          <h5>Échantillons</h5>
          {items.length ? (
            <SampleItems
              partialSample={partialSample}
              items={items}
              onChangeItem={changeItem}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              readonly={readonly}
              form={form}
            />
          ) : (
            <Alert
              severity="warning"
              small={true}
              description="Il n'y a pas de substance à analyser pour ce prélèvement ou le laboratoire n'a pas été affecté. Veuillez contacter votre coordinateur."
            />
          )}
        </div>
      )}

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
                  onClick={submit}
                  iconId="fr-icon-arrow-right-line"
                  iconPosition="right"
                  data-testid="submit-button"
                >
                  Récapitulatif
                </Button>
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
      <SavedAlert isOpen={isSaved} isDraft sample={partialSample} />
    </form>
  );
};

type Props = {
  partialSample: PartialSample | PartialSampleToCreate;
};

export default ItemsStep;
