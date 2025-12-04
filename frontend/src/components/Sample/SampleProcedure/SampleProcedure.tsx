import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
}

const SampleProcedure = ({ partialSample }: Props) => {
  if (!partialSample.specificData.programmingPlanKind === 'DAOA_SLAUGHTER') {
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
            Contenant : <b>Papier d'aluminium</b>
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
            Matière prélevée : <b>Foie de bovin</b>
          </div>
          <div className={cx('fr-my-1v')}>
            Quantité par échantillon : <b>200 grammes</b>
          </div>
        </div>
      </div>
      <hr className={cx('fr-my-3w')} />
      Analyses prévues Mono-résidus Multi-résidus Cuivre
    </div>
  );
};

export default SampleProcedure;
