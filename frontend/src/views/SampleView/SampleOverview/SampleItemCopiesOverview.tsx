import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useState } from 'react';
import { Link } from 'react-router';
import { getSupportDocumentURL } from '../../../services/sample.service';
import { quote } from '../../../utils/stringUtils';
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
  const [copyNumber, setCopyNumber] = useState(sampleItemCopies[0].copyNumber);

  return (
    <>
      <div className="d-flex-align-center">
        <h3 className={clsx(cx('fr-m-0'), 'flex-grow-1')}>
          <span className={cx('fr-icon-test-tube-line')}>
            Échantillon n°{itemNumber}
          </span>
        </h3>
        <span className={cx('fr-mr-1w')}>Analyse</span>
        <Tag className={cx('fr-mx-1w')}>
          {SubstanceKindLabels[sampleItemCopies[0].substanceKind]}
        </Tag>
      </div>
      {!isNil(sampleItemCopies[0]?.analysis?.compliance) && (
        <div>
          <Badge
            severity={
              sampleItemCopies[0].analysis?.compliance ? 'success' : 'error'
            }
            className={'fr-px-1w'}
          >
            {sampleItemCopies[0].analysis?.compliance
              ? 'Échantillon conforme'
              : 'Échantillon non conforme'}
          </Badge>
          <div className={cx('fr-text--sm', 'fr-mb-0')}>
            {sampleItemCopies[0]?.analysis?.notesOnCompliance &&
              quote(sampleItemCopies[0]?.analysis.notesOnCompliance)}
          </div>
        </div>
      )}
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-6')}>
          <div>Compte-rendu / Procès-verbal</div>
          <Link
            to="#"
            className={cx('fr-link', 'fr-link--sm')}
            onClick={() => {
              window.open(
                getSupportDocumentURL(sample.id, itemNumber, copyNumber)
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
              label: `Exemplaire ${sampleItemCopy.copyNumber}`,
              nativeInputProps: {
                checked: copyNumber === sampleItemCopy.copyNumber,
                onChange: () => setCopyNumber(sampleItemCopy.copyNumber)
              }
            })) as any
          }
        />
      )}
      <SampleItemAnalysis
        sample={sample}
        sampleItem={
          sampleItemCopies.find(
            (copy) => copy.copyNumber === copyNumber
          ) as SampleItem
        }
      />
    </>
  );
};

export default SampleItemCopiesOverview;
