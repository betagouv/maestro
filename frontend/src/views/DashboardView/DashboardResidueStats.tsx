import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { Regions } from 'maestro-shared/referential/Region';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { type FunctionComponent, useContext } from 'react';
import { ApiClientContext } from '../../services/apiClient';

type Props = {
  programmingPlan: ProgrammingPlanChecked;
};

const DashboardResidueStats: FunctionComponent<Props> = ({
  programmingPlan
}) => {
  const apiClient = useContext(ApiClientContext);

  const { data: stats, isLoading } = apiClient.useGetResidueStatsQuery({
    programmingPlanId: programmingPlan.id
  });

  if (isLoading || !stats?.length) {
    return null;
  }

  return (
    <div className={cx('fr-col-12')}>
      <div className={clsx(cx('fr-px-4w', 'fr-py-3w'), 'white-container')}>
        <h5>Top 10 des résidus détectés</h5>
        <Table
          headers={['#', 'Résidu', 'Matrice', 'Région', 'Détections', '> ARFD']}
          data={stats.map((stat, index) => [
            index + 1,
            SSD2IdLabel[stat.residueReference] ?? stat.residueReference,
            MatrixLabels[stat.matrix],
            Regions[stat.region]?.name ?? stat.region,
            stat.sampleCount,
            stat.higherThanArfdCount
          ])}
          noCaption
        />
      </div>
    </div>
  );
};

export default DashboardResidueStats;
