import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import { format } from 'date-fns';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  getSampleMatrixLabel,
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { DraftStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import { useMemo } from 'react';
import { SampleStatusBadge } from 'src/components/SampleStatusBadge/SampleStatusBadge';
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

  const { hasUserPermission, user } = useAuthentication();
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
    'Actions'
  ];

  const tableData = useMemo(
    () =>
      (samples ?? []).map((sample) => [
        ...[
          isCreatedPartialSample(sample) ? sample.reference : '',
          getSampleMatrixLabel(sample),
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
                {user?.firstName} {user?.lastName}
              </>
            )}
          </div>,
          sample.sampledAt ? format(sample.sampledAt, 'dd/MM/yyyy') : '',
          sample.department,
          sample.company?.name ?? '',
          sample.context ? ContextLabels[sample.context] : '',
          <SampleStatusBadge status={sample.status} sampleId={sample.id} />
        ].map((cell) => (
          <div
            onClick={() => navigateToSample(sample.id)}
            style={{
              cursor: 'pointer'
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
              to: sampleLink(sample.id)
            }}
            size="small"
            priority="tertiary"
          />
          {isOnline &&
            hasUserPermission('deleteSample') &&
            DraftStatusList.includes(sample.status) && (
              <RemoveSample sample={sample} />
            )}
        </div>
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
