import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { t } from 'i18next';
import { sumBy } from 'lodash-es';
import {
  LocalPrescription,
  SlaughterhouseSampleCounts
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import { z } from 'zod';
import { useForm } from '../../../hooks/useForm';
import { ApiClientContext } from '../../../services/apiClient';
import { pluralize } from '../../../utils/stringUtils';
import AppSelect from '../../_app/AppSelect/AppSelect';
import AppTextInput from '../../_app/AppTextInput/AppTextInput';

interface Props {
  departmentalPrescription: LocalPrescription;
  slaughterhousePrescriptions: LocalPrescription[];
  onSubmit: (slaughterhousePrescriptions: LocalPrescription[]) => Promise<void>;
}

const LocalPrescriptionSlaughterhouseDistribution = forwardRef<
  { submit: () => void },
  Props
>(
  (
    { departmentalPrescription, slaughterhousePrescriptions, onSubmit },
    ref
  ) => {
    const apiClient = useContext(ApiClientContext);
    const [slaughterhouseSampleCounts, setSlaughterhouseSampleCounts] =
      useState(
        (slaughterhousePrescriptions ?? []).length > 0
          ? (slaughterhousePrescriptions ?? []).map(
              (slaughterhousePrescription) => ({
                companySiret: slaughterhousePrescription.companySiret ?? '',
                sampleCount: slaughterhousePrescription.sampleCount
              })
            )
          : [
              {
                companySiret: '',
                sampleCount: 0
              }
            ]
      );

    const distributedSampleCount = useMemo(
      () => sumBy(slaughterhouseSampleCounts, 'sampleCount'),
      [slaughterhouseSampleCounts]
    );

    const { data: companies } = apiClient.useFindCompaniesQuery({
      kind: 'Slaughterhouse',
      region: departmentalPrescription.region,
      department: departmentalPrescription.department
    });

    const Form = z.object({
      slaughterhouseSampleCounts: SlaughterhouseSampleCounts
    });

    const form = useForm(Form, {
      slaughterhouseSampleCounts
    });

    useImperativeHandle(ref, () => ({
      submit: async () => {
        await form.validate(async () => {
          onSubmit(
            slaughterhouseSampleCounts.map((slaughterhouseSampleCount) => ({
              ...departmentalPrescription,
              companySiret: slaughterhouseSampleCount.companySiret,
              sampleCount: slaughterhouseSampleCount.sampleCount
            }))
          );
        });
      }
    }));

    if (!companies) {
      return <div>Chargement des abattoirs...</div>;
    }

    return (
      <>
        <div>
          Répartissez les prélèvements à effectuer dans les abattoirs de votre
          département.
        </div>
        <div className={cx('fr-text--bold', 'fr-mb-3w', 'fr-pt-1w')}>
          {t('sample', {
            count: departmentalPrescription.sampleCount
          })}
          {' • '}
          <Badge noIcon severity="success" className={'fr-px-1w'}>
            {pluralize(distributedSampleCount, {
              preserveCount: true
            })('attribué')}
          </Badge>
          <Badge noIcon severity="error" className={'fr-mx-1w'}>
            {departmentalPrescription.sampleCount - distributedSampleCount} à
            attribuer
          </Badge>
        </div>
        <div className={clsx(cx('fr-p-3w', 'fr-mb-3w'), 'white-container')}>
          {slaughterhouseSampleCounts.map(
            (slaughterhouseSampleCount, slaughterhouseSampleCountIndex) => (
              <div
                className={cx('fr-grid-row', 'fr-grid-row--gutters')}
                key={`slaughterhousePrescription_${slaughterhouseSampleCountIndex}`}
              >
                <div className={cx('fr-col-6')}>
                  <AppSelect
                    defaultValue={slaughterhouseSampleCount.companySiret ?? ''}
                    options={[
                      { label: 'Sélectionner un abattoir', value: '' },
                      ...(companies ?? [])
                        .filter(
                          (company) =>
                            !slaughterhouseSampleCounts.some(
                              (_, i) =>
                                _.companySiret === company.siret &&
                                i !== slaughterhouseSampleCountIndex
                            )
                        )
                        .map((company) => ({
                          label: company.name,
                          value: company.siret
                        }))
                    ]}
                    label="Abattoir"
                    onChange={(e) =>
                      setSlaughterhouseSampleCounts(
                        slaughterhouseSampleCounts.map((sp, i) =>
                          i === slaughterhouseSampleCountIndex
                            ? {
                                ...sp,
                                companySiret: e.target.value
                              }
                            : sp
                        )
                      )
                    }
                    inputForm={form}
                    inputPathFromKey={[
                      slaughterhouseSampleCountIndex,
                      'companySiret'
                    ]}
                    inputKey="slaughterhouseSampleCounts"
                    required
                  />
                </div>
                <div className={cx('fr-col-6')}>
                  <div className="d-flex-align-center">
                    <AppTextInput
                      className="flex-grow-1"
                      defaultValue={slaughterhouseSampleCount.sampleCount ?? 0}
                      type="number"
                      min={0}
                      max={
                        departmentalPrescription.sampleCount -
                        distributedSampleCount +
                        slaughterhouseSampleCount.sampleCount
                      }
                      label="Prélèvements"
                      onChange={(e) =>
                        setSlaughterhouseSampleCounts(
                          slaughterhouseSampleCounts.map((sp, i) =>
                            i === slaughterhouseSampleCountIndex
                              ? {
                                  ...sp,
                                  sampleCount: Number(e.target.value)
                                }
                              : sp
                          )
                        )
                      }
                      inputForm={form}
                      inputPathFromKey={[
                        slaughterhouseSampleCountIndex,
                        'sampleCount'
                      ]}
                      inputKey="slaughterhouseSampleCounts"
                      required
                    />
                    {slaughterhouseSampleCounts.length > 1 && (
                      <Button
                        iconId="fr-icon-delete-line"
                        priority="secondary"
                        title="Supprimer"
                        onClick={() =>
                          setSlaughterhouseSampleCounts(
                            slaughterhouseSampleCounts.filter(
                              (_, i) => i !== slaughterhouseSampleCountIndex
                            )
                          )
                        }
                        className={cx('fr-ml-2w', 'fr-mt-1w')}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          )}
          {companies.length > slaughterhouseSampleCounts.length &&
            distributedSampleCount < departmentalPrescription.sampleCount && (
              <Button
                priority="tertiary"
                iconId="fr-icon-add-line"
                onClick={() =>
                  setSlaughterhouseSampleCounts([
                    ...slaughterhouseSampleCounts,
                    { companySiret: '', sampleCount: 0 }
                  ])
                }
                className={cx('fr-mt-2w')}
              >
                Ajouter un abattoir
              </Button>
            )}
        </div>
      </>
    );
  }
);

export default LocalPrescriptionSlaughterhouseDistribution;
