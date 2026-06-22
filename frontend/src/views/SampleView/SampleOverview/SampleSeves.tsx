import Notice from '@codegouvfr/react-dsfr/Notice';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import type { SevesId } from 'maestro-shared/schema/Sample/Seves';
import config from 'src/utils/config';
import { assert, type Equals } from 'tsafe';

type Props = {
  sample: Pick<SampleChecked, 'seves' | 'sevesNotice' | 'reference'>;
};

const getSevesUrl = (sevesId: SevesId) =>
  `${config.sevesUrl}/evenement-produit/${sevesId}`;

const getSevesCreationUrl = (maestroReference: string) =>
  `${config.sevesUrl}/evenement-produit/creation?maestro_reference=${encodeURIComponent(
    maestroReference
  )}`;

export const SampleSeves = ({ sample, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();
  if (sample.seves) {
    return (
      <Notice
        severity="info"
        title={`Fiche Sèves créée (n° ${sample.seves.numero}).`}
        link={{
          text: 'Voir la fiche',
          linkProps: {
            href: getSevesUrl(sample.seves.id),
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        }}
      />
    );
  }

  if (sample.sevesNotice === 'lmrExceeded') {
    return (
      <Notice
        severity="alert"
        title="Dépassement de LMR détecté."
        description="Au moins un résidu détecté dépasse sa LMR sur ce prélèvement, créez une fiche Sèves pour avertir les services concernés."
        link={{
          text: 'Créer une fiche Sèves.',
          linkProps: {
            href: getSevesCreationUrl(sample.reference),
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        }}
      />
    );
  }

  if (sample.sevesNotice === 'recommended') {
    return (
      <Notice
        severity="info"
        title="Création d'une fiche Sèves conseillée."
        description="Au moins un résidu a été détecté sur ce prélèvement, vous pouvez créer une fiche Sèves pour avertir les services concernés."
        link={{
          text: 'Créer une fiche Sèves.',
          linkProps: {
            href: getSevesCreationUrl(sample.reference),
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        }}
      />
    );
  }

  return null;
};
