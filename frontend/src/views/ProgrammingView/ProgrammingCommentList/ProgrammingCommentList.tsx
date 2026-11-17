import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import { getPrescriptionTitle } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { includesIgnoringAccents } from 'maestro-shared/utils/utils';
import { type ChangeEvent, useContext, useMemo, useState } from 'react';
import { useMatrixReferential } from 'src/hooks/useMatrixReferential';
import { t } from 'src/i18n';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import { pluralize } from '../../../utils/stringUtils';
import { findPrescriptionPlan } from '../prescriptionPlan';

interface Props {
  programmingPlans: ProgrammingPlanChecked[];
}

const ProgrammingCommentList = ({ programmingPlans, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();
  const { hasNationalView } = useAuthentication();
  const matrixReferential = useMatrixReferential();

  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );
  const [matrixQuery, setMatrixQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<Region>();

  const programmingPlanIds = useMemo(
    () => programmingPlans.map((plan) => plan.id),
    [programmingPlans]
  );

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanIds,
      programmingSubPlanIds: prescriptionFilters.programmingSubPlanIds,
      contexts: prescriptionFilters.contexts
    }),
    [programmingPlanIds, prescriptionFilters]
  );

  const { data: allPrescriptions } = apiClient.useFindPrescriptionsQuery(
    findPrescriptionOptions,
    {
      skip: !FindPrescriptionOptions.safeParse(findPrescriptionOptions).success
    }
  );

  const findLocalPrescriptionOptions = useMemo(
    () => ({
      programmingPlanIds,
      programmingSubPlanIds: prescriptionFilters.programmingSubPlanIds,
      contexts: prescriptionFilters.contexts,
      includes: ['comments' as const, 'sampleCounts' as const]
    }),
    [programmingPlanIds, prescriptionFilters]
  );

  const { data: regionalPrescriptions } =
    apiClient.useFindLocalPrescriptionsQuery(findLocalPrescriptionOptions, {
      skip: !findLocalPrescriptionOptions.programmingPlanIds?.length
    });

  const commentedPrescriptions = useMemo(
    () =>
      (allPrescriptions ?? []).flatMap((prescription) => {
        const programmingPlan = findPrescriptionPlan(
          programmingPlans,
          prescription
        );
        const regionalCommentedPrescriptions = (
          regionalPrescriptions ?? []
        ).filter(
          (regionalPrescription) =>
            regionalPrescription.prescriptionId === prescription.id &&
            (regionalPrescription.comments ?? []).length > 0
        );

        return programmingPlan && regionalCommentedPrescriptions.length > 0
          ? [
              {
                ...prescription,
                programmingPlan,
                regionalCommentedPrescriptions
              }
            ]
          : [];
      }),
    [allPrescriptions, regionalPrescriptions, programmingPlans]
  );

  const filteredPrescriptions = commentedPrescriptions
    .filter((prescription) =>
      includesIgnoringAccents(
        getPrescriptionTitle(matrixReferential, programmingPlans, prescription),
        matrixQuery
      )
    )
    .filter(
      (prescription) =>
        !regionFilter ||
        prescription.regionalCommentedPrescriptions.some(
          (regionalPrescription) => regionalPrescription.region === regionFilter
        )
    );

  if (!allPrescriptions || !regionalPrescriptions) {
    return null;
  }

  return (
    <div
      className={clsx(cx('fr-mb-2w', 'fr-mb-md-5w', 'fr-px-0', 'fr-container'))}
    >
      <div className={clsx('d-flex-align-center')}>
        <h4 className={clsx(cx('fr-mb-0', 'fr-mr-3w'), 'flex-grow-1')}>
          {t('matrix', {
            count: filteredPrescriptions.length
          })}{' '}
          {t('has_been_commented', {
            count: filteredPrescriptions.length
          })}
        </h4>
        {hasNationalView && (
          <Select
            label="Région"
            className={cx('fr-mr-2w')}
            nativeSelectProps={{
              value: regionFilter ?? '',
              onChange: (e) => setRegionFilter(e.target.value as Region)
            }}
          >
            <option value="">Toutes les régions</option>
            {RegionList.map((region) => (
              <option key={`select-region-${region}`} value={region}>
                {Regions[region].name}
              </option>
            ))}
          </Select>
        )}
        <Input
          iconId="fr-icon-search-line"
          hideLabel
          label="Matrice"
          nativeInputProps={{
            type: 'search',
            placeholder: 'Matrice',
            value: matrixQuery ?? '',
            onChange: (e: ChangeEvent<HTMLInputElement>) =>
              setMatrixQuery(e.target.value)
          }}
        />
      </div>
      <div>
        {regionFilter && (
          <Tag
            dismissible
            nativeButtonProps={{
              onClick: () => setRegionFilter(undefined)
            }}
          >
            {Regions[regionFilter].name}
          </Tag>
        )}
      </div>
      {filteredPrescriptions.length > 0 && (
        <div className={clsx(cx('fr-mt-2w'), 'border')}>
          {filteredPrescriptions.map((prescription, prescriptionIndex) => (
            <div key={`prescription-${prescriptionIndex}`}>
              <div className={cx('fr-m-2w')}>
                <div className={clsx('d-flex-align-center')}>
                  <h6 className="flex-grow-1">
                    {getPrescriptionTitle(
                      matrixReferential,
                      programmingPlans,
                      prescription
                    )}
                  </h6>
                  <Button
                    priority="secondary"
                    onClick={() => {
                      dispatch(
                        prescriptionsSlice.actions.setPrescriptionCommentsData({
                          viewBy: 'Prescription',
                          programmingPlan: prescription.programmingPlan,
                          prescription,
                          regionalCommentsList:
                            prescription.regionalCommentedPrescriptions.map(
                              (rcp) => ({
                                region: rcp.region,
                                department: rcp.department,
                                comments: rcp.comments ?? []
                              })
                            )
                        })
                      );
                    }}
                  >
                    {sumBy(
                      prescription.regionalCommentedPrescriptions,
                      (rcp) => (rcp.comments ?? []).length
                    )}{' '}
                    {pluralize(
                      sumBy(
                        prescription.regionalCommentedPrescriptions,
                        (rcp) => (rcp.comments ?? []).length
                      )
                    )('commentaire')}
                  </Button>
                </div>
                {hasNationalView && (
                  <div>
                    Régions :
                    {prescription.regionalCommentedPrescriptions.map(
                      (regionalPrescription) => (
                        <Button
                          className={clsx('link-underline')}
                          key={`${prescription.id}-region-${regionalPrescription.region}`}
                          priority="tertiary no outline"
                          onClick={() => {
                            dispatch(
                              prescriptionsSlice.actions.setPrescriptionCommentsData(
                                {
                                  viewBy: 'Prescription',
                                  programmingPlan: prescription.programmingPlan,
                                  prescription,
                                  currentRegion: regionalPrescription.region,
                                  regionalCommentsList:
                                    prescription.regionalCommentedPrescriptions.map(
                                      (rcp) => ({
                                        region: rcp.region,
                                        department: rcp.department,
                                        comments: rcp.comments ?? []
                                      })
                                    )
                                }
                              )
                            );
                          }}
                        >
                          {Regions[regionalPrescription.region].name}
                        </Button>
                      )
                    )}
                  </div>
                )}
              </div>
              {prescriptionIndex !== filteredPrescriptions.length - 1 && <hr />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgrammingCommentList;
