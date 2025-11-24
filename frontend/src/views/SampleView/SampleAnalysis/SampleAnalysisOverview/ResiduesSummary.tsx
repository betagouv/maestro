import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { t } from 'i18next';
import { Residue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import {
  ResidueCompliance,
  ResidueComplianceLabels,
  ResidueComplianceList
} from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { pluralize } from '../../../../utils/stringUtils';
import { ResidueComplianceIcon } from './ResidueComplianceIcon';

type Props = {
  residues: Pick<Residue, 'compliance'>[];
};
export const ResiduesSummary: FunctionComponent<Props> = ({
  residues,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const countByCompliance: Record<ResidueCompliance, number> = residues.reduce(
    (acc, r) => {
      acc[r.compliance]++;

      return acc;
    },
    { Compliant: 0, NonCompliant: 0, Other: 0 }
  );

  return (
    <>
      {t('residue', { count: residues.length || 0 })}
      {pluralize(residues.length || 0)(' identifié')}
      <div className={clsx('d-flex-align-center')} style={{ gap: '1rem' }}>
        {ResidueComplianceList.map((c) => (
          <div key={c} className={clsx('d-flex-align-center')}>
            <ResidueComplianceIcon compliance={c} />
            <span
              className={clsx(
                cx('fr-text--sm', 'fr-text--regular', 'fr-m-0', 'fr-pl-1v')
              )}
            >
              {pluralize(countByCompliance[c], { preserveCount: true })(
                ResidueComplianceLabels[c].toLowerCase()
              )}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};
