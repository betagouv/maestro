import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import { isEmpty, mapValues, omitBy } from 'lodash-es';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  Context,
  ContextLabels,
  ContextList
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  NextProgrammingPlanStatus,
  ProgrammingPlanStatus
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { RegionalPrescriptionKey } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import programmation from '../../assets/illustrations/programmation.svg';
import AppToast from '../../components/_app/AppToast/AppToast';
import PrescriptionCommentsModal from '../../components/Prescription/PrescriptionCommentsModal/PrescriptionCommentsModal';
import ProgrammingPlanNationalValidation from '../../components/ProgrammingPlan/ProgrammingPlanNationalValidation/ProgrammingPlanNationalValidation';
import ProgrammingPlanRegionalValidation from '../../components/ProgrammingPlan/ProgrammingPlanRegionalValidation/ProgrammingPlanRegionalValidation';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { useCommentRegionalPrescriptionMutation } from '../../services/regionalPrescription.service';
import prescriptionsSlice from '../../store/reducers/prescriptionsSlice';
import ProgrammingPlanCommentList from './ProgrammingPlanCommentList/ProgrammingPlanCommentList';
import ProgrammingPlanPrescriptionList from './ProgrammingPlanPrescriptionList/ProgrammingPlanPrescriptionList';
import ProgrammingPlanRegionalValidationList from './ProgrammingPlanRegionalValidationList/ProgrammingPlanApprovalList';

const ProgrammingPlanView = () => {
  const dispatch = useAppDispatch();
  useDocumentTitle('Programmation');

  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);
  const { prescriptionListContext } = useAppSelector(
    (state) => state.prescriptions
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const { user, hasNationalView } = useAuthentication();

  const region = useMemo(
    () =>
      hasNationalView
        ? ((searchParams.get('region') as Region) ?? undefined)
        : user?.region,
    [hasNationalView, user, searchParams]
  );

  const [commentRegionalPrescription, { isSuccess: isCommentSuccess }] =
    useCommentRegionalPrescriptionMutation();

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanId: programmingPlan?.id as string,
      context: prescriptionListContext,
      region,
      includes: ['substanceCount' as const]
    }),
    [programmingPlan, prescriptionListContext, region]
  );

  const changeFilter = useCallback(
    (findFilter: Partial<FindPrescriptionOptions>) => {
      const filteredParams = omitBy(
        {
          ...mapValues(findPrescriptionOptions, (value) => value?.toString()),
          ...mapValues(findFilter, (value) => value?.toString())
        },
        isEmpty
      );

      const urlSearchParams = new URLSearchParams(
        filteredParams as Record<string, string>
      );

      setSearchParams(urlSearchParams, { replace: true });
    },
    [findPrescriptionOptions] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (searchParams.get('context')) {
      dispatch(
        prescriptionsSlice.actions.changeListContext(
          searchParams.get('context') as Context
        )
      );
    }
  }, [searchParams, dispatch]);

  const submitRegionalPrescriptionComment = useCallback(
    async (
      regionalPrescriptionKey: RegionalPrescriptionKey,
      comment: string
    ) => {
      await commentRegionalPrescription({
        prescriptionId: regionalPrescriptionKey.prescriptionId,
        region: regionalPrescriptionKey.region,
        commentToCreate: {
          programmingPlanId: programmingPlan?.id as string,
          comment
        }
      });
    },
    [programmingPlan] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <>
      <AppToast open={isCommentSuccess} description="Commentaire ajouté" />
      <section className="main-section">
        <div className={cx('fr-container')}>
          <SectionHeader
            title={`Programmation ${programmingPlan?.year}`}
            subtitle={Regions[region as Region]?.name}
            illustration={programmation}
            action={
              <>
                <SegmentedControl
                  hideLegend
                  legend="Contexte"
                  segments={
                    ContextList.map((context) => ({
                      label: ContextLabels[context],
                      nativeInputProps: {
                        checked: context === findPrescriptionOptions.context,
                        onChange: () =>
                          changeFilter({
                            context
                          })
                      }
                    })) as any
                  }
                />
                {programmingPlan &&
                  programmingPlan.regionalStatus.some(
                    (regionalStatus) =>
                      NextProgrammingPlanStatus[regionalStatus.status] &&
                      ['Submitted', 'Validated'].includes(
                        NextProgrammingPlanStatus[
                          regionalStatus.status
                        ] as ProgrammingPlanStatus
                      )
                  ) && (
                    <ProgrammingPlanNationalValidation
                      programmingPlan={programmingPlan}
                    />
                  )}
              </>
            }
          />
        </div>

        {programmingPlan && (
          <div className={cx('fr-container')}>
            <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
              {!hasNationalView &&
                programmingPlan.regionalStatus.some(
                  (regionalStatus) =>
                    regionalStatus.region === region &&
                    ['Submitted', 'Approved'].includes(regionalStatus.status)
                ) && (
                  <ProgrammingPlanRegionalValidation
                    programmingPlan={programmingPlan}
                    region={region as Region}
                  />
                )}
              <div className={cx('fr-col-12')}>
                <Tabs
                  classes={{
                    panel: 'white-container'
                  }}
                  tabs={
                    [
                      {
                        label: 'Programmation',
                        content: (
                          <ProgrammingPlanPrescriptionList
                            programmingPlan={programmingPlan}
                            context={prescriptionListContext}
                            region={region ?? undefined}
                          />
                        )
                      },
                      ...(hasNationalView
                        ? [
                            {
                              label: 'Phase de consultation',
                              content: (
                                <ProgrammingPlanRegionalValidationList
                                  programmingPlan={programmingPlan}
                                  context={prescriptionListContext}
                                />
                              ),
                              iconId: 'fr-icon-chat-check-line'
                            },
                            {
                              label: 'Commentaires',
                              content: (
                                <ProgrammingPlanCommentList
                                  programmingPlan={programmingPlan}
                                  context={prescriptionListContext}
                                />
                              ),
                              iconId: 'fr-icon-chat-3-line'
                            }
                          ]
                        : [])
                    ] as any
                  }
                />
              </div>
            </div>
            <PrescriptionCommentsModal
              onSubmitRegionalPrescriptionComment={
                submitRegionalPrescriptionComment
              }
            />
          </div>
        )}
      </section>
    </>
  );
};

export default ProgrammingPlanView;
