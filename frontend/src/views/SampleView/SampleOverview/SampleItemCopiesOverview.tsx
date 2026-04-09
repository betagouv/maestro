import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import {
  getItemStatus,
  getNonCompliantCopies,
  isItemAchieved,
  isItemCompliant,
  type SampleItem
} from 'maestro-shared/schema/Sample/SampleItem';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { Link, useSearchParams } from 'react-router';
import { StatusBadge } from '../../../components/SampleStatusBadge/SampleStatusBadge';
import { getSupportDocumentURL } from '../../../services/sample.service';
import { quote } from '../../../utils/stringUtils';
import SampleItemAnalysis from '../SampleItemAnalysis/SampleItemAnalysis';
import { SampleItemComplianceOverrideModal } from './SampleItemComplianceOverrideModal';
import './SampleOverview.scss';
import { useAuthentication } from '../../../hooks/useAuthentication';

interface Props {
  itemNumber: number;
  sampleItemCopies: SampleItem[];
  sample: SampleChecked;
}

const complianceOverrideModal = createModal({
  id: 'sample-item-compliance-override-modal',
  isOpenedByDefault: false
});

const SampleItemCopiesOverview = ({
  itemNumber,
  sampleItemCopies,
  sample
}: Props) => {
  const { hasUserSamplePermission } = useAuthentication();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCopyNumber = Number(searchParams.get('copy') ?? 1);
  const currentItemCopy =
    sampleItemCopies.find((c) => c.copyNumber === activeCopyNumber) ??
    sampleItemCopies[0];

  const setCurrentItemCopy = (item: SampleItem) =>
    setSearchParams(
      (prev) => {
        prev.set('copy', String(item.copyNumber));
        return prev;
      },
      { replace: true }
    );

  return (
    <>
      <div className="d-flex-align-center d-flex-justify-between">
        <h3 className={clsx(cx('fr-m-0'))}>
          <span className={cx('fr-icon-test-tube-line', 'fr-mr-3v')} />
          Échantillon n°{itemNumber}
        </h3>
        <StatusBadge
          status={getItemStatus(sampleItemCopies)}
          compliance={isItemCompliant(sampleItemCopies)}
        />
        <Tag className={cx('fr-mx-1w')}>
          {SubstanceKindLabels[sampleItemCopies[0].substanceKind]}
        </Tag>
      </div>
      {isItemAchieved(sampleItemCopies) && (
        <div className="d-flex-align-center">
          {isItemCompliant(sampleItemCopies) ? (
            <Badge severity="success" className={'fr-px-1w'}>
              Échantillon conforme
            </Badge>
          ) : (
            <div>
              <Badge severity="error" className={'fr-px-1w'}>
                Échantillon non conforme
              </Badge>
              <div className={cx('fr-text--sm', 'fr-mb-0')}>
                {getNonCompliantCopies(sampleItemCopies)
                  .filter((_) => !isNil(_.analysis?.notesOnCompliance))
                  .map((_) => quote(_.analysis?.notesOnCompliance as string))}
              </div>
            </div>
          )}
          {hasUserSamplePermission(sample).performAnalysis &&
            sampleItemCopies.filter((_) => !isNil(_.analysis)).length > 1 && (
              <Button
                priority="tertiary no outline"
                iconId="fr-icon-edit-line"
                size="small"
                type="button"
                onClick={() => complianceOverrideModal.open()}
              >
                Modifier la conformité
              </Button>
            )}
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
        <>
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
        </>
      )}
      {currentItemCopy && (
        <SampleItemAnalysis sample={sample} sampleItem={currentItemCopy} />
      )}
      {hasUserSamplePermission(sample).performAnalysis && (
        <SampleItemComplianceOverrideModal
          key={itemNumber}
          modal={complianceOverrideModal}
          sampleItem={
            sampleItemCopies.find((_) => _.copyNumber === 1) as SampleItem
          }
        />
      )}
    </>
  );
};

export default SampleItemCopiesOverview;
