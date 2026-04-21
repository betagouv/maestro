import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { pick } from 'lodash-es';
import { QuantityUnitLabels } from 'maestro-shared/referential/QuantityUnit';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import type { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import {
  type MaestroDate,
  maestroDateRefined
} from 'maestro-shared/utils/date';
import { type FunctionComponent, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { z } from 'zod';
import AppSelect from '../../../components/_app/AppSelect/AppSelect';
import { defaultAppSelectOption } from '../../../components/_app/AppSelect/AppSelectOption';
import AppTextInput from '../../../components/_app/AppTextInput/AppTextInput';
import UserFeedback from '../../../components/UserFeedback/UserFeedback';
import { useForm } from '../../../hooks/useForm';
import { useSamplesLink } from '../../../hooks/useSamplesLink';
import { ApiClientContext } from '../../../services/apiClient';
import { SampleItemAdmissibility } from './SampleItemAdmissibility/SampleItemAdmissibility';
import './SampleItemAnalysis.scss';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { quote } from '../../../utils/stringUtils';
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
  const location = useLocation();

  const { hasUserSamplePermission, hasUserPermission } = useAuthentication();

  const { navigateToSample, navigateToSampleEdit } = useSamplesLink();
  const [, { isSuccess: isCompletingAnalysisSuccess }] =
    apiClient.useUpdateAnalysisMutation({
      fixedCacheKey: `complete-analysis-${sample.id}`
    });
  const { currentData: analysis } = apiClient.useGetSampleItemAnalysisQuery({
    sampleId: sample.id,
    itemNumber: sampleItem.itemNumber,
    copyNumber: sampleItem.copyNumber
  });

  const [updateSampleItem] = apiClient.useUpdateSampleItemMutation();

  const BillingForm = z.object({
    invoicingDate: maestroDateRefined.nullable(),
    paid: z.boolean().nullable(),
    paidDate: maestroDateRefined.nullable(),
    invoiceNumber: z.string().nullable(),
    budgetNotes: z.string().nullable()
  });

  const ShippingForm = z.object({
    shippingDate: maestroDateRefined.nullable(),
    destructionDate: maestroDateRefined.nullable(),
    carrier: z.string().nullable()
  });

  type BillingFormSchema = z.infer<typeof BillingForm>;
  type ShippingFormSchema = z.infer<typeof ShippingForm>;

  const [billingSampleItem, setBillingSampleItem] = useState(
    sampleItem as BillingFormSchema
  );
  const [shippingSampleItem, setShippingSampleItem] = useState(
    sampleItem as ShippingFormSchema
  );

  useEffect(() => {
    setBillingSampleItem(
      pick(
        sampleItem,
        'invoicingDate',
        'paid',
        'paidDate',
        'invoiceNumber',
        'budgetNotes'
      ) as BillingFormSchema
    );
    setShippingSampleItem(
      pick(
        sampleItem,
        'shippingDate',
        'destructionDate',
        'carrier'
      ) as ShippingFormSchema
    );
  }, [sampleItem]);

  const billingForm = useForm(
    BillingForm,
    pick(
      billingSampleItem,
      'invoicingDate',
      'paid',
      'paidDate',
      'invoiceNumber',
      'budgetNotes'
    ),
    async () => {
      await updateSampleItem({
        updateKey: 'billing',
        ...billingSampleItem,
        sampleId: sampleItem.sampleId,
        itemNumber: sampleItem.itemNumber,
        copyNumber: sampleItem.copyNumber
      });
    }
  );

  const shippingForm = useForm(
    ShippingForm,
    pick(shippingSampleItem, 'shippingDate', 'destructionDate', 'carrier'),

    async () => {
      await updateSampleItem({
        updateKey: 'shipping',
        ...shippingSampleItem,
        sampleId: sampleItem.sampleId,
        itemNumber: sampleItem.itemNumber,
        copyNumber: sampleItem.copyNumber
      });
    }
  );

  const isEditing: boolean =
    hasUserSamplePermission(sample).performAnalysis &&
    (location.pathname.endsWith('/edit') ||
      sampleItem.analysis?.status !== 'Completed');

  return (
    <div className={'analysis-container'}>
      {sample.status === 'Completed' && isCompletingAnalysisSuccess && (
        <Alert
          severity="info"
          small
          description="Les résultats d'analyse ont bien été enregistrés."
          className={cx('fr-mb-4w')}
        />
      )}
      <div>
        <SampleItemAdmissibility
          sample={sample}
          readonly={!hasUserSamplePermission(sample).performAnalysis}
          sampleItem={sampleItem}
        />
        {analysis?.status !== 'NotAdmissible' && (
          <AnalysisDocumentPreview
            partialAnalysis={analysis}
            sampleId={sample.id}
            itemNumber={sampleItem.itemNumber}
            copyNumber={sampleItem.copyNumber}
            readonly={!isEditing}
          />
        )}
      </div>
      <div className={clsx('border-right', 'border-left', 'border-bottom')}>
        <Accordion label="Détails de l'échantillon">
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-4')}>
              <div className={cx('fr-mb-1v')}>Quantité prélevée</div>
              <div className={cx('fr-text--bold')}>
                {sampleItem.quantity}{' '}
                {QuantityUnitLabels[sampleItem.quantityUnit]}
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
            <div className={cx('fr-col-4')}>
              <AppTextInput
                type="date"
                label="Date d'expédition"
                value={shippingSampleItem.shippingDate ?? ''}
                onChange={(e) =>
                  setShippingSampleItem({
                    ...shippingSampleItem,
                    shippingDate: e.target.value as MaestroDate | null
                  })
                }
                inputForm={shippingForm}
                inputKey="shippingDate"
                state={shippingForm.messageType('shippingDate')}
                stateRelatedMessage={shippingForm.message('shippingDate')}
                whenValid="Date d'expédition correctement renseignée."
                disabled={!hasUserPermission('updateSample')}
              />
            </div>
            <div className={cx('fr-col-4')}>
              <AppTextInput
                type="date"
                label="Date de destruction"
                value={shippingSampleItem.destructionDate ?? ''}
                onChange={(e) =>
                  setShippingSampleItem({
                    ...shippingSampleItem,
                    destructionDate: e.target.value as MaestroDate | null
                  })
                }
                inputForm={shippingForm}
                inputKey="destructionDate"
                state={shippingForm.messageType('destructionDate')}
                stateRelatedMessage={shippingForm.message('destructionDate')}
                whenValid="Date de destruction correctement renseignée."
                disabled={!hasUserPermission('updateSample')}
              />
            </div>
            <div className={cx('fr-col-4')}>
              <AppTextInput
                type="text"
                label="Transporteur"
                value={shippingSampleItem.carrier ?? ''}
                onChange={(e) =>
                  setShippingSampleItem({
                    ...shippingSampleItem,
                    carrier: e.target.value
                  })
                }
                inputForm={shippingForm}
                inputKey="carrier"
                state={shippingForm.messageType('carrier')}
                stateRelatedMessage={shippingForm.message('carrier')}
                whenValid="Transporteur correctement renseigné."
                disabled={!hasUserPermission('updateSample')}
              />
            </div>
          </div>
        </Accordion>
        <Accordion label="Facturation">
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-4')}>
              <AppTextInput
                type="date"
                label="Date de facturation"
                value={billingSampleItem.invoicingDate ?? ''}
                onChange={(e) =>
                  setBillingSampleItem({
                    ...billingSampleItem,
                    invoicingDate: e.target.value as MaestroDate | null
                  })
                }
                inputForm={billingForm}
                inputKey="invoicingDate"
                state={billingForm.messageType('invoicingDate')}
                stateRelatedMessage={billingForm.message('invoicingDate')}
                whenValid="Date de facturation correctement renseignée."
                disabled={!hasUserSamplePermission(sample).performAnalysis}
              />
            </div>
            <div className={cx('fr-col-4')}>
              <AppSelect
                label="Paiement"
                options={[
                  defaultAppSelectOption(),
                  { label: 'Payé', value: 'true' },
                  { label: 'Non payé', value: 'false' }
                ]}
                value={billingSampleItem.paid === true ? 'true' : 'false'}
                onChange={(e) =>
                  setBillingSampleItem({
                    ...billingSampleItem,
                    paid: e.target.value === 'true'
                  })
                }
                inputForm={billingForm}
                inputKey="paid"
                whenValid="Statut de paiement correctement renseigné."
                disabled={!hasUserSamplePermission(sample).performAnalysis}
              />
            </div>
            <div className={cx('fr-col-4')}>
              <AppTextInput
                type="date"
                label="Date de paiement"
                value={billingSampleItem.paidDate ?? ''}
                onChange={(e) =>
                  setBillingSampleItem({
                    ...billingSampleItem,
                    paidDate: e.target.value as MaestroDate | null
                  })
                }
                inputForm={billingForm}
                inputKey="paidDate"
                state={billingForm.messageType('paidDate')}
                stateRelatedMessage={billingForm.message('paidDate')}
                whenValid="Date de paiement correctement renseignée."
                disabled={!hasUserSamplePermission(sample).performAnalysis}
              />
            </div>
          </div>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-4')}>
              <AppTextInput
                type="text"
                label="Numéro de facture"
                value={billingSampleItem.invoiceNumber ?? ''}
                onChange={(e) =>
                  setBillingSampleItem({
                    ...billingSampleItem,
                    invoiceNumber: e.target.value
                  })
                }
                inputForm={billingForm}
                inputKey="invoiceNumber"
                state={billingForm.messageType('invoiceNumber')}
                stateRelatedMessage={billingForm.message('invoiceNumber')}
                whenValid="Numéro de facture correctement renseigné."
                disabled={!hasUserSamplePermission(sample).performAnalysis}
              />
            </div>
            <div className={cx('fr-col-8')}>
              <AppTextInput
                type="text"
                label="Notes budgétaires"
                value={billingSampleItem.budgetNotes ?? ''}
                onChange={(e) =>
                  setBillingSampleItem({
                    ...billingSampleItem,
                    budgetNotes: e.target.value as MaestroDate | null
                  })
                }
                inputForm={billingForm}
                inputKey="budgetNotes"
                state={billingForm.messageType('budgetNotes')}
                stateRelatedMessage={billingForm.message('budgetNotes')}
                whenValid="Notes budgétaires correctement renseignées."
                disabled={!hasUserSamplePermission(sample).performAnalysis}
              />
            </div>
          </div>
        </Accordion>
      </div>
      {sample.notesOnItems && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-quote-line')}></div>
          <div>
            Note additionnelle{' '}
            <div>
              <b>{quote(sample.notesOnItems)}</b>
            </div>
          </div>
        </div>
      )}
      {analysis &&
        analysis.status !== 'Sent' &&
        analysis.status !== 'NotAdmissible' &&
        (!isEditing ? (
          <SampleAnalysisOverview
            sample={sample}
            analysis={analysis}
            readonly={!hasUserSamplePermission(sample).performAnalysis}
            onEdit={() => navigateToSampleEdit(sample.id)}
          />
        ) : (
          <SampleAnalysisForm
            sample={sample}
            partialAnalysis={analysis}
            onDone={() => navigateToSample(sample.id)}
          />
        ))}
      {sample.status === 'InReview' && <UserFeedback />}
    </div>
  );
};

export default SampleItemAnalysis;
