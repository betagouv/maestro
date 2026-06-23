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
import './ProgrammingRegionalPrescriptionTable.scss';

interface Props {
  programmingPlans: ProgrammingPlanChecked[];
  prescriptions: Prescription[];
  regionalPrescriptions: LocalPrescription[];
  onChangeLocalPrescriptionCount: (
    key: LocalPrescriptionKey,
    count: number
  ) => void;
}

const COL_COUNT = 4 + RegionList.length;

// Les largeurs doivent correspondre exactement aux variables SCSS $col-*-width.
// table-layout: fixed est utilisé pour garantir ces largeurs quelles que soient
// les contraintes de contenu (max-width est ignoré par les navigateurs en auto).
const Colgroup = () => (
  <colgroup>
    <col style={{ width: '5rem' }} />
    <col style={{ width: '12.5rem' }} />
    <col style={{ width: '18.75rem' }} />
    <col style={{ width: '12.5rem' }} />
    {RegionList.map((region) => (
      <col key={`col-${region}`} style={{ width: '4.375rem' }} />
    ))}
  </colgroup>
);

const ProgrammingRegionalPrescriptionTable = ({
  programmingPlans,
  prescriptions,
  regionalPrescriptions,
  onChangeLocalPrescriptionCount
}: Props) => {
  const { hasUserLocalPrescriptionPermission } = useAuthentication();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyScrollRef = useRef<HTMLDivElement>(null);
  const stickyInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerWrapperRef.current;
    const wrapper = wrapperRef.current;
    const sticky = stickyScrollRef.current;
    const inner = stickyInnerRef.current;
    if (!header || !wrapper || !sticky || !inner) return;

    const updateWidth = () => {
      inner.style.width = `${wrapper.scrollWidth}px`;
    };
    const ro = new ResizeObserver(updateWidth);
    ro.observe(wrapper);
    const tableEl = wrapper.querySelector('table');
    if (tableEl) ro.observe(tableEl);

    let syncing = false;
    const sync = (source: HTMLElement, targets: HTMLElement[]) => {
      if (syncing) return;
      syncing = true;
      for (const t of targets) t.scrollLeft = source.scrollLeft;
      syncing = false;
    };

    const onHeaderScroll = () => sync(header, [wrapper, sticky]);
    const onWrapperScroll = () => sync(wrapper, [header, sticky]);
    const onStickyScroll = () => sync(sticky, [header, wrapper]);

    header.addEventListener('scroll', onHeaderScroll, { passive: true });
    wrapper.addEventListener('scroll', onWrapperScroll, { passive: true });
    sticky.addEventListener('scroll', onStickyScroll);

    return () => {
      ro.disconnect();
      header.removeEventListener('scroll', onHeaderScroll);
      wrapper.removeEventListener('scroll', onWrapperScroll);
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
      className="programming-regional-table"
    >
      {/* Header sticky — hors du wrapper scroll */}
      <div className="header-wrapper" ref={headerWrapperRef}>
        <div
          className={clsx(
            'fr-table',
            'fr-table--bordered',
            'fr-table--no-caption'
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
                <th scope="col" className="border-left">
                  Prélèvements programmés
                </th>
                {RegionList.map((region) => (
                  <th
                    scope="col"
                    className="border-left"
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
                <td className="border-left fr-text--bold">
                  {sumBy(regionalPrescriptions, 'sampleCount')}
                </td>
                {RegionList.map((region) => (
                  <td
                    key={`total-${region}`}
                    className="border-left fr-text--bold"
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

      {/* Body scrollable horizontalement */}
      <div className="table-scroll-wrapper" ref={wrapperRef}>
        <div
          className={clsx(
            'fr-table',
            'fr-table--bordered',
            'fr-table--no-caption'
          )}
        >
          <table>
            <Colgroup />
            <tbody>
              {prescriptions.map((prescription) => {
                const subPlan = getSubPlan(prescription);
                const plan = getPlan(prescription);
                const localPs = getLocalPrescriptions(prescription.id);
                const total = sumBy(localPs, 'sampleCount');
                const isExpanded = expandedIds.has(prescription.id);

                return (
                  <Fragment key={prescription.id}>
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
                      <td
                        className={clsx(
                          cx('fr-text--bold'),
                          'border-left',
                          'sample-count'
                        )}
                      >
                        {total}
                      </td>
                      {localPs.map((localPrescription) => (
                        <td
                          className="border-left"
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
                      ))}
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={COL_COUNT} className="sub-row-content">
                          <div className="prescription-expanded-content">
                            {prescription.notes && (
                              <div>
                                <span
                                  className={cx(
                                    'fr-icon-chat-quote-line',
                                    'fr-pr-1w'
                                  )}
                                />
                                {prescription.notes}
                              </div>
                            )}
                            {prescription.programmingInstruction && (
                              <div>
                                <span
                                  className={cx(
                                    'fr-icon-draft-line',
                                    'fr-pr-1w'
                                  )}
                                />
                                <em>
                                  Consignes :{' '}
                                  {prescription.programmingInstruction}
                                </em>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sticky-scrollbar" ref={stickyScrollRef}>
        <div ref={stickyInnerRef} />
      </div>
    </div>
  );
};

export default ProgrammingRegionalPrescriptionTable;
