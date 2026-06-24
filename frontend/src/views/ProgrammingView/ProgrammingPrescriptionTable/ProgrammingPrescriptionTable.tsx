import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  type LocalPrescription,
  LocalPrescriptionSort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import {
  getPrescriptionTitle,
  type Prescription
} from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { Fragment, useEffect, useRef, useState } from 'react';
import DistributionCountCell from 'src/components/DistributionCountCell/DistributionCountCell';
import TableHeaderCell from 'src/components/TableHeaderCell/TableHeaderCell';
import { useAuthentication } from '../../../hooks/useAuthentication';

interface Props {
  programmingPlans: ProgrammingPlanChecked[];
  prescriptions: Prescription[];
  regionalPrescriptions: LocalPrescription[];
  onChangeLocalPrescriptionCount: (
    key: LocalPrescriptionKey,
    count: number
  ) => void;
}

const Colgroup = () => (
  <colgroup>
    {RegionList.map((region) => (
    ))}
  </colgroup>
);

const ProgrammingPrescriptionTable = ({
  programmingPlans,
  prescriptions,
  regionalPrescriptions,
  onChangeLocalPrescriptionCount
}: Props) => {
  const { hasUserLocalPrescriptionPermission } = useAuthentication();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const stickyScrollRef = useRef<HTMLDivElement>(null);
  const stickyInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerWrapperRef.current;
    const sticky = stickyScrollRef.current;
    const inner = stickyInnerRef.current;

    const updateWidth = () => {
    };
    const ro = new ResizeObserver(updateWidth);

    header.addEventListener('scroll', onHeaderScroll, { passive: true });
    sticky.addEventListener('scroll', onStickyScroll);

    return () => {
      ro.disconnect();
      header.removeEventListener('scroll', onHeaderScroll);
      sticky.removeEventListener('scroll', onStickyScroll);
    };
  }, []);

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const getLocalPrescriptions = (prescriptionId: string) =>
    regionalPrescriptions
      .filter((r) => r.prescriptionId === prescriptionId)
      .sort(LocalPrescriptionSort);

  const getPlan = (prescription: Prescription) =>
    programmingPlans.find((p) =>
      p.subPlans.some((sp) => sp.id === prescription.programmingSubPlanId)
    ) ?? programmingPlans[0];

  const getSubPlan = (prescription: Prescription) =>
    programmingPlans
      .flatMap((p) => p.subPlans)
      .find((sp) => sp.id === prescription.programmingSubPlanId);

  if (!prescriptions) {
    return null;
  }

  return (
    <div
      data-testid="prescription-table"
    >
      <div className="header-wrapper" ref={headerWrapperRef}>
        <div
          className={clsx(
            'fr-table',
            'fr-table--bordered',
          )}
        >
          <table>
            <Colgroup />
            <thead>
              <tr>
                <th scope="col">N°</th>
                <th scope="col" className="border-left">
                  Matrice
                </th>
                <th scope="col" className="border-left">
                  Analyte
                </th>
                <th scope="col" className="border-left border-right">
                </th>
                {RegionList.map((region, regionIdx) => (
                  <th
                    scope="col"
                    key={`header-${region}`}
                  >
                    <TableHeaderCell
                      shortName={Regions[region].shortName}
                      name={Regions[region].name}
                    />
                  </th>
                ))}
              </tr>
              <tr className="total-row">
                <td colSpan={3} className={cx('fr-text--bold')}>
                  Total prélèvements
                </td>
                  {sumBy(regionalPrescriptions, 'sampleCount')}
                </td>
                {RegionList.map((region, regionIdx) => (
                  <td
                    key={`total-${region}`}
                    className={clsx(
                      { 'border-left': regionIdx !== 0 },
                    )}
                  >
                    {sumBy(
                      regionalPrescriptions.filter((r) => r.region === region),
                      'sampleCount'
                    )}
                  </td>
                ))}
              </tr>
            </thead>
          </table>
        </div>
      </div>

        <div
          className={clsx(
            'fr-table',
            'fr-table--bordered',
          )}
        >
          <table>
            <Colgroup />
            <tbody>
                    <tr>
                      <td>
                        <div className="row-reference">
                          {subPlan?.subPlanNumber}
                          <Button
                            iconId={
                              isExpanded
                                ? 'fr-icon-arrow-up-s-line'
                                : 'fr-icon-arrow-down-s-line'
                            }
                            priority="tertiary no outline"
                            size="small"
                            title={isExpanded ? 'Réduire' : 'Voir les détails'}
                            onClick={() => toggleExpand(prescription.id)}
                          />
                        </div>
                      </td>
                      <td
                        className={clsx(cx('fr-text--bold'), 'border-left')}
                        data-testid={`matrix-${prescription.id}`}
                      >
                        {getPrescriptionTitle(prescription)}
                      </td>
                      <td className="border-left">
                        {subPlan?.substanceKinds
                          .map((sk) => SubstanceKindLabels[sk])
                          .join(', ')}
                      </td>
                      </td>
                        (localPrescription, localPrescriptionIdx) => (
                          <td
                            className={clsx({
                              'border-left': localPrescriptionIdx !== 0
                            })}
                            data-testid={`cell-${prescription.id}`}
                            key={`cell-${prescription.id}-${localPrescription.region}`}
                          >
                            <DistributionCountCell
                              programmingPlan={plan}
                              prescription={prescription}
                              localPrescription={localPrescription}
                              isEditable={
                                hasUserLocalPrescriptionPermission(
                                  plan,
                                  localPrescription
                                )?.updateSampleCount
                              }
                              onChange={async (value) =>
                                onChangeLocalPrescriptionCount(
                                  {
                                    prescriptionId:
                                      localPrescription.prescriptionId,
                                    region: localPrescription.region
                                  },
                                  value
                                )
                              }
                            />
                          </td>
                        )
                      )}
                    </tr>
                    {isExpanded && (
                          <div className="prescription-expanded-content">
                                <div className="d-flex-align-center">
                                  <span
                                  />
                                  <b>Notes</b>
                                </div>
                              </div>
                              <div>
                                <div className="d-flex-align-center">
                                  <span
                                  />
                                  <b>Consignes</b>
                                </div>
                              </div>
                          </div>
        </div>
      </div>

      <div className="sticky-scrollbar" ref={stickyScrollRef}>
        <div ref={stickyInnerRef} />
      </div>
    </div>
  );
};

export default ProgrammingPrescriptionTable;
