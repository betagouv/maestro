import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import config from '../../../utils/config';
import DocumentLink from '../../DocumentLink/DocumentLink';

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
}

const SampleProcedure = ({ partialSample }: Props) => {
  if (partialSample.specificData.programmingPlanKind === 'PPV') {
    return <></>;
  }

  return (
    <div
      className={clsx(
        cx(
          'fr-callout',
          'fr-callout--beige-gris-galet',
          'fr-px-4w',
          'fr-py-3w',
          'fr-mb-0'
        ),
        'white-container'
      )}
    >
      <h6 className="d-flex-align-center">
        <span
          className={clsx(cx('fr-icon-archive-line', 'fr-mr-1w'), 'icon-grey')}
        ></span>
        Modalités d'échantillonnage
      </h6>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-md-6')}>
          <div className={cx('fr-my-1v')}>
            <b>Contenant en platique</b>
          </div>
          <div className={cx('fr-my-1v')}>
            Température : <b>-18° </b>
          </div>
          <div className={cx('fr-my-1v')}>
            Délais max. avant analyse : <b>30 jours</b>
          </div>
        </div>
        <div className={clsx(cx('fr-col-12', 'fr-col-md-6'), 'border-left')}>
          <div className={cx('fr-my-1v')}>
            Matière prélevée :{' '}
            <b>
              {partialSample.specificData.programmingPlanKind ===
              'DAOA_SLAUGHTER'
                ? 'Foie de bovin'
                : 'Muscle de volaille'}
            </b>
          </div>
          <div className={cx('fr-my-1v')}>
            Quantité par échantillon : <b>200 grammes</b>
          </div>
        </div>
      </div>
      <hr className={cx('fr-my-3w')} />
      <div>
        <span className={cx('fr-mr-1w')}>Analyses prévues</span>
        <Tag className={cx('fr-mx-1w')}>Mono-résidus</Tag>
        <Tag className={cx('fr-mx-1w')}>Multi-résidus</Tag>
        <Tag className={cx('fr-mx-1w')}>Cuivre</Tag>
      </div>
      <div className={cx('fr-mt-3v')}>
        <span className={cx('fr-mr-1w')}>Réglementation</span>
        <DocumentLink
          documentId={config.documents.regulation201862}
          iconId="fr-icon-external-link-line"
        />
      </div>
    </div>
  );
};

export default SampleProcedure;
