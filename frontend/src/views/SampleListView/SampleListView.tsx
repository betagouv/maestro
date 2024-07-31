import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import Select from '@codegouvfr/react-dsfr/Select';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { format } from 'date-fns';
import { t } from 'i18next';
import { default as fp, default as _ } from 'lodash';
import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Department,
  DepartmentLabels,
  DepartmentList,
} from 'shared/referential/Department';
import { Matrix, MatrixList } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Region, RegionList, Regions } from 'shared/referential/Region';
import { defaultPerPage } from 'shared/schema/commons/Pagination';
import { FindSampleOptions } from 'shared/schema/Sample/FindSampleOptions';
import { isPartialSample } from 'shared/schema/Sample/Sample';
import {
  DraftStatusList,
  SampleStatus,
  SampleStatusLabels,
  SampleStatusList,
} from 'shared/schema/Sample/SampleStatus';
import { isDefinedAndNotNull } from 'shared/utils/utils';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import { useFindPrescriptionsQuery } from 'src/services/prescription.service';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import {
  getSampleListExportURL,
  useCountSamplesQuery,
  useFindSamplesQuery,
} from 'src/services/sample.service';
import samplesSlice from 'src/store/reducers/samplesSlice';
import { getURLQuery } from 'src/utils/fetchUtils';
import RemoveSample from 'src/views/SampleListView/RemoveSample';
import food from '../../assets/illustrations/food.svg';
import './SampleList.scss';
const SampleListView = () => {
  useDocumentTitle('Liste des prélèvements');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { pendingSamples } = useAppSelector((state) => state.samples);

  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission, hasNationalView, userInfos } = useAuthentication();
  const { findSampleOptions } = useAppSelector((state) => state.samples);
  const { isMobile } = useWindowSize();

  useEffect(() => {
    if (searchParams) {
      const status = searchParams.get('status') as SampleStatus;
      dispatch(
        samplesSlice.actions.changeFindOptions({
          programmingPlanId: searchParams.get('programmingPlanId') ?? undefined,
          region:
            userInfos?.region ??
            (searchParams.get('region') as Region) ??
            undefined,
          department:
            (searchParams.get('department') as Department) ?? undefined,
          status: status === 'Draft' ? DraftStatusList : status ?? undefined,
          matrix: searchParams.get('matrix') as Matrix,
          page: Number(searchParams.get('page')) || 1,
          perPage: defaultPerPage,
        })
      );
    }
  }, [searchParams, userInfos?.region]); // eslint-disable-line react-hooks/exhaustive-deps

  const { programmingPlanStatus } = useAppSelector((state) => state.settings);
  const { data } = useFindSamplesQuery(findSampleOptions);
  const samples = _.unionBy(
    Object.values(pendingSamples),
    data ?? [],
    (_) => _.id
  );
  const { data: samplesCount } = useCountSamplesQuery(
    fp.omit(findSampleOptions, 'page', 'perPage')
  );
  const { data: programmingPlans } = useFindProgrammingPlansQuery(
    { status: programmingPlanStatus },
    { skip: !programmingPlanStatus }
  );
  const { data: prescriptions } = useFindPrescriptionsQuery(
    { programmingPlanId: findSampleOptions.programmingPlanId as string },
    {
      skip: !findSampleOptions.programmingPlanId,
    }
  );

  const initFilter = () => {
    setSearchParams();
    dispatch(
      samplesSlice.actions.changeFindOptions(
        samplesSlice.getInitialState().findSampleOptions
      )
    );
  };

  const changeFilter = (findFilter: Partial<FindSampleOptions>) => {
    setSearchParams(
      fp.omit(
        fp.omitBy(
          {
            ...fp.mapValues(findSampleOptions, (value) => value?.toString()),
            ...fp.mapValues(findFilter, (value) => value?.toString()),
          },
          fp.isEmpty
        ),
        'page',
        'perPage'
      )
    );
  };

  const departmentOptions = useMemo(() => {
    const region = userInfos?.region ?? findSampleOptions.region;
    return region ? Regions[region as Region].departments : DepartmentList;
  }, [userInfos?.region, findSampleOptions.region]);

  const tableHeaders = [
    'id', //TODO: remove it
    'Matrice',
    'Préleveur',
    'Date',
    'Département',
    'Entité',
    'Contexte',
    'Statut',
    'Actions',
  ];

  const tableData = useMemo(
    () =>
      (samples ?? []).map((sample) => [
        ...[
          sample.id, //TODO: remove it
          (sample.matrix && MatrixLabels[sample.matrix]) ?? '',
          isPartialSample(sample)
            ? `${sample.sampler.firstName} ${sample.sampler.lastName}`
            : `${userInfos?.firstName} ${userInfos?.lastName}`,
          format(sample.sampledAt, 'dd/MM/yyyy'),
          sample.department,
          sample.company?.name ?? '',
          programmingPlans?.find((plan) => plan.id === sample.programmingPlanId)
            ?.title ?? '',
          <SampleStatusBadge status={sample?.status as SampleStatus} />,
        ].map((cell) => (
          <div
            onClick={() => navigate(`/prelevements/${sample.id}`)}
            style={{
              cursor: 'pointer',
            }}
          >
            {cell}
          </div>
        )),
        <div className="actions">
          <Button
            title="Voir le prélèvement"
            iconId={'fr-icon-eye-fill'}
            linkProps={{
              to: `/prelevements/${sample.id}`,
            }}
            size="small"
            priority="tertiary"
          />
          {hasPermission('deleteSample') &&
            DraftStatusList.includes(sample.status) && (
              <RemoveSample sample={sample} />
            )}
        </div>,
      ]),
    [samples, programmingPlans] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title="Prélèvements"
        subtitle="Consultez les dossiers des prélèvements"
        illustration={food}
        action={
          <>
            {hasPermission('createSample') && (
              <Button
                linkProps={{
                  to: '/prelevements/nouveau',
                  target: '_self',
                }}
                iconId="fr-icon-microscope-line"
              >
                Saisir un prélèvement
              </Button>
            )}
          </>
        }
      />
      <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          {hasNationalView && (
            <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
              <Select
                label="Région"
                nativeSelectProps={{
                  value: findSampleOptions.region || '',
                  onChange: (e) => {
                    changeFilter({
                      region: e.target.value as Region,
                      department: undefined,
                    });
                  },
                }}
              >
                <option value="">Toutes les régions</option>
                {RegionList.map((region) => (
                  <option key={`region-${region}`} value={region}>
                    {Regions[region].name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
            <Select
              label="Département"
              nativeSelectProps={{
                value: findSampleOptions.department || '',
                onChange: (e) => {
                  changeFilter({ department: e.target.value as Department });
                },
              }}
            >
              <option value="">Tous les départements</option>
              {departmentOptions.map((department) => (
                <option key={`department-${department}`} value={department}>
                  {`${department} - ${DepartmentLabels[department]}`}
                </option>
              ))}
            </Select>
          </div>
          <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
            <Select
              label="Statut"
              nativeSelectProps={{
                value: findSampleOptions.status || '',
                onChange: (e) => {
                  changeFilter({ status: e.target.value as SampleStatus });
                },
              }}
            >
              <option value="">Tous les statuts</option>
              <option value={DraftStatusList.join(',')}>Brouillon</option>
              {_.difference(SampleStatusList, DraftStatusList).map((status) => (
                <option key={`status-${status}`} value={status}>
                  {SampleStatusLabels[status]}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
            <Select
              label="Contexte"
              nativeSelectProps={{
                value: findSampleOptions.programmingPlanId || '',
                onChange: (e) => {
                  changeFilter({
                    programmingPlanId: e.target.value,
                    matrix: undefined,
                  });
                },
              }}
            >
              <option value="">Tous les contextes</option>
              {programmingPlans?.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
              ))}
            </Select>
          </div>
          <div className={cx('fr-col-12', 'fr-col-md-6')}>
            <Select
              label="Matrice"
              nativeSelectProps={{
                value: findSampleOptions.matrix || '',
                onChange: (e) => {
                  changeFilter({ matrix: e.target.value as Matrix });
                },
              }}
            >
              <option value="">Toutes les matrices</option>
              {selectOptionsFromList(
                MatrixList.filter(
                  (matrix) =>
                    !findSampleOptions.programmingPlanId ||
                    !prescriptions ||
                    prescriptions.find((p) => p.matrix === matrix)
                ),
                {
                  labels: MatrixLabels,
                  withDefault: false,
                }
              ).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <Link to="" onClick={initFilter}>
              Réinitialiser
            </Link>
          </div>
        </div>
      </div>

      <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
        <div className={clsx(cx('fr-my-2w'), 'table-header')}>
          <div className={cx('fr-text--bold')}>
            {t('sample', { count: samplesCount })}
          </div>
          <Button
            iconId="fr-icon-file-download-line"
            priority="secondary"
            onClick={() =>
              window.open(
                getSampleListExportURL({
                  ...findSampleOptions,
                  perPage: undefined,
                  page: undefined,
                })
              )
            }
            title="Exporter"
            children={isMobile ? undefined : 'Exporter'}
          />
        </div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <Table
              noCaption
              fixed={!isMobile}
              headers={tableHeaders}
              data={tableData}
              className={cx('fr-mb-2w')}
            />
            {isDefinedAndNotNull(samplesCount) &&
              samplesCount > defaultPerPage && (
                <Pagination
                  count={Math.floor(samplesCount / defaultPerPage) + 1}
                  defaultPage={Number(findSampleOptions.page) || 1}
                  getPageLinkProps={(page: number) => ({
                    to: getURLQuery({
                      ...findSampleOptions,
                      page: page.toString(),
                    }),
                  })}
                />
              )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleListView;
