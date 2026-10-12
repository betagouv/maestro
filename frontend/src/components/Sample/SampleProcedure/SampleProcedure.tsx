import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { sampleProcedureItems } from 'maestro-shared/schema/ProgrammingPlan/SampleProcedure';
import type {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { usePartialSample } from '../../../hooks/usePartialSample';
import config from '../../../utils/config';
import DocumentLink from '../../DocumentLink/DocumentLink';

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
}

const SampleProcedure = ({ partialSample }: Props) => {
  const { programmingSubPlan } = usePartialSample(partialSample);
  const items = sampleProcedureItems(
    programmingSubPlan?.sampleProcedure,
    partialSample.matrices
  );
  const substanceKinds = programmingSubPlan?.substanceKinds ?? [];
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
      {items.length > 0 && (
        <>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            {items.map(({ label, value }) => (
              <div key={label} className={cx('fr-col-12', 'fr-col-md-6')}>
                {label} : <b>{value}</b>
              </div>
            ))}
          </div>
          <hr className={cx('fr-my-3w')} />
        </>
      )}
      <div>
        <span className={cx('fr-mr-1w')}>Réglementation</span>
        <DocumentLink
          documentId={config.documents.regulation201862}
          scope={{ type: 'resource' }}
        />
      </div>
      {substanceKinds.length > 0 && (
        <div>
          <hr className={cx('fr-my-3w')} />
          <span className={cx('fr-mr-1w')}>Analyses prévues</span>
          {substanceKinds.map((substanceKind) => (
            <Tag key={substanceKind} className={cx('fr-mx-1w')}>
              {SubstanceKindLabels[substanceKind]}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
};

export default SampleProcedure;
