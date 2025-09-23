import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { t } from 'i18next';
import { SSD2IdSort } from 'maestro-shared/referential/Residue/SSD2Id';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useCallback, useContext } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import { pluralize } from 'src/utils/stringUtils';
import { ApiClientContext } from '../../../services/apiClient';
import '../PrescriptionEditModal/PrescriptionEditModal.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  renderMode: 'inline' | 'modal';
}

const PrescriptionSubstances = ({
  programmingPlan,
  prescription,
  renderMode
}: Props) => {
  const dispatch = useAppDispatch();
  const apiClient = useContext(ApiClientContext);
  const { hasUserPrescriptionPermission } = useAuthentication();

  const { data: prescriptionSubstances } =
    apiClient.useGetPrescriptionSubstancesQuery(prescription.id, {
      skip: renderMode === 'modal'
    });

  const getSubstancesByAnalysisMethod = useCallback(
    (analysisMethod: AnalysisMethod) =>
      (prescriptionSubstances ?? [])
        .filter((substance) => substance.analysisMethod === analysisMethod)
        .map((_) => _.substance),
    [prescriptionSubstances]
  );

  return (
    <div className="prescription-substance-button">
      <div className={cx('fr-text--bold', 'fr-mb-1w', 'fr-ml-2w')}>
        Au programme :
      </div>
      <div>
        {renderMode === 'inline' ? (
          <div className={cx('fr-px-2w', 'fr-py-1w')}>
            <span
              className={cx('fr-icon-check-line', 'fr-icon--sm', 'fr-mr-1w')}
            />
            {t('analysis', {
              count: prescription.monoAnalysisCount || 0
            })}{' '}
            mono résidu
            <div className={cx('fr-ml-2w', 'fr-mt-1w')}>
              {getSubstancesByAnalysisMethod('Mono')
                .sort(SSD2IdSort)
                .map((substance) => (
                  <Tag
                    key={`Mono-${substance}`}
                    small
                    className={cx('fr-m-1v')}
                  >
                    {SSD2IdLabel[substance]}
                  </Tag>
                ))}
            </div>
          </div>
        ) : (
          <Button
            onClick={() =>
              dispatch(
                prescriptionsSlice.actions.setPrescriptionEditData({
                  mode: 'analysis',
                  programmingPlan,
                  prescription
                })
              )
            }
            priority="tertiary no outline"
            iconId={
              (prescription.monoAnalysisCount ?? 0) === 0
                ? 'fr-icon-add-line'
                : 'fr-icon-check-line'
            }
            className={clsx(cx('fr-text--regular'), 'link-underline')}
          >
            {hasUserPrescriptionPermission(programmingPlan)?.update &&
            (prescription.monoAnalysisCount ?? 0) === 0
              ? `Ajouter une analyse mono résidu`
              : `${t('analysis', {
                  count: prescription.monoAnalysisCount || 0
                })} mono résidu`}
          </Button>
        )}
      </div>
      <div>
        {renderMode === 'inline' ? (
          <div className={cx('fr-px-2w', 'fr-py-1w')}>
            <span
              className={cx('fr-icon-check-line', 'fr-icon--sm', 'fr-mr-1w')}
            />
            {`Analyse multi-résidu (${
              prescription.multiAnalysisCount || 0
            } ${pluralize(prescription.multiAnalysisCount || 0)('spécifiée')})`}
            <div className={cx('fr-ml-2w', 'fr-mt-1w')}>
              {getSubstancesByAnalysisMethod('Multi')
                .sort(SSD2IdSort)
                .map((substance) => (
                  <Tag
                    key={`Multi-${substance}`}
                    small
                    className={cx('fr-m-1v')}
                  >
                    {SSD2IdLabel[substance]}
                  </Tag>
                ))}
            </div>
          </div>
        ) : (
          <Button
            onClick={() =>
              dispatch(
                prescriptionsSlice.actions.setPrescriptionEditData({
                  mode: 'analysis',
                  programmingPlan,
                  prescription
                })
              )
            }
            priority="tertiary no outline"
            iconId={
              (prescription.multiAnalysisCount ?? 0) === 0
                ? 'fr-icon-add-line'
                : 'fr-icon-check-line'
            }
            className={clsx(cx('fr-text--regular'), 'link-underline')}
          >
            {hasUserPrescriptionPermission(programmingPlan)?.update &&
            (prescription.multiAnalysisCount ?? 0) === 0
              ? `Spécifier une analyse multi résidus`
              : `Analyse multi-résidu (${prescription.multiAnalysisCount || 0} ${pluralize(
                  prescription.multiAnalysisCount || 0
                )('spécifiée')})`}
          </Button>
        )}
      </div>
      {programmingPlan.additionalSubstances?.map((substance, index) => (
        <div
          key={`additionalSubstance-${index}`}
          className={clsx(cx('fr-py-1w', 'fr-px-2w'), 'flex-align-center')}
        >
          <span
            className={cx('fr-icon-check-line', 'fr-icon--sm', 'fr-mr-1w')}
          />
          {substance}
        </div>
      ))}
    </div>
  );
};

export default PrescriptionSubstances;
