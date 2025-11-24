import clsx from 'clsx';
import { FunctionComponent, useState } from 'react';
import { assert, type Equals } from 'tsafe';

import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type {
  FrClassName,
  FrIconClassName
} from '@codegouvfr/react-dsfr/fr/generatedFromCss/classNames';
import { ClassValue } from 'clsx/clsx';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { Residue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { ResidueCompliance } from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import './ResidueListResultOverview.scss';
import { ResidueResultOverview } from './ResidueResultOverview';

const ComplianceIcon: Record<
  ResidueCompliance,
  [FrIconClassName, FrClassName]
> = {
  Compliant: ['fr-icon-success-line', 'fr-label--success'],
  NonCompliant: ['fr-icon-close-line', 'fr-label--error'],
  Other: ['fr-icon-alert-line', 'fr-message']
};

type Props = {
  residues: Residue[];
};

export const ResidueListResultOverview: FunctionComponent<Props> = ({
  residues,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [selectedResidue, setSelectedResidue] = useState<Residue>(residues[0]);

  return (
    <div className={clsx('residue-list-container', 'border')}>
      <div className={clsx('residues-side-menu')}>
        {residues.map((r, i) => (
          <ResidueMenuItem
            key={r.reference}
            residue={r}
            className={[
              i === residues.length - 1 ? undefined : 'border-bottom',
              selectedResidue.residueNumber === r.residueNumber
                ? 'current-residue'
                : undefined
            ]}
            onClick={() => setSelectedResidue(r)}
          />
        ))}
      </div>

      <ResidueItem residue={selectedResidue} />
    </div>
  );
};

const ResidueMenuItem: FunctionComponent<{
  residue: Residue;
  className: ClassValue[];
  onClick: () => void;
}> = ({ residue, className, onClick, ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <button
      className={clsx(
        'residues-side-menu-item-container',
        cx('fr-p-2w'),
        ...className
      )}
      onClick={onClick}
    >
      <div className={'residue-item-number'}>
        <span
          className={cx(
            ComplianceIcon[residue.compliance],
            'fr-icon--sm',
            'fr-pr-1w'
          )}
        ></span>
        <div className={cx('fr-text--heavy')}>
          Résidu n°{residue.residueNumber}
        </div>
      </div>
      <div className={clsx('residue-item-reference', cx('fr-text--sm'))}>
        {SSD2IdLabel[residue.reference]}
      </div>
    </button>
  );
};

const ResidueItem: FunctionComponent<{
  residue: Residue;
}> = ({ residue, ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div className={clsx(cx('fr-p-3w'), 'residue-detail', 'border-left')}>
      {residue.residueNumber}
      <ResidueResultOverview
        residueIndex={residue.residueNumber}
        residue={residue}
      />
    </div>
  );
};
