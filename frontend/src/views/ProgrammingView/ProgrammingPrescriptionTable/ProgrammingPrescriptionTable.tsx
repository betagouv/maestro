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
import './ProgrammingPrescriptionTable.scss';
import PrescriptionSubstances from '../../../components/Prescription/PrescriptionSubstances/PrescriptionSubstances';
import { pluralize } from '../../../utils/stringUtils';

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
    <col style={{ width: '5rem' }} />
    <col style={{ width: '12.5rem' }} />
    <col style={{ width: '18.75rem' }} />
    <col style={{ width: '13rem' }} />
    {RegionList.map((region) => (
      <col key={`col-${region}`} style={{ width: '4.375rem' }} />
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
  const syncingRef = useRef(false);
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const rowWrapperRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const stickyScrollRef = useRef<HTMLDivElement>(null);
  const stickyInnerRef = useRef<HTMLDivElement>(null);

  const sync = (source: HTMLDivElement) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    [
      headerWrapperRef.current,
      ...Array.from(rowWrapperRefs.current.values()),
      stickyScrollRef.current
    ]
      .filter((el): el is HTMLDivElement => !!el && el !== source)
      .forEach((el) => {
        el.scrollLeft = source.scrollLeft;
      });
    syncingRef.current = false;
  };

  useEffect(() => {
    const header = headerWrapperRef.current;
    const sticky = stickyScrollRef.current;
    const inner = stickyInnerRef.current;
    if (!header || !sticky || !inner) return;

    const updateWidth = () => {
      inner.style.width = `${header.scrollWidth}px`;
    };
    const ro = new ResizeObserver(updateWidth);
    ro.observe(header);
    const tableEl = header.querySelector('table');
    if (tableEl) ro.observe(tableEl);

    const onHeaderScroll = () => sync(header);
    const onStickyScroll = () => sync(sticky);
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
      className="programming-regional-table"
    >
      {/* Header sticky — hors du wrapper scroll */}
      <div className="header-wrapper" ref={headerWrapperRef}>
        <div
          className={clsx(
            'fr-table',
            'fr-table--bordered',
            'fr-table--no-caption',
            'fr-table--no-scroll'
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
                  Prélèvements programmés
                </th>
                {RegionList.map((region, regionIdx) => (
                  <th
                    scope="col"
                    className={clsx(
                      { 'border-left': regionIdx !== 0 },
                      cx('fr-p-1w')
                    )}
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
                <td
                  className={clsx(
                    cx('fr-text--bold'),
                    'border-left',
                    'border-right'
                  )}
                >
                  {pluralize(sumBy(regionalPrescriptions, 'sampleCount'), {
                    preserveCount: true
                  })('prélèvement')}
                </td>
                {RegionList.map((region, regionIdx) => (
                  <td
                    key={`total-${region}`}
                    className={clsx(
                      cx('fr-text--bold'),
                      { 'border-left': regionIdx !== 0 },
                      'align-center'
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

      {prescriptions.map((prescription) => {
        const subPlan = getSubPlan(prescription);
        const plan = getPlan(prescription);
        const localPrescriptions = getLocalPrescriptions(prescription.id);
        const totalSampleCount = sumBy(localPrescriptions, 'sampleCount');

        const isExpanded = expandedIds.has(prescription.id);

        return (
          <Fragment key={prescription.id}>
            <div
              className="table-scroll-wrapper"
              ref={(el) => {
                if (el) rowWrapperRefs.current.set(prescription.id, el);
                else rowWrapperRefs.current.delete(prescription.id);
              }}
              onScroll={(e) => sync(e.currentTarget)}
            >
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
                      <td className={clsx('border-left', 'border-right')}>
                        <div>
                          {pluralize(totalSampleCount, {
                            preserveCount: true
                          })('prélèvement')}
                        </div>
                        {/*<Badge*/}
                        {/*  small={true}*/}
                        {/*  noIcon*/}
                        {/*  severity={*/}
                        {/*    totalSampleCount === totalRealizedSampleCount*/}
                        {/*      ? 'success'*/}
                        {/*      : 'warning'*/}
                        {/*  }*/}
                        {/*  className={'fr-px-1v'}*/}
                        {/*>*/}
                        {/*  {totalSampleCount < totalRealizedSampleCount && (*/}
                        {/*    <span*/}
                        {/*      className={cx(*/}
                        {/*        'fr-icon-arrow-right-up-line',*/}
                        {/*        'fr-pr-1v'*/}
                        {/*      )}*/}
                        {/*    />*/}
                        {/*  )}*/}
                        {/*  {totalSampleCount > totalRealizedSampleCount && (*/}
                        {/*    <span*/}
                        {/*      className={cx(*/}
                        {/*        'fr-icon--sm',*/}
                        {/*        'fr-icon-arrow-right-down-line',*/}
                        {/*        'fr-pr-1v'*/}
                        {/*      )}*/}
                        {/*    />*/}
                        {/*  )}*/}
                        {/*  {pluralize(totalRealizedSampleCount, {*/}
                        {/*    preserveCount: true*/}
                        {/*  })('attribué')}*/}
                        {/*</Badge>*/}
                      </td>
                      {localPrescriptions.map(
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
                  </tbody>
                </table>
              </div>
            </div>
            {isExpanded && (
              <div className="prescription-expanded-content">
                <div className={cx('fr-grid-row')}>
                  <div className={cx('fr-col-3')}>
                    <div className={cx('fr-mb-3w')}>
                      <div className="d-flex-align-center">
                        <span
                          className={cx('fr-icon-chat-quote-line', 'fr-pr-1v')}
                        />
                        <b>Notes</b>
                      </div>
                      {prescription.notes ?? 'Aucune note'}
                    </div>
                    <div>
                      <div className="d-flex-align-center">
                        <span
                          className={cx('fr-icon-chat-quote-line', 'fr-pr-1v')}
                        />
                        <b>Consignes</b>
                      </div>
                      {prescription.programmingInstruction ?? 'Aucune consigne'}
                    </div>
                  </div>
                  <div className={cx('fr-col-3')}>
                    <PrescriptionSubstances
                      programmingPlan={
                        programmingPlans.find(
                          (p) => p.id === prescription.programmingPlanId
                        ) ?? programmingPlans[0]
                      }
                      prescription={prescription}
                      renderMode="inline"
                    />
                  </div>
                </div>
              </div>
            )}
          </Fragment>
        );
      })}

      <div className="sticky-scrollbar" ref={stickyScrollRef}>
        <div ref={stickyInnerRef} />
      </div>
    </div>
  );
};

export default ProgrammingPrescriptionTable;
