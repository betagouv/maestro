import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import SideMenu from '@codegouvfr/react-dsfr/SideMenu';
import clsx from 'clsx';
import { getLaboratoryFullName } from 'maestro-shared/schema/Laboratory/Laboratory';
import {
  hasSamplePermission,
  type SampleChecked
} from 'maestro-shared/schema/Sample/Sample';
import {
  getItemStatus,
  isItemAchieved,
  isItemCompliant
} from 'maestro-shared/schema/Sample/SampleItem';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { isDefined } from 'maestro-shared/utils/utils';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useSearchParams } from 'react-router';
import food from 'src/assets/illustrations/food.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import MatrixStepSummary from 'src/views/SampleView/StepSummary/MatrixStepSummary';
import { SampleStatusBadge } from '../../../components/SampleStatusBadge/SampleStatusBadge';
import { usePartialSample } from '../../../hooks/usePartialSample';
import { ApiClientContext } from '../../../services/apiClient';
import SupportDocumentDownload from '../DraftSample/SupportDocumentDownload';
import SampleAgreementOverview from './SampleAgreementOverview';
import SampleComplianceForm from './SampleComplianceForm';
import SampleContextOverview from './SampleContextOverview';
import SampleItemCopiesOverview from './SampleItemCopiesOverview';
import './SampleOverview.scss';
import { useAuthentication } from '../../../hooks/useAuthentication';

interface Props {
  sample: SampleChecked;
}

const SampleOverview = ({ sample }: Props) => {
  useDocumentTitle(`Prélèvement ${sample.reference}`);
  const apiClient = useContext(ApiClientContext);
  const complianceRef = useRef<null | HTMLDivElement>(null);
  const { user, userRole } = useAuthentication();

  const { getSampleItemLaboratory } = usePartialSample(sample);

  const { navigateToSamples } = useSamplesLink();
  const [searchParams, setSearchParams] = useSearchParams();

  const [_updateSample, { isSuccess: isSendingSuccess }] =
    apiClient.useUpdateSampleMutation({
      fixedCacheKey: `sending-sample-${sample.id}`
    });

  const readonly = useMemo(
    () =>
      !user ||
      !userRole ||
      !hasSamplePermission(user, userRole, sample)['performAnalysis'],
    [sample, user, userRole, hasSamplePermission]
  );

  const activeMenu = (searchParams.get('menu') ?? 'items') as
    | 'items'
    | 'matrix'
    | 'context'
    | 'agreement';
  const activeItemNumber = Number(searchParams.get('item') ?? 1);

  const setActiveMenu = (menu: typeof activeMenu) =>
    setSearchParams(
      (prev) => {
        prev.set('menu', menu);
        prev.delete('item');
        return prev;
      },
      { replace: true }
    );

  const setActiveItemNumber = (itemNumber: number) =>
    setSearchParams(
      (prev) => {
        prev.set('menu', 'items');
        prev.set('item', String(itemNumber));
        prev.delete('copy');
        return prev;
      },
      { replace: true }
    );
  const [activeCompliance, setActiveCompliance] = useState(false);

  useEffect(() => {
    setActiveCompliance(
      sample.programmingPlanKind !== 'PPV' && sample.status === 'InReview'
    );
  }, [sample.programmingPlanKind, sample.status]);

  const sampleItemCopies = useCallback(
    (itemNumber: number) =>
      sample.items.filter((item) => item.itemNumber === itemNumber),
    [sample.items]
  );

  const [updateSampleCompliance] =
    apiClient.useUpdateSampleComplianceMutation();

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
              <SampleStatusBadge sample={sample} />
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
      {isSendingSuccess && sample.status !== 'InReview' && (
        <Alert
          severity="info"
          small
          description={
            <>
              Votre demande d'analyse a bien été transmise par email à{' '}
              <ul>
                {sample.items
                  .filter((item) => item.copyNumber === 1)
                  .map((item) => (
                    <li key={item.itemNumber}>
                      {getLaboratoryFullName(
                        getSampleItemLaboratory(item.itemNumber)
                      )}
                    </li>
                  ))}
              </ul>
            </>
          }
          closable
          classes={{
            root: 'bg-white'
          }}
        />
      )}

      {activeCompliance && !readonly && (
        <div ref={complianceRef}>
          <SampleComplianceForm
            sample={sample}
            onChangeCompliance={async (complianceData) => {
              await updateSampleCompliance({
                sampleId: sample.id,
                ...complianceData
              });
              setActiveCompliance(false);
            }}
          />
        </div>
      )}
      <div className="white-container">
        <div className={clsx('d-flex-align-start', cx('fr-m-3w'))}>
          <SideMenu
            align="left"
            burgerMenuButtonText="Dans cette rubrique"
            sticky={true}
            fullHeight={true}
            style={{
              maxWidth: '330px'
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
                    text: (
                      <div className="d-block">
                        <span>
                          Échantillon{' '}
                          {SubstanceKindLabels[
                            item.substanceKind
                          ].toLowerCase()}
                        </span>
                        {getItemStatus(sampleItemCopies(item.itemNumber)) ===
                          'NotAdmissible' && (
                          <div className={cx('fr-label--error', 'fr-text--xs')}>
                            Non recevable
                          </div>
                        )}
                        {isItemAchieved(sampleItemCopies(item.itemNumber)) &&
                          (isItemCompliant(
                            sampleItemCopies(item.itemNumber)
                          ) ? (
                            <div
                              className={cx('fr-label--success', 'fr-text--xs')}
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
                          ) : (
                            <div
                              className={cx('fr-label--error', 'fr-text--xs')}
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
                          ))}
                      </div>
                    )
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
              },
              sample.programmingPlanKind !== 'PPV' && !readonly
                ? {
                    text: (
                      <div
                        className={clsx(
                          cx(
                            sample.status === 'Completed'
                              ? ['fr-btn--secondary', 'fr-py-1w', 'fr-px-2w']
                              : 'fr-btn'
                          ),
                          { 'btn-disabled': sample.status !== 'Completed' }
                        )}
                      >
                        Conformité du prélèvement
                      </div>
                    ),
                    isActive: false,
                    linkProps: {
                      onClick: () => {
                        setActiveCompliance(true);
                        setTimeout(() => {
                          complianceRef.current?.scrollIntoView({
                            behavior: 'smooth'
                          });
                        });
                      },
                      href: '#',
                      disabled: sample.status !== 'Completed'
                    }
                  }
                : undefined
            ].filter(isDefined)}
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
                sampleItemCopies={sampleItemCopies(activeItemNumber)}
                sample={sample}
                readonly={readonly}
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
