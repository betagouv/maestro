import clsx from 'clsx';
import { Stage } from 'maestro-shared/referential/Stage';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useEffect, useState } from 'react';
import { z } from 'zod';

export const PlanGroupKey = z.object({
  context: ProgrammingPlanContext.nullish(),
  stages: z.array(Stage)
});
export type PlanGroupKey = z.infer<typeof PlanGroupKey>;

export const PlanGroupKeyString = z.string().brand('PlanGroupKeyString');
export type PlanGroupKeyString = z.infer<typeof PlanGroupKeyString>;

export const toPlanGroupKeyString = (key: PlanGroupKey): PlanGroupKeyString =>
  PlanGroupKeyString.parse(
    [key.context ?? '', [...key.stages].sort().join(',')].join('|')
  );

export const PlanHeaderRowKey = z.string().brand('PlanHeaderRowKey');
export type PlanHeaderRowKey = z.infer<typeof PlanHeaderRowKey>;

export const PrescriptionRowKey = z.string().brand('PrescriptionRowKey');
export type PrescriptionRowKey = z.infer<typeof PrescriptionRowKey>;

export type RowWrapperKey = PlanHeaderRowKey | PrescriptionRowKey;

export const toPlanHeaderRowKey = (
  planId: string,
  groupKey: PlanGroupKeyString
): PlanHeaderRowKey =>
  PlanHeaderRowKey.parse(`plan-header-${planId}-${groupKey}`);

export const toPrescriptionRowKey = (id: string): PrescriptionRowKey =>
  PrescriptionRowKey.parse(id);

export const bySubstanceKindLabel = (
  a: Pick<SubstanceKindLaboratory, 'substanceKind'>,
  b: Pick<SubstanceKindLaboratory, 'substanceKind'>
) =>
  SubstanceKindLabels[a.substanceKind].localeCompare(
    SubstanceKindLabels[b.substanceKind],
    'fr'
  );

export const Colgroup = ({
  columnCount,
  showLaboratoryColumn,
  showCheckboxColumn,
  wideColumns
}: {
  columnCount: number;
  showLaboratoryColumn: boolean;
  showCheckboxColumn: boolean;
  wideColumns: boolean;
}) => (
  <colgroup>
    {showCheckboxColumn && <col className="col-checkbox" />}
    <col className="col-n" />
    <col className="col-matrice" />
    <col className="col-analyte" />
    <col className="col-prelevements" />
    {showLaboratoryColumn && <col className="col-laboratoire" />}
    {Array.from({ length: columnCount }, (_, i) => (
      <col
        key={`col-${i}`}
        className={wideColumns ? 'col-company' : 'col-region'}
      />
    ))}
  </colgroup>
);

export const PrescriptionSampleCountInput = ({
  value,
  isPending,
  onChange
}: {
  value: number;
  isPending?: boolean;
  onChange: (value: number) => void;
}) => {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (value === 0) {
      setInputValue('');
      e.target.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const newValue = Number(e.target.value);
    if (!Number.isNaN(newValue) && newValue !== value) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    if (inputValue === '') {
      setInputValue(String(value));
    }
  };

  return (
    <input
      className={clsx(
        'distribution-count-input',
        'distribution-count-input--wide',
        isPending && 'distribution-count-input--pending'
      )}
      type="number"
      min={0}
      value={inputValue}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};
