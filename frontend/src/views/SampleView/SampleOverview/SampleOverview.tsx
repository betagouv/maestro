import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import SideMenu from '@codegouvfr/react-dsfr/SideMenu';
import clsx from 'clsx';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useState } from 'react';
import food from 'src/assets/illustrations/food.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import MatrixStepSummary from 'src/views/SampleView/StepSummary/MatrixStepSummary';
import { SampleStatusBadge } from '../../../components/SampleStatusBadge/SampleStatusBadge';
import SupportDocumentDownload from '../DraftSample/SupportDocumentDownload';
import SampleAgreementOverview from './SampleAgreementOverview';
import SampleContextOverview from './SampleContextOverview';
import SampleItemCopiesOverview from './SampleItemCopiesOverview';
import './SampleOverview.scss';
interface Props {
  sample: SampleChecked;
}

const SampleOverview = ({ sample }: Props) => {
  useDocumentTitle(`Prélèvement ${sample.reference}`);

  const { navigateToSamples } = useSamplesLink();
  const [activeMenu, setActiveMenu] = useState<
    'items' | 'matrix' | 'context' | 'agreement'
  >('items');
  const [activeItemNumber, setActiveItemNumber] = useState<number>(1);

  return (
    <section
      className={clsx(cx('fr-container'), 'main-section', 'sample-overview')}
    >
      <SectionHeader
        title={<>Prélèvement {sample.reference}</>}
        action={
          <div className={clsx('d-flex-row', 'title-right-block')}>
            <div className={clsx('align-right')}>
              <div>Statut global du prélèvement</div>
              <SampleStatusBadge status={sample.status} sampleId={sample.id} />
            </div>
            <div className={clsx('border-left')}></div>
            <SupportDocumentDownload
              partialSample={sample}
              alignRight={true}
              buttonPriority={'secondary'}
            />
          </div>
        }
        subtitle="Consultez le récapitulatif du prélèvement réalisé"
        illustration={food}
      />

      <div className="white-container">
        <div className={clsx('d-flex-align-start', cx('fr-m-3w'))}>
          <SideMenu
            align="left"
            burgerMenuButtonText="Dans cette rubrique"
            sticky={true}
            fullHeight={true}
            style={{
              maxWidth: '300px'
            }}
            items={[
              {
                text: 'Suivi du prélèvement',
                isActive: activeMenu === 'items',
                expandedByDefault: true,
                items: sample.items
                  .filter((_) => _.copyNumber === 1)
                  .map((item) => ({
                    isActive:
                      activeItemNumber === item.itemNumber &&
                      activeMenu === 'items',
                    linkProps: {
                      onClick: () => {
                        setActiveMenu('items');
                        setActiveItemNumber(item.itemNumber);
                      },
                      href: '#'
                    },
                    text: `Échantillon ${SubstanceKindLabels[item.substanceKind].toLowerCase()}`
                  }))
              },
              {
                text: 'Matrice contrôlée',
                isActive: activeMenu === 'matrix',
                linkProps: {
                  onClick: () => setActiveMenu('matrix'),
                  href: '#'
                }
              },
              {
                text: 'Contexte du prélèvement',
                isActive: activeMenu === 'context',
                linkProps: {
                  onClick: () => setActiveMenu('context'),
                  href: '#'
                }
              },
              {
                text: 'Consentement',
                isActive: activeMenu === 'agreement',
                linkProps: {
                  onClick: () => setActiveMenu('agreement'),
                  href: '#'
                }
              }
            ]}
          />
          <div
            className={clsx(
              cx('fr-py-2w', 'fr-ml-4w', 'fr-mr-5w'),
              'sample-overview-content'
            )}
          >
            {activeMenu === 'items' && (
              <SampleItemCopiesOverview
                itemNumber={activeItemNumber}
                sampleItemCopies={sample.items.filter(
                  (item) => item.itemNumber === activeItemNumber
                )}
                sample={sample}
              />
            )}
            {activeMenu === 'matrix' && (
              <MatrixStepSummary sample={sample} mode="tab" />
            )}
            {activeMenu === 'context' && (
              <SampleContextOverview sample={sample} />
            )}
            {activeMenu === 'agreement' && (
              <SampleAgreementOverview sample={sample} />
            )}
          </div>
        </div>
      </div>
      <div className="back">
        <Button
          priority="secondary"
          onClick={navigateToSamples}
          iconId="fr-icon-arrow-left-line"
        >
          Retour aux prélèvements
        </Button>
      </div>
    </section>
  );
};

export default SampleOverview;
