import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import type { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { AnalysisDocumentPreview } from '../../components/AnalysisDocumentPreview';
import { ResidueListResult } from '../SampleAnalysisOverview/ResidueListResult';
import { ResiduesSummary } from '../SampleAnalysisOverview/ResiduesSummary';
import { ResidueResultForm } from './ResidueResultForm';

type Props = {
  sample: Sample;
  analysis: PartialAnalysis;
};
export const SampleAnalysisForm: FunctionComponent<Props> = ({
  sample,
  analysis,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  return (
    <>
      {analysis && (
        <>
          <AnalysisDocumentPreview
            analysisId={analysis.id}
            sampleId={sample.id}
            readonly={true}
          />

          <h5 className={clsx('d-flex-align-center', cx('fr-m-0'))}>
            <ResiduesSummary residues={analysis.residues ?? []} />
          </h5>

          {analysis.residues?.length && (
            <ResidueListResult
              residues={analysis.residues}
              residuePanel={(residue) => (
                <ResidueResultForm residue={residue} />
              )}
            />
          )}

          <div>TODO</div>
        </>
      )}
    </>
  );
};
