import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { pick } from 'lodash-es';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { MaestroDate, maestroDateRefined } from 'maestro-shared/utils/date';
import {
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useLocation } from 'react-router';
import { z } from 'zod';
import AppSelect from '../../../components/_app/AppSelect/AppSelect';
import { defaultAppSelectOption } from '../../../components/_app/AppSelect/AppSelectOption';
import AppTextInput from '../../../components/_app/AppTextInput/AppTextInput';
import UserFeedback from '../../../components/UserFeedback/UserFeedback';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useForm } from '../../../hooks/useForm';
import { useSamplesLink } from '../../../hooks/useSamplesLink';
import { ApiClientContext } from '../../../services/apiClient';
import { SampleItemAdmissibility } from './SampleItemAdmissibility/SampleItemAdmissibility';
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

  const Form = z.object({
    shippingDate: maestroDateRefined.nullable(),
    destructionDate: maestroDateRefined.nullable(),
    carrier: z.string().nullable(),
    invoicingDate: maestroDateRefined.nullable(),
    paid: z.boolean().nullable(),
    paidDate: maestroDateRefined.nullable(),
    invoiceNumber: z.string().nullable(),
    budgetNotes: z.string().nullable()
  });

  type FormSchema = z.infer<typeof Form>;

  const [localSampleItem, setLocalSampleItem] = useState(
    sampleItem as FormSchema
  );

  useEffect(() => {
    setLocalSampleItem(sampleItem as FormSchema);
  }, [sampleItem]);

  const save = async () => {
    await updateSampleItem({
      sampleId: sampleItem.sampleId,
      itemNumber: sampleItem.itemNumber,
      copyNumber: sampleItem.copyNumber,
      sampleItemUpdate: { ...sampleItem, ...localSampleItem }
    });
  };

  const form = useForm(
    Form,
    pick(
      localSampleItem,
      'shippingDate',
      'destructionDate',
      'carrier',
      'invoicingDate',
      'paid',
      'paidDate',
      'invoiceNumber',
      'budgetNotes'
    ),
    save
  );

  const readonly = useMemo(
    () =>
      !hasUserPermission('createAnalysis') || sample.region !== user?.region,
    [hasUserPermission, sample, user?.region]
  );

  const isEditing: boolean =
    !readonly &&
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
          readonly={readonly}
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
            <div className={cx('fr-col-4')}>
              <AppTextInput
                type="date"
                label="Date d'expédition"
                value={localSampleItem.shippingDate ?? ''}
                onChange={(e) =>
                  setLocalSampleItem({
                    ...localSampleItem,
                    shippingDate: e.target.value as MaestroDate | null
                  })
                }
                inputForm={form}
                inputKey="shippingDate"
                state={form.messageType('shippingDate')}
                stateRelatedMessage={form.message('shippingDate')}
                whenValid="Date d'expédition correctement renseignée."
                disabled={readonly}
              />
            </div>
            <div className={cx('fr-col-4')}>
              <AppTextInput
                type="date"
                label="Date de destruction"
                value={localSampleItem.destructionDate ?? ''}
                onChange={(e) =>
                  setLocalSampleItem({
                    ...localSampleItem,
                    destructionDate: e.target.value as MaestroDate | null
                  })
                }
                inputForm={form}
                inputKey="destructionDate"
                state={form.messageType('destructionDate')}
                stateRelatedMessage={form.message('destructionDate')}
                whenValid="Date de destruction correctement renseignée."
                disabled={readonly}
              />
            </div>
            <div className={cx('fr-col-4')}>
              <AppTextInput
                type="text"
                label="Transporteur"
                value={localSampleItem.carrier ?? ''}
                onChange={(e) =>
                  setLocalSampleItem({
                    ...localSampleItem,
                    carrier: e.target.value
                  })
                }
                inputForm={form}
                inputKey="carrier"
                state={form.messageType('carrier')}
                stateRelatedMessage={form.message('carrier')}
                whenValid="Transporteur correctement renseigné."
                disabled={readonly}
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
                value={localSampleItem.invoicingDate ?? ''}
                onChange={(e) =>
                  setLocalSampleItem({
                    ...localSampleItem,
                    invoicingDate: e.target.value as MaestroDate | null
                  })
                }
                inputForm={form}
                inputKey="invoicingDate"
                state={form.messageType('invoicingDate')}
                stateRelatedMessage={form.message('invoicingDate')}
                whenValid="Date de facturation correctement renseignée."
                disabled={readonly}
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
                value={localSampleItem.paid === true ? 'true' : 'false'}
                onChange={(e) =>
                  setLocalSampleItem({
                    ...localSampleItem,
                    paid: e.target.value === 'true'
                  })
                }
                inputForm={form}
                inputKey="paid"
                whenValid="Statut de paiement correctement renseigné."
                disabled={readonly}
              />
            </div>
            <div className={cx('fr-col-4')}>
              <AppTextInput
                type="date"
                label="Date de paiement"
                value={localSampleItem.paidDate ?? ''}
                onChange={(e) =>
                  setLocalSampleItem({
                    ...localSampleItem,
                    paidDate: e.target.value as MaestroDate | null
                  })
                }
                inputForm={form}
                inputKey="paidDate"
                state={form.messageType('paidDate')}
                stateRelatedMessage={form.message('paidDate')}
                whenValid="Date de paiement correctement renseignée."
                disabled={readonly}
              />
            </div>
          </div>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-4')}>
              <AppTextInput
                type="text"
                label="Numéro de facture"
                value={localSampleItem.invoiceNumber ?? ''}
                onChange={(e) =>
                  setLocalSampleItem({
                    ...localSampleItem,
                    invoiceNumber: e.target.value
                  })
                }
                inputForm={form}
                inputKey="invoiceNumber"
                state={form.messageType('invoiceNumber')}
                stateRelatedMessage={form.message('invoiceNumber')}
                whenValid="Numéro de facture correctement renseigné."
                disabled={readonly}
              />
            </div>
            <div className={cx('fr-col-8')}>
              <AppTextInput
                type="text"
                label="Notes budgétaires"
                value={localSampleItem.budgetNotes ?? ''}
                onChange={(e) =>
                  setLocalSampleItem({
                    ...localSampleItem,
                    budgetNotes: e.target.value as MaestroDate | null
                  })
                }
                inputForm={form}
                inputKey="budgetNotes"
                state={form.messageType('budgetNotes')}
                stateRelatedMessage={form.message('budgetNotes')}
                whenValid="Notes budgétaires correctement renseignées."
                disabled={readonly}
              />
            </div>
          </div>
        </Accordion>
      </div>
      {analysis && analysis.status !== 'Sent' && (
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
