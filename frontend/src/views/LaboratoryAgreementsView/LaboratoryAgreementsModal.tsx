import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';
import clsx from 'clsx';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type {
  LaboratoryAgreement,
  LaboratoryAgreementRowKey,
  LaboratoryAgreementUpdate
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import LaboratoryAgreementButton from '../../components/LaboratoryAgreement/LaboratoryAgreementButton/LaboratoryAgreementButton';
import LaboratoryAgreementTag from '../../components/LaboratoryAgreement/LaboratoryAgreementTag/LaboratoryAgreementTag';
import './LaboratoryAgreementsModal.scss';
import { pluralize } from '../../utils/stringUtils';

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
  onSave
}: Props) => {
  const [localAgreements, setLocalAgreements] = useState<
    Record<string, LocalAgreement>
  >({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const initial = Object.fromEntries(
      agreements.map((a) => [
        a.laboratoryId,
        {
          referenceLaboratory: a.referenceLaboratory,
          detectionAnalysis: a.detectionAnalysis,
          confirmationAnalysis: a.confirmationAnalysis
        }
      ])
    );
    setLocalAgreements(initial);
  }, [agreements]);

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
        <div className={clsx(cx('fr-pr-3w'), 'agreement-modal-list')}>
          <div className={cx('fr-mb-2w')}>
            <p className={cx('fr-text--md')}>
              {pluralize(laboratoryAgreementRowKeys.length, {
                preserveCount: true
              })('plan sélectionné')}
            </p>
            <SearchBar
              label="Rechercher un laboratoire"
              defaultValue={search}
              onButtonClick={(value) => setSearch(value)}
            />
          </div>
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
                    <span className={cx('fr-text--sm')}>{laboratory.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <LaboratoryAgreementButton
                      field="referenceLaboratory"
                      active={localAgreement.referenceLaboratory}
                      onToggle={() =>
                        toggle(laboratory.id, 'referenceLaboratory')
                      }
                    />
                    <LaboratoryAgreementButton
                      field="detectionAnalysis"
                      active={localAgreement.detectionAnalysis}
                      onToggle={() =>
                        toggle(laboratory.id, 'detectionAnalysis')
                      }
                    />
                    <LaboratoryAgreementButton
                      field="confirmationAnalysis"
                      active={localAgreement.confirmationAnalysis}
                      onToggle={() =>
                        toggle(laboratory.id, 'confirmationAnalysis')
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={clsx(cx('fr-p-3w'), 'agreement-modal-selection')}>
          {filteredLaboratories
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
              return (
                <LaboratoryAgreementTag
                  key={laboratory.id}
                  shortName={laboratory.shortName}
                  referenceLaboratory={local.referenceLaboratory}
                  detectionAnalysis={local.detectionAnalysis}
                  confirmationAnalysis={local.confirmationAnalysis}
                  onToggle={(field) => toggle(laboratory.id, field)}
                />
              );
            })}
        </div>
      </div>
    </modal.Component>
  );
};

export default LaboratoryAgreementsModal;
