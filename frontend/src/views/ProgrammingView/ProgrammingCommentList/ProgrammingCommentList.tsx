import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { t } from 'i18next';
import { sumBy } from 'lodash-es';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import { FindLocalPrescriptionOptions } from 'maestro-shared/schema/LocalPrescription/FindLocalPrescriptionOptions';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import { getPrescriptionTitle } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ChangeEvent, useContext, useMemo, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useAppDispatch, useAppSelector } from '../../../hooks/useStore';
import { ApiClientContext } from '../../../services/apiClient';
import prescriptionsSlice from '../../../store/reducers/prescriptionsSlice';
import { pluralize } from '../../../utils/stringUtils';

interface Props {
  programmingPlan: ProgrammingPlanChecked;
}

const ProgrammingCommentList = ({ programmingPlan, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();
  const { hasNationalView } = useAuthentication();

  const { prescriptionFilters } = useAppSelector(
    (state) => state.prescriptions
  );
  const [matrixQuery, setMatrixQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<Region>();

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanId: programmingPlan.id,
      programmingPlanKinds: prescriptionFilters.kinds,
      contexts: prescriptionFilters.context
        ? [prescriptionFilters.context]
        : undefined,
      includes: ['substanceCount' as const]
    }),
    [programmingPlan, prescriptionFilters]
  );

  const { data: allPrescriptions } = apiClient.useFindPrescriptionsQuery(
    findPrescriptionOptions,
    {
      skip: !FindPrescriptionOptions.safeParse(findPrescriptionOptions).success
    }
  );

  const findLocalPrescriptionOptions = useMemo(
    () => ({
      ...findPrescriptionOptions,
      includes: ['comments' as const, 'sampleCounts' as const]
    }),
    [findPrescriptionOptions]
  );

  const { data: regionalPrescriptions } =
    apiClient.useFindLocalPrescriptionsQuery(findLocalPrescriptionOptions, {
      skip: !FindLocalPrescriptionOptions.safeParse(
        findLocalPrescriptionOptions
      ).success
    });

  const commentedPrescriptions = useMemo(
    () =>
      (allPrescriptions ?? [])
        .map((prescription) => ({
          ...prescription,
          regionalCommentedPrescriptions: (regionalPrescriptions ?? []).filter(
            (regionalPrescription) =>
              regionalPrescription.prescriptionId === prescription.id &&
              (regionalPrescription.comments ?? []).length > 0
          )
        }))

        .filter(
          (prescription) =>
            prescription.regionalCommentedPrescriptions?.length > 0
        ),
    [allPrescriptions, regionalPrescriptions]
  );

  const filteredPrescriptions = commentedPrescriptions
    .filter((prescription) =>
      getPrescriptionTitle(prescription)
        .toLowerCase()
        .includes(matrixQuery.toLowerCase())
    )
    .filter(
      (prescription) =>
        !regionFilter ||
        prescription.regionalCommentedPrescriptions.some(
          (regionalPrescription) => regionalPrescription.region === regionFilter
        )
    );

  if (!allPrescriptions || !regionalPrescriptions) {
    return <></>;
  }

  return (
    <>
      <div
        className={clsx(
          cx('fr-mb-2w', 'fr-mb-md-5w', 'fr-px-0', 'fr-container')
        )}
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
                      {getPrescriptionTitle(prescription)}
                    </h6>
                    <Button
                      priority="secondary"
                      onClick={() => {
                        dispatch(
                          prescriptionsSlice.actions.setPrescriptionCommentsData(
                            {
                              viewBy: 'Prescription',
                              programmingPlan,
                              prescription,
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
                                    programmingPlan,
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
                {prescriptionIndex !== filteredPrescriptions.length - 1 && (
                  <hr />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ProgrammingCommentList;
