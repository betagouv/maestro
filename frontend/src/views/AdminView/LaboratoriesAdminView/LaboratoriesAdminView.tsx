import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { useContext } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AuthenticatedAppRoutes } from 'src/AppRoutes';
import { ApiClientContext } from 'src/services/apiClient';
import { LaboratoryConfigForm } from './LaboratoryConfigForm';

export const LaboratoriesAdminView = () => {
  const apiClient = useContext(ApiClientContext);
  const navigate = useNavigate();
  const { section, itemId } = useParams();

  const { data: laboratories = [] } = apiClient.useFindLaboratoriesQuery({});

  const { data: laboratoryConfig } = apiClient.useGetLaboratoryConfigQuery(
    { laboratoryId: itemId ?? '' },
    { skip: !itemId }
  );

  if (itemId) {
    return (
      <div className={cx('fr-p-2w')}>
        <h3 className={clsx('d-flex-align-center', cx('fr-mt-2w'))}>
          <Button
            priority="tertiary no outline"
            iconId="fr-icon-arrow-left-line"
            onClick={() =>
              navigate(
                AuthenticatedAppRoutes.AdminRoute.link(section as string)
              )
            }
            title="Retour à la liste"
          />
          Édition d'un laboratoire
        </h3>
        {laboratoryConfig && (
          <LaboratoryConfigForm
            key={laboratoryConfig.id}
            laboratory={laboratoryConfig}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cx('fr-p-2w')}>
      <h3>Laboratoires</h3>
      <Table
        noCaption
        headers={['Sigle', 'Nom', 'Ville', 'Actions']}
        data={laboratories.map((laboratory) => [
          laboratory.shortName,
          laboratory.name,
          laboratory.city,
          <Button
            key={`${laboratory.id}-edit`}
            priority="tertiary"
            iconId="fr-icon-edit-line"
            onClick={() =>
              navigate(
                AuthenticatedAppRoutes.AdminRoute.link(
                  section as string,
                  laboratory.id
                )
              )
            }
          >
            Éditer
          </Button>
        ])}
      />
    </div>
  );
};
