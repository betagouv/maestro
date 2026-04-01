import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { LegalContextLabels, LegalContextList } from 'maestro-shared/referential/LegalContext';
import { ContextLabels, ProgrammingPlanContextList } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { DistributionKind, DistributionKindLabels } from 'maestro-shared/schema/ProgrammingPlan/DistributionKind';
import {
  ProgrammingPlanDomain,
  ProgrammingPlanDomainLabels
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import {
  ProgrammingPlanKindLabels,
  ProgrammingPlanKindList
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  type ProgrammingPlanChecked,
  ProgrammingPlanToUpsert
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { SubstanceKind, SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import type { Nullable } from 'maestro-shared/utils/typescript';
import type React from 'react';
import { useContext, useEffect, useState } from 'react';
import { AppMultiSelect } from '../../../components/_app/AppMultiSelect/AppMultiSelect';
import AppSelect from '../../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../../components/_app/AppSelect/AppSelectOption';
import AppTextInput from '../../../components/_app/AppTextInput/AppTextInput';
import { useForm } from '../../../hooks/useForm';
import { ApiClientContext } from '../../../services/apiClient';

const modal = createModal({
  id: 'programming-plan-modal',
  isOpenedByDefault: false
});

interface Props {
  programmingPlanToUpdate?: ProgrammingPlanChecked;
  setAlertMessage: (message: string) => void;
}

const programmingPlanDefaultValue: Nullable<ProgrammingPlanToUpsert> = {
  title: '',
  domain: null,
  kinds: [],
  contexts: [],
  legalContexts: [],
  samplesOutsidePlanAllowed: false,
  substanceKinds: [],
  distributionKind: null,
  year: new Date().getFullYear() + 1
};

const ProgrammingPlanAdminModal = ({
  programmingPlanToUpdate,
  setAlertMessage
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const [formData, setFormData] = useState<Nullable<ProgrammingPlanToUpsert>>(
    programmingPlanDefaultValue
  );

  const [createProgrammingPlan, createProgrammingPlanResult] =
    apiClient.useCreateProgrammingPlanMutation();
  const [updateProgrammingPlan, updateProgrammingPlanResult] =
    apiClient.useUpdateProgrammingPlanMutation();

  const form = useForm(ProgrammingPlanToUpsert, formData);

  useEffect(() => {
    if (programmingPlanToUpdate) {
      setFormData(ProgrammingPlanToUpsert.parse(programmingPlanToUpdate));
    }
  }, [programmingPlanToUpdate]);

  useIsModalOpen(modal, {
    onConceal: () => {
      form.reset();
      createProgrammingPlanResult.reset();
      updateProgrammingPlanResult.reset();
      setTimeout(() => {
        setFormData(programmingPlanDefaultValue);
      }, 2);
    }
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    await form.validate(async (plan) => {
      try {
        if (programmingPlanToUpdate?.id) {
          await updateProgrammingPlan({
            programmingPlanId: programmingPlanToUpdate.id,
            programmingPlanUpdate: plan
          }).unwrap();
          setAlertMessage(
            `Le plan ${programmingPlanToUpdate.title} ${programmingPlanToUpdate.year} a bien été modifié.`
          );
        } else {
          await createProgrammingPlan(plan).unwrap();
          setAlertMessage(
            `Le plan ${programmingPlanToUpdate?.title} ${programmingPlanToUpdate?.year} a bien été créé.`
          );
        }
        e.preventDefault();
        modal.close();
      } catch (_e: any) {
        /* empty */
      }
    });
  };

  return (
    <>
      <Button
        onClick={() => modal.open()}
        iconId="fr-icon-add-line"
        iconPosition="right"
      >
        Créer un nouveau plan
      </Button>
      <modal.Component
        title={
          !programmingPlanToUpdate?.id
            ? 'Nouveau plan de programmation'
            : 'Modification du plan de programmation'
        }
        size="large"
        concealingBackdrop={false}
        topAnchor
        buttons={[
          {
            children: 'Annuler',
            doClosesModal: true,
            priority: 'secondary'
          },
          {
            children: 'Enregistrer',
            onClick: submit,
            doClosesModal: false,
            priority: 'primary'
          }
        ]}
      >
        <form>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12')}>
              <AppTextInput
                value={formData.title ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                inputForm={form}
                inputKey="title"
                label="Titre du plan"
                required
              />
            </div>
            <div className={cx('fr-col-6')}>
              <AppTextInput
                value={formData.year ?? new Date().getFullYear() + 1}
                onChange={(e) =>
                  setFormData({ ...formData, year: Number(e.target.value) })
                }
                inputForm={form}
                inputKey="year"
                label="Année du plan"
                required
                type={'number'}
              />
            </div>
            <div className={cx('fr-col-6')}>
              <AppSelect
                value={formData.domain ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    domain: e.target.value as ProgrammingPlanDomain
                  })
                }
                inputForm={form}
                inputKey="domain"
                label="Domaine"
                required
                options={selectOptionsFromList(ProgrammingPlanDomain.options, {
                  labels: ProgrammingPlanDomainLabels
                })}
              />
            </div>
            <div className={cx('fr-col-6')}>
              <AppMultiSelect
                values={formData.kinds ?? []}
                onChange={(kinds) =>
                  setFormData({
                    ...formData,
                    kinds
                  })
                }
                items={ProgrammingPlanKindList}
                keysWithLabels={ProgrammingPlanKindLabels}
                defaultLabel="type sélectionné"
                defaultEmptyLabel="Sélectionner les types de plan"
                inputForm={form}
                inputKey="kinds"
                label="Types de plan"
                required
              />
            </div>
            <div className={cx('fr-col-6')}>
              <AppMultiSelect
                values={formData.contexts ?? []}
                onChange={(contexts) => setFormData({ ...formData, contexts })}
                items={ProgrammingPlanContextList}
                keysWithLabels={ContextLabels}
                defaultLabel="contexte sélectionné"
                defaultEmptyLabel="Sélectionner les contextes"
                inputForm={form}
                inputKey="contexts"
                label="Contextes"
                required
              />
            </div>
            <div className={cx('fr-col-6')}>
              <AppMultiSelect
                values={formData.legalContexts ?? []}
                onChange={(legalContexts) =>
                  setFormData({ ...formData, legalContexts })
                }
                items={LegalContextList}
                keysWithLabels={LegalContextLabels}
                defaultLabel="cadre juridique sélectionné"
                defaultEmptyLabel="Sélectionner les cadres juridiques"
                inputForm={form}
                inputKey="legalContexts"
                label="Cadres juridiques"
                required
              />
            </div>
            <div className={cx('fr-col-6')}>
              <AppMultiSelect
                values={formData.substanceKinds ?? []}
                onChange={(substanceKinds) =>
                  setFormData({ ...formData, substanceKinds })
                }
                items={SubstanceKind.options}
                keysWithLabels={SubstanceKindLabels}
                defaultLabel="type de substance sélectionné"
                defaultEmptyLabel="Sélectionner les types de substances"
                inputForm={form}
                inputKey="substanceKinds"
                label="Types de substances"
              />
            </div>
            <div className={cx('fr-col-6')}>
              <AppSelect
                value={formData.distributionKind ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    distributionKind: e.target.value as DistributionKind
                  })
                }
                options={selectOptionsFromList(DistributionKind.options, {
                  labels: DistributionKindLabels
                })}
                inputForm={form}
                inputKey="distributionKind"
                label="Mode de répartition"
                required
              />
            </div>
            <div className={cx('fr-col-6')}>
              <div className={cx('fr-mb-2w')}>
                <Checkbox
                  options={[
                    {
                      label: 'Autoriser les prélèvements hors plan',
                      nativeInputProps: {
                        checked: formData.samplesOutsidePlanAllowed ?? false,
                        onChange: (e) => {
                          setFormData({
                            ...formData,
                            samplesOutsidePlanAllowed: e.target.checked
                          });
                        }
                      }
                    }
                  ]}
                />
              </div>
            </div>
          </div>
        </form>
      </modal.Component>
    </>
  );
};

export default ProgrammingPlanAdminModal;
