import Button from '@codegouvfr/react-dsfr/Button';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import type { SevesId } from 'maestro-shared/schema/Sample/Seves';
import config from 'src/utils/config';

type Props = {
  sample: SampleChecked;
};

const getSevesUrl = (sevesId: SevesId) =>
  `${config.sevesUrl}/evenement-produit/${sevesId}`;

const getSevesCreationUrl = (maestroReference: string) =>
  `${config.sevesUrl}/evenement-produit/creation?maestro_reference=${encodeURIComponent(
    maestroReference
  )}`;

const SampleSeves = ({ sample }: Props) => {
  if (sample.seves) {
    return (
      <Button
        priority="secondary"
        iconId="fr-icon-external-link-line"
        linkProps={{
          href: getSevesUrl(sample.seves.id),
          target: '_blank',
          rel: 'noopener noreferrer'
        }}
      >
        Accéder à la fiche Sèves {sample.seves.numero}
      </Button>
    );
  }

  return (
    <Button
      priority="secondary"
      iconId="fr-icon-add-line"
      linkProps={{
        href: getSevesCreationUrl(sample.reference),
        target: '_blank',
        rel: 'noopener noreferrer'
      }}
    >
      Créer une fiche Sèves
    </Button>
  );
};

export default SampleSeves;
