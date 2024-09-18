import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate,
} from 'shared/schema/Sample/Sample';
import {
  DraftStatusList,
  SampleStatus,
} from 'shared/schema/Sample/SampleStatus';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import RemoveSample from 'src/components/SampleTable/RemoveSample';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useOnLine } from 'src/hooks/useOnLine';
import { useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import './SampleTable.scss';

interface Props {
  samples: (PartialSample | PartialSampleToCreate)[];
  tableHeader?: React.ReactNode;
  tableFooter?: React.ReactNode;
}

const SampleTable = ({ samples, tableHeader, tableFooter }: Props) => {
  const navigate = useNavigate();
  const { isOnline } = useOnLine();

  const { hasPermission, userInfos } = useAuthentication();
  const { isMobile } = useWindowSize();

  const { programmingPlanStatus } = useAppSelector((state) => state.settings);

  const { data: programmingPlans } = useFindProgrammingPlansQuery(
    { status: programmingPlanStatus },
    { skip: !programmingPlanStatus }
  );

  const { pendingSamples } = useAppSelector((state) => state.samples);

  const tableHeaders = [
    'Numéro',
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
          isCreatedPartialSample(sample) ? sample.reference : '',
          (sample.matrix && MatrixLabels[sample.matrix]) ?? '',
          <div className="d-flex-align-center">
            {pendingSamples[sample.id] && (
              <span className="fr-icon-link-unlink fr-icon--sm fr-mr-1w"></span>
            )}
            {isCreatedPartialSample(sample) ? (
              <>
                {sample.sampler.firstName} {sample.sampler.lastName}
              </>
            ) : (
              <>
                {userInfos?.firstName} {userInfos?.lastName}
              </>
            )}
          </div>,

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
          {isOnline &&
            hasPermission('deleteSample') &&
            DraftStatusList.includes(sample.status) && (
              <RemoveSample sample={sample} />
            )}
        </div>,
      ]),
    [samples, programmingPlans] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
      <div className={clsx(cx('fr-my-2w'), 'table-header')}>{tableHeader}</div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <Table
            noCaption
            fixed={!isMobile}
            headers={tableHeaders}
            data={tableData}
            className={cx('fr-mb-2w')}
          />
          {tableFooter}
        </div>
      </div>
    </div>
  );
};

export default SampleTable;
