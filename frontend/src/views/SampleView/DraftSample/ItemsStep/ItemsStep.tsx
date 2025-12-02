import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { format, parse } from 'date-fns';
import { isNil, maxBy } from 'lodash-es';
import { SubstanceKindLaboratorySort } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  isCreatedPartialSample,
  isProgrammingPlanSample,
  PartialSample,
  PartialSampleToCreate,
  SampleItemsData,
  uniqueSampleItemSealIdCheck
} from 'maestro-shared/schema/Sample/Sample';
import {
  PartialSampleItem,
  SampleItemMaxCopyCount,
  SampleItemSort
} from 'maestro-shared/schema/Sample/SampleItem';
import { toArray } from 'maestro-shared/utils/utils';
import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import { useForm } from 'src/hooks/useForm';
import { usePartialSample } from 'src/hooks/usePartialSample';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import PreviousButton from 'src/views/SampleView/DraftSample/PreviousButton';
import SampleItemDetails from 'src/views/SampleView/SampleItemDetails/SampleItemDetails';
import SavedAlert from 'src/views/SampleView/SavedAlert';
import AppServiceErrorAlert from '../../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import AppTextInput from '../../../../components/_app/AppTextInput/AppTextInput';
import { useAnalytics } from '../../../../hooks/useAnalytics';
import { useAuthentication } from '../../../../hooks/useAuthentication';
import { useAppSelector } from '../../../../hooks/useStore';
import { ApiClientContext } from '../../../../services/apiClient';
import NextButton from '../NextButton';

type Props = {
  partialSample: PartialSample | PartialSampleToCreate;
};

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
      ...((programmingPlan as ProgrammingPlan).distributionKind ===
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
        (programmingPlan as ProgrammingPlan).distributionKind ===
        'SLAUGHTERHOUSE'
          ? isNil(_.companySiret)
          : isNil(_.department)
      ),
    [data, programmingPlan]
  );

  useEffect(() => {
    if (
      programmingPlan &&
      (isNil(items) ||
        (items.length === 0 &&
          (localPrescription || !isProgrammingPlanSample(partialSample))))
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
            substanceKind: substanceKindLaboratory.substanceKind
          }))
      );
    }
  }, [localPrescription, programmingPlan]); // eslint-disable-line react-hooks/exhaustive-deps

  const Form = SampleItemsData.pick({
    sampledAt: true,
    notesOnItems: true,
    items: true
  });

  const FormRefinement = Form.check(uniqueSampleItemSealIdCheck);

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
      notesOnItems,
      items,
      status
    });
  };

  const changeItems = (item: PartialSampleItem) =>
    setItems(
      items.map((_) =>
        _.itemNumber === item.itemNumber && _.copyNumber === item.copyNumber
          ? item
          : _
      )
    );

  const form = useForm(
    FormRefinement,
    {
      sampledAt,
      items: items,
      notesOnItems
    },
    save
  );

  return (
    <form data-testid="draft_sample_items_form" className="sample-form">
      <div>
        <Button
          {...PreviousButton({
            sampleId: partialSample.id,
            currentStep: 3,
            onSave: readonly ? undefined : () => save('DraftMatrix')
          })}
          size="small"
          priority="tertiary no outline"
          className={cx('fr-pl-0', 'fr-mb-1v')}
        >
          Étape précédente
        </Button>
        <AppRequiredText />
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
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
      </div>
      <div className={cx('fr-col-12')}>
        <hr />
      </div>
      <div>
        <h5>Échantillons</h5>
        <div className={clsx('sample-items')}>
          {[...items]?.sort(SampleItemSort).map((item, itemIndex) => (
            <Fragment key={`item-${itemIndex}`}>
              <SampleItemDetails
                partialSample={partialSample}
                item={item}
                itemIndex={itemIndex}
                onRemoveItem={(item: PartialSampleItem) =>
                  setItems(
                    items
                      .filter((_) => _ !== item)
                      .map((_) => ({
                        ..._,
                        copyNumber:
                          _.itemNumber === item.itemNumber &&
                          _.copyNumber > item.copyNumber
                            ? _.copyNumber - 1
                            : _.copyNumber
                      }))
                  )
                }
                onChangeItem={changeItems}
                itemsForm={form}
                readonly={readonly}
              />
              {item.copyNumber < SampleItemMaxCopyCount && !readonly && (
                <hr className={cx('fr-mx-0')} />
              )}
              {item ===
                maxBy(
                  items.filter((_) => _.itemNumber === item.itemNumber),
                  'copyNumber'
                ) &&
                item.copyNumber < SampleItemMaxCopyCount &&
                !readonly && (
                  <Button
                    priority="tertiary no outline"
                    onClick={(e) => {
                      e.preventDefault();
                      setItems(
                        [
                          ...items,
                          {
                            sampleId: partialSample.id,
                            itemNumber: item.itemNumber,
                            copyNumber: item.copyNumber + 1,
                            quantity: item.quantity,
                            quantityUnit: item.quantityUnit,
                            substanceKind: item.substanceKind
                          }
                        ].sort(SampleItemSort)
                      );
                    }}
                    className={cx('fr-my-1w')}
                    size="small"
                    style={{
                      alignSelf: 'center'
                    }}
                    data-testid="add-item-button"
                  >
                    Ajouter un exemplaire
                  </Button>
                )}
            </Fragment>
          ))}
        </div>
      </div>
      {form.hasIssue('items') && (
        <Alert
          severity="error"
          description={form.message('items') as string}
          small
        />
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
      </div>
      <SavedAlert isOpen={isSaved} isDraft />
    </form>
  );
};

export default ItemsStep;
