import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { omit } from 'lodash-es';
import type { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import type { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { ResidueListResult } from './ResidueListResult';
import { ResidueResultOverview } from './ResidueResultOverview';
import { ResiduesSummary } from './ResiduesSummary';

type Props = {
  sample: SampleChecked;
  analysis: PartialAnalysis;
  readonly: boolean;
  onEdit: () => void;
  programmingSubPlan: ProgrammingSubPlan;
};
export const SampleAnalysisOverview: FunctionComponent<Props> = ({
  sample,
  analysis,
  readonly,
  onEdit,
  programmingSubPlan,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const residues = analysis.residues?.map((r) => ({
    ...omit(sample, 'compliance'),
    programmingSubPlanCodeNat: programmingSubPlan.codeNat,
    ...r
  }));

  return (
    <>
      {analysis && (
        <>
          <div className={clsx('d-flex-align-center', cx('fr-m-0'))}>
            <ResiduesSummary residues={analysis.residues ?? []} />

            {!readonly && (
              <Button
                priority="primary"
                iconId="fr-icon-edit-line"
                className={cx('fr-mt-0', 'fr-ml-auto')}
                size="small"
                onClick={onEdit}
              >
                Corriger
              </Button>
            )}
          </div>

          {residues?.length && (
            <ResidueListResult
              residues={residues}
              residuePanel={(i) => (
                <ResidueResultOverview
                  residue={residues[i]}
                  programmingSubPlan={programmingSubPlan}
                />
              )}
            />
          )}
        </>
      )}
    </>
  );
};
