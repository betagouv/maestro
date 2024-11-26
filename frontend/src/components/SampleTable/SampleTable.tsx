import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { ContextLabels } from 'shared/schema/ProgrammingPlan/Context';
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
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { useAppSelector } from 'src/hooks/useStore';
import useWindowSize from 'src/hooks/useWindowSize';
import './SampleTable.scss';

interface Props {
  samples: (PartialSample | PartialSampleToCreate)[];
  tableFooter?: React.ReactNode;
}

const SampleTable = ({ samples, tableFooter }: Props) => {
  const { sampleLink, navigateToSample } = useSamplesLink();
  const { isOnline } = useOnLine();

  const { hasPermission, userInfos } = useAuthentication();
  const { isMobile } = useWindowSize();

  const { pendingSamples } = useAppSelector((state) => state.samples);

  const tableHeaders = [
    '#',
    'Matrice',
    'Préleveur',
    'Date',
    'Dépt.',
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
          ContextLabels[sample.context],
          <SampleStatusBadge status={sample?.status as SampleStatus} />,
        ].map((cell) => (
          <div
            onClick={() => navigateToSample(sample.id)}
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
              to: sampleLink(sample.id),
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
    [samples] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <>
      <Table
        noCaption
        fixed={!isMobile}
        headers={tableHeaders}
        data={tableData}
        className={cx('fr-mb-2w')}
      />
      {tableFooter}
    </>
  );
};

export default SampleTable;
