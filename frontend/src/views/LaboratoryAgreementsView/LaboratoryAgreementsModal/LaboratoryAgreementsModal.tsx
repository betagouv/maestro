import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import type { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import clsx from 'clsx';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type {
  LaboratoryAgreement,
  LaboratoryAgreementRowKey,
  LaboratoryAgreementUpdate
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import LaboratoryAgreementButtons from '../../../components/LaboratoryAgreement/LaboratoryAgreementButtons/LaboratoryAgreementButtons';
import LaboratoryAgreementTag from '../../../components/LaboratoryAgreement/LaboratoryAgreementTag/LaboratoryAgreementTag';
import './LaboratoryAgreementsModal.scss';
import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { pluralize } from '../../../utils/stringUtils';

export type ModalInstance = {
  Component: (props: ModalProps) => React.JSX.Element;
  close: () => void;
  open: () => void;
  isOpenedByDefault: boolean;
  id: string;
};

type LocalAgreement = {
  referenceLaboratory: boolean;
  detectionAnalysis: boolean;
  confirmationAnalysis: boolean;
};

type LabAgreementFlags = Pick<
  LaboratoryAgreement,
  | 'laboratoryId'
  | 'referenceLaboratory'
  | 'detectionAnalysis'
  | 'confirmationAnalysis'
>;

interface Props {
  modal: ModalInstance;
  laboratoryAgreementRowKeys: LaboratoryAgreementRowKey[];
  agreements: LabAgreementFlags[];
  laboratories: Laboratory[];
  programmingSubPlan?: ProgrammingSubPlan;
  onSave: (
    laboratoryId: string,
    input: LaboratoryAgreementUpdate
  ) => Promise<void>;
}

const defaultLocalAgreement: LocalAgreement = {
  referenceLaboratory: false,
  detectionAnalysis: false,
  confirmationAnalysis: false
};

const LaboratoryAgreementsModal = ({
  modal,
  laboratoryAgreementRowKeys,
  agreements,
  laboratories,
  programmingSubPlan,
  onSave
}: Props) => {
  const [localAgreements, setLocalAgreements] = useState<
    Record<string, LocalAgreement>
  >({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const init: Record<string, LocalAgreement> = {};
    for (const a of agreements) {
      init[a.laboratoryId] = {
        referenceLaboratory: a.referenceLaboratory,
        detectionAnalysis: a.detectionAnalysis,
        confirmationAnalysis: a.confirmationAnalysis
      };
    }
    setLocalAgreements(init);
  }, [agreements]);

  useIsModalOpen(modal, {
    onConceal: () => setSearch('')
  });

  const toggle = (labId: string, field: keyof LocalAgreement) => {
    setLocalAgreements((prev) => ({
      ...prev,
      [labId]: {
        ...defaultLocalAgreement,
        ...prev[labId],
        [field]: !(prev[labId]?.[field] ?? false)
      }
    }));
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (laboratoryAgreementRowKeys.length === 0) {
      return;
    }

    const previousLabIds = agreements.map((a) => a.laboratoryId);

    const allLabIds = [
      ...new Set([...Object.keys(localAgreements), ...previousLabIds])
    ];

    await Promise.all(
      allLabIds.flatMap((laboratoryId) => {
        const flags = localAgreements[laboratoryId] ?? defaultLocalAgreement;
        return laboratoryAgreementRowKeys.map((laboratoryAgreementRowKey) =>
          onSave(laboratoryId, { laboratoryAgreementRowKey, ...flags })
        );
      })
    );
    setSearch('');
    modal.close();
  };

  const filteredLaboratories = useMemo(() => {
    const term = search.toLowerCase().trim();
    const filtered = term
      ? laboratories.filter(
          (lab) =>
            lab.shortName.toLowerCase().includes(term) ||
            lab.name.toLowerCase().includes(term)
        )
      : laboratories;
    return filtered.toSorted((a, b) => a.shortName.localeCompare(b.shortName));
  }, [laboratories, search]);

  return (
    <modal.Component
      title={<span className={cx('fr-ml-1w')}>Affecter les laboratoires</span>}
      iconId="fr-icon-microscope-line"
      concealingBackdrop={false}
      size="large"
      buttons={[
        {
          children: 'Annuler',
          priority: 'secondary',
          doClosesModal: true
        },
        {
          children: 'Enregistrer',
          onClick: handleSave,
          doClosesModal: false
        }
      ]}
    >
      <div className="agreement-modal">
        <div className="agreement-modal-list">
          <div className={clsx(cx('fr-mb-2w'), 'agreement-modal-list-search')}>
            <p className={cx('fr-text--md')}>
              {laboratoryAgreementRowKeys.length === 1 ? (
                <>
                  N°
                  {programmingSubPlan?.codeNat}
                  {' | '}
                  {
                    SubstanceKindLabels[
                      laboratoryAgreementRowKeys[0].substanceKind
                    ]
                  }
                </>
              ) : (
                pluralize(laboratoryAgreementRowKeys.length, {
                  preserveCount: true
                })('plan sélectionné')
              )}
            </p>
            <div className="search-input-wrapper">
              <Input
                label="Rechercher un laboratoire"
                hideLabel
                iconId="fr-icon-search-line"
                nativeInputProps={{
                  placeholder: 'Rechercher un laboratoire',
                  value: search,
                  onChange: (e) => setSearch(e.target.value)
                }}
              />
              {search && (
                <Button
                  iconId="fr-icon-close-line"
                  priority="tertiary no outline"
                  size="small"
                  title="Effacer la recherche"
                  className="search-input-clear"
                  onClick={() => setSearch('')}
                />
              )}
            </div>
          </div>
          <div className="agreement-modal-list-body">
            {filteredLaboratories.map((laboratory, index) => {
              const localAgreement =
                localAgreements[laboratory.id] ?? defaultLocalAgreement;
              return (
                <div key={laboratory.id}>
                  {index > 0 && <hr className={cx('fr-my-1w')} />}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <span className={cx('fr-text--bold')}>
                        {laboratory.shortName}
                      </span>
                      <br />
                      <span className={cx('fr-text--sm')}>
                        {laboratory.name}
                      </span>
                    </div>
                    <LaboratoryAgreementButtons
                      values={localAgreement}
                      onToggle={(field) => toggle(laboratory.id, field)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="agreement-modal-selection">
          {laboratories
            .toSorted((a, b) => a.shortName.localeCompare(b.shortName))
            .filter((laboratory) => {
              const local = localAgreements[laboratory.id];
              return (
                local &&
                (local.referenceLaboratory ||
                  local.detectionAnalysis ||
                  local.confirmationAnalysis)
              );
            })
            .map((laboratory) => {
              const local = localAgreements[laboratory.id];
              const rowKey = laboratoryAgreementRowKeys[0];
              if (!rowKey) {
                return null;
              }
              const laboratoryAgreement = {
                laboratoryId: laboratory.id,
                programmingSubPlanId: rowKey.programmingSubPlanId,
                substanceKind: rowKey.substanceKind,
                referenceLaboratory: local.referenceLaboratory,
                detectionAnalysis: local.detectionAnalysis,
                confirmationAnalysis: local.confirmationAnalysis
              };
              return (
                <LaboratoryAgreementTag
                  key={laboratory.id}
                  laboratoryAgreement={laboratoryAgreement}
                  laboratory={laboratory}
                  programmingSubPlan={programmingSubPlan}
                  afterClose={modal.open}
                />
              );
            })}
        </div>
      </div>
    </modal.Component>
  );
};

export default LaboratoryAgreementsModal;
