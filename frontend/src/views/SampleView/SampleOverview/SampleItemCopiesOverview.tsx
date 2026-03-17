import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { StatusBadge } from '../../../components/SampleStatusBadge/SampleStatusBadge';
import { getSupportDocumentURL } from '../../../services/sample.service';
import SampleItemAnalysis from '../SampleItemAnalysis/SampleItemAnalysis';
import './SampleOverview.scss';

interface Props {
  itemNumber: number;
  sampleItemCopies: SampleItem[];
  sample: SampleChecked;
}

const SampleItemCopiesOverview = ({
  itemNumber,
  sampleItemCopies,
  sample
}: Props) => {
  const [currentItemCopy, setCurrentItemCopy] = useState(sampleItemCopies[0]);

  useEffect(() => {
    setCurrentItemCopy(sampleItemCopies[0]);
  }, [sampleItemCopies]);

  return (
    <>
      <div className="d-flex-align-center">
        <h3 className={clsx(cx('fr-m-0'), 'flex-grow-1')}>
          <span className={cx('fr-icon-test-tube-line', 'fr-mr-3v')} />
          Échantillon n°{itemNumber}
        </h3>
        <span className={cx('fr-mr-1w')}>Analyse</span>
        <Tag className={cx('fr-mx-1w')}>
          {SubstanceKindLabels[sampleItemCopies[0].substanceKind]}
        </Tag>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-6')}>
          <div>Compte-rendu / Procès-verbal</div>
          <Link
            to="#"
            className={cx('fr-link', 'fr-link--sm')}
            onClick={() => {
              window.open(
                getSupportDocumentURL(
                  sample.id,
                  itemNumber,
                  currentItemCopy.copyNumber
                )
              );
            }}
          >
            Télécharger le document
            <span
              className={cx('fr-icon-download-line', 'fr-link--icon-right')}
            />
          </Link>
        </div>
      </div>
      <hr />
      {sampleItemCopies.length > 1 && (
        <SegmentedControl
          hideLegend
          legend="Exemplaire"
          segments={
            sampleItemCopies.map((sampleItemCopy) => ({
              label: (
                <div style={{ minHeight: '44px' }}>
                  <div>Exemplaire {sampleItemCopy.copyNumber}</div>
                  {!!sampleItemCopy.analysis?.compliance && (
                    <div
                      className={cx(
                        'fr-label--success',
                        'fr-text--xs',
                        'fr-mb-0'
                      )}
                    >
                      <span
                        className={cx(
                          'fr-icon-checkbox-circle-line',
                          'fr-mr-1w',
                          'fr-icon--sm'
                        )}
                      />
                      Conforme
                    </div>
                  )}
                  {!isNil(sampleItemCopy.analysis?.compliance) &&
                    !sampleItemCopy.analysis?.compliance && (
                      <div
                        className={cx(
                          'fr-label--error',
                          'fr-text--xs',
                          'fr-mb-0'
                        )}
                      >
                        <span
                          className={cx(
                            'fr-icon-close-circle-line',
                            'fr-mr-1w',
                            'fr-icon--sm'
                          )}
                        />
                        Non-conforme
                      </div>
                    )}
                </div>
              ),
              nativeInputProps: {
                checked:
                  sampleItemCopy.copyNumber === currentItemCopy.copyNumber,
                onChange: () => setCurrentItemCopy(sampleItemCopy)
              }
            })) as any
          }
        />
      )}
      {currentItemCopy.analysis ? (
        <StatusBadge
          status={currentItemCopy.analysis?.status}
          compliance={currentItemCopy.analysis?.compliance}
        />
      ) : (
        <Badge noIcon small severity="info">
          Exemplaire non mis en oeuvre
        </Badge>
      )}
      {currentItemCopy && (
        <SampleItemAnalysis sample={sample} sampleItem={currentItemCopy} />
      )}
    </>
  );
};

export default SampleItemCopiesOverview;
