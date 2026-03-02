import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { getLaboratoryFullName } from 'maestro-shared/schema/Laboratory/Laboratory';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { MaestroDate } from 'maestro-shared/utils/date';
import {
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useLocation } from 'react-router';
import { usePartialSample } from 'src/hooks/usePartialSample';
import UserFeedback from '../../../components/UserFeedback/UserFeedback';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useSamplesLink } from '../../../hooks/useSamplesLink';
import { ApiClientContext } from '../../../services/apiClient';
import { SampleItemAdmissibility } from './SampleItemAdmissibility/SampleItemAdmissibility';
import { SampleItemAdmissibilityForm } from './SampleItemAdmissibility/SampleItemAdmissibilityForm';
import './SampleItemAnalysis.scss';
import { AnalysisDocumentPreview } from './SampleItemAnalysisForm/AnalysisDocumentPreview';
import { SampleAnalysisForm } from './SampleItemAnalysisForm/SampleAnalysisForm';
import { SampleAnalysisOverview } from './SampleItemAnalysisOverview/SampleAnalysisOverview';

type Props = {
  sample: SampleChecked;
  sampleItem: SampleItem;
};

const SampleItemAnalysis: FunctionComponent<Props> = ({
  sample,
  sampleItem
}) => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission, user } = useAuthentication();
  const location = useLocation();

  const { getSampleItemLaboratory } = usePartialSample(sample);
  const { navigateToSample, navigateToSampleEdit } = useSamplesLink();
  const [_updateSample, { isSuccess: isSendingSuccess }] =
    apiClient.useUpdateSampleMutation({
      fixedCacheKey: `sending-sample-${sample.id}`
    });
  const [, { isSuccess: isCompletingAnalysisSuccess }] =
    apiClient.useUpdateAnalysisMutation({
      fixedCacheKey: `complete-analysis-${sample.id}`
    });
  const { data: analysis } = apiClient.useGetSampleItemAnalysisQuery({
    sampleId: sample.id,
    itemNumber: sampleItem.itemNumber,
    copyNumber: sampleItem.copyNumber
  });

  const [updateSampleItem] = apiClient.useUpdateSampleItemMutation();

  const [shippingDate, setShippingDate] = useState(
    sampleItem.shippingDate ?? ''
  );
  const [destructionDate, setDestructionDate] = useState(
    sampleItem.destructionDate ?? ''
  );
  const [carrier, setCarrier] = useState(sampleItem.carrier ?? '');
  const [invoicingDate, setInvoicingDate] = useState(
    sampleItem.invoicingDate ?? ''
  );
  const [payment, setPayment] = useState(
    sampleItem.payment === true
      ? 'true'
      : sampleItem.payment === false
        ? 'false'
        : ''
  );
  const [paymentDate, setPaymentDate] = useState(sampleItem.paymentDate ?? '');
  const [invoiceNumber, setInvoiceNumber] = useState(
    sampleItem.invoiceNumber ?? ''
  );
  const [budgetNotes, setBudgetNotes] = useState(sampleItem.budgetNotes ?? '');

  useEffect(() => {
    setShippingDate(sampleItem.shippingDate ?? '');
    setDestructionDate(sampleItem.destructionDate ?? '');
    setCarrier(sampleItem.carrier ?? '');
    setInvoicingDate(sampleItem.invoicingDate ?? '');
    setPayment(
      sampleItem.payment === true
        ? 'true'
        : sampleItem.payment === false
          ? 'false'
          : ''
    );
    setPaymentDate(sampleItem.paymentDate ?? '');
    setInvoiceNumber(sampleItem.invoiceNumber ?? '');
    setBudgetNotes(sampleItem.budgetNotes ?? '');
  }, [sampleItem]);

  const saveItem = (changes: Partial<SampleItem>) =>
    updateSampleItem({
      sampleId: sampleItem.sampleId,
      itemNumber: sampleItem.itemNumber,
      copyNumber: sampleItem.copyNumber,
      item: { ...sampleItem, ...changes }
    });

  const readonly = useMemo(
    () =>
      !hasUserPermission('createAnalysis') || sample.region !== user?.region,
    [hasUserPermission, sample, user?.region]
  );

  const isEditing: boolean =
    !readonly &&
    (location.pathname.endsWith('/edit') || analysis?.status !== 'Completed');

  return (
    <div className={'analysis-container'}>
      {isSendingSuccess && sample.status !== 'InReview' && (
        <Alert
          severity="info"
          small
          description={
            <>
              Votre demande d'analyse a bien été transmise par email{' '}
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
          className={cx('fr-mb-4w')}
        />
      )}
      {sample.status === 'Completed' && isCompletingAnalysisSuccess && (
        <Alert
          severity="info"
          small
          description="Les résultats d'analyse ont bien été enregistrés."
          className={cx('fr-mb-4w')}
        />
      )}

      <div>
        {['Analysis', 'InReview', 'Completed', 'NotAdmissible'].includes(
          sample.status
        ) && (
          <SampleItemAdmissibility
            sample={sample}
            readonly={readonly}
            sampleItem={sampleItem}
          />
        )}
        {isEditing && sample.status === 'Sent' && (
          <SampleItemAdmissibilityForm
            sample={sample}
            withSubmitButton={true}
          />
        )}
        {sample.status !== 'NotAdmissible' && (
          <AnalysisDocumentPreview
            partialAnalysis={analysis}
            sampleId={sample.id}
            readonly={!isEditing}
          />
        )}
      </div>

      <div className="border">
        <Accordion label="Détails de l'échantillon" defaultExpanded>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-4')}>
              <div className={cx('fr-mb-1v')}>Quantité prélevée</div>
              <div className={cx('fr-text--bold')}>
                {sampleItem.quantity} {sampleItem.quantityUnit}
              </div>
            </div>
            <div className={cx('fr-col-4')}>
              <div className={cx('fr-mb-1v')}>Numéro de scellé</div>
              <div className={cx('fr-text--bold')}>{sampleItem.sealId}</div>
            </div>
            <div className={cx('fr-col-4')}>
              <div className={cx('fr-mb-1v')}>Directive 2002/63</div>
              <div className={cx('fr-text--bold')}>
                {!sampleItem.compliance200263 && 'non '}respectée
              </div>
            </div>
          </div>
          <div
            className={cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mt-2w')}
          >
            <div className={cx('fr-col-4')}>
              <Input
                label="Date d'expédition"
                nativeInputProps={{
                  type: 'date',
                  value: shippingDate,
                  disabled: readonly,
                  onChange: (e) => setShippingDate(e.target.value),
                  onBlur: (e) =>
                    void saveItem({
                      shippingDate: (e.target.value ||
                        null) as MaestroDate | null
                    })
                }}
              />
            </div>
            <div className={cx('fr-col-4')}>
              <Input
                label="Date de destruction"
                nativeInputProps={{
                  type: 'date',
                  value: destructionDate,
                  disabled: readonly,
                  onChange: (e) => setDestructionDate(e.target.value),
                  onBlur: (e) =>
                    void saveItem({
                      destructionDate: (e.target.value ||
                        null) as MaestroDate | null
                    })
                }}
              />
            </div>
            <div className={cx('fr-col-4')}>
              <Input
                label="Transporteur"
                nativeInputProps={{
                  type: 'text',
                  value: carrier,
                  disabled: readonly,
                  onChange: (e) => setCarrier(e.target.value),
                  onBlur: (e) =>
                    void saveItem({ carrier: e.target.value || null })
                }}
              />
            </div>
          </div>
        </Accordion>
        <Accordion label="Facturation">
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-4')}>
              <Input
                label="Date de facturation"
                nativeInputProps={{
                  type: 'date',
                  value: invoicingDate,
                  disabled: readonly,
                  onChange: (e) => setInvoicingDate(e.target.value),
                  onBlur: (e) =>
                    void saveItem({
                      invoicingDate: (e.target.value ||
                        null) as MaestroDate | null
                    })
                }}
              />
            </div>
            <div className={cx('fr-col-4')}>
              <Select
                label="Paiement"
                disabled={readonly}
                nativeSelectProps={{
                  value: payment,
                  onChange: (e) => {
                    setPayment(e.target.value);
                    void saveItem({
                      payment:
                        e.target.value === 'true'
                          ? true
                          : e.target.value === 'false'
                            ? false
                            : null
                    });
                  }
                }}
              >
                <option value="">-</option>
                <option value="true">Payé</option>
                <option value="false">Non payé</option>
              </Select>
            </div>
            <div className={cx('fr-col-4')}>
              <Input
                label="Date de paiement"
                nativeInputProps={{
                  type: 'date',
                  value: paymentDate,
                  disabled: readonly,
                  onChange: (e) => setPaymentDate(e.target.value),
                  onBlur: (e) =>
                    void saveItem({
                      paymentDate: (e.target.value ||
                        null) as MaestroDate | null
                    })
                }}
              />
            </div>
          </div>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-4')}>
              <Input
                label="Numéro de facture"
                nativeInputProps={{
                  type: 'text',
                  value: invoiceNumber,
                  disabled: readonly,
                  onChange: (e) => setInvoiceNumber(e.target.value),
                  onBlur: (e) =>
                    void saveItem({ invoiceNumber: e.target.value || null })
                }}
              />
            </div>
            <div className={cx('fr-col-8')}>
              <Input
                label="Notes budgétaires"
                nativeInputProps={{
                  type: 'text',
                  value: budgetNotes,
                  disabled: readonly,
                  onChange: (e) => setBudgetNotes(e.target.value),
                  onBlur: (e) =>
                    void saveItem({ budgetNotes: e.target.value || null })
                }}
              />
            </div>
          </div>
        </Accordion>
      </div>

      {['Analysis', 'InReview', 'Completed'].includes(sample.status) &&
        analysis && (
          <>
            {!isEditing ? (
              <SampleAnalysisOverview
                sample={sample}
                analysis={analysis}
                readonly={readonly}
                onEdit={() => navigateToSampleEdit(sample.id)}
              />
            ) : (
              <SampleAnalysisForm
                partialAnalysis={analysis}
                sample={sample}
                onDone={() => navigateToSample(sample.id)}
              />
            )}
          </>
        )}
      {sample.status === 'InReview' && <UserFeedback />}
    </div>
  );
};

export default SampleItemAnalysis;
