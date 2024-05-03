import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import { format } from 'date-fns';
import { t } from 'i18next';
import { Link } from 'react-router-dom';
import { SampleStatus } from 'shared/schema/Sample/SampleStatus';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useFindSamplesQuery } from 'src/services/sample.service';

const SampleListView = () => {
  useDocumentTitle('Liste des prélèvements');

  const { data: samples } = useFindSamplesQuery({});

  const { hasPermission } = useAuthentication();

  return (
    <section className={cx('fr-py-6w')}>
      <h1>Liste des prélèvements</h1>
      <div className={cx('fr-mb-4w')}>
        {t('sample', { count: samples?.length || 0 })}
      </div>
      {samples && samples.length > 0 && (
        <Table
          noCaption
          headers={[
            'Identifiant',
            'Date de création',
            'Département',
            "Site d'intervention",
            'Statut',
          ]}
          data={samples.map((sample) => [
            <Link to={`/prelevements/${sample.id}`}>{sample.reference}</Link>,
            format(sample.createdAt, 'dd/MM/yyyy'),
            sample.department,
            sample.locationName,
            <SampleStatusBadge status={sample?.status as SampleStatus} />,
          ])}
        />
      )}
      {hasPermission('createSample') && (
        <Button
          linkProps={{
            to: '/prelevements/nouveau',
            target: '_self',
          }}
          className={cx('fr-mt-4w')}
        >
          Créer un prélèvement
        </Button>
      )}
    </section>
  );
};

export default SampleListView;
