import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import clsx from 'clsx';
import {
  MatrixKind,
  MatrixKindLabels,
  MatrixKindList
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { FunctionComponent, useState } from 'react';
import { Link } from 'react-router';
import { assert, type Equals } from 'tsafe';
import { CircleProgress } from '../../components/CircleProgress/CircleProgress';
import './DashboardMatrix.scss';

type Props = {
  className: string;
};
export const DashboardMatrix: FunctionComponent<Props> = ({
  className,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const matrixKinds = MatrixKindList.sort((a, b) =>
    MatrixKindLabels[a].localeCompare(MatrixKindLabels[b])
  );

  const itemsPerPage = 12;

  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className={className}>
      <Card
        background
        border
        shadow
        size="medium"
        title="Détails par matrice"
        desc="Objectifs de prélèvements par matrice"
        titleAs="h2"
        end={
          <div
            className={clsx(
              'matrix-list-container',
              cx('fr-grid-row', 'fr-grid-row--gutters')
            )}
          >
            {matrixKinds
              .slice(
                currentPage * itemsPerPage,
                (currentPage + 1) * itemsPerPage
              )
              .map((m) => (
                <MatrixContainer key={m} matrixKind={m} />
              ))}
          </div>
        }
        footer={
          <Pagination
            defaultPage={currentPage + 1}
            count={Math.ceil(matrixKinds.length / itemsPerPage)}
            getPageLinkProps={(page) => ({
              onClick: () => setCurrentPage(page - 1),
              href: '#'
            })}
          />
        }
      />
    </div>
  );
};

const MatrixContainer: FunctionComponent<{ matrixKind: MatrixKind }> = ({
  matrixKind
}) => {
  //FIXME mettre les bonnes valeurs
  const total = 10;
  const done = Math.round(Math.random() * 10);

  //FIXME j'ai mis un lien mais en fait je ne sais pas si c'est cliquable
  return (
    <Link
      key={matrixKind}
      className={clsx('matrix-container', cx('fr-col-12'))}
      to={''}
    >
      <div className={clsx('d-flex-column')}>
        <span className={clsx('matrix-name', cx('fr-text--bold'))}>
          {MatrixKindLabels[matrixKind]}
        </span>
        <span className={clsx(cx('fr-text--xs', 'fr-text--light'))}>
          {total - done} restants à faire
        </span>
      </div>
      <CircleProgress
        count={(done / total) * 100}
        sizePx={80}
        type="percentage"
      />
    </Link>
  );
};
