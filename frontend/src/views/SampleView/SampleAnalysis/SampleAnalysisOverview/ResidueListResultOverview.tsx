import clsx from 'clsx';
import { FunctionComponent, useState } from 'react';
import { assert, type Equals } from 'tsafe';

import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ClassValue } from 'clsx/clsx';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { ResidueComplianceIcon } from './ResidueComplianceIcon';
import './ResidueListResultOverview.scss';
import { ResidueResultOverview } from './ResidueResultOverview';

type Props = {
  residues: PartialResidue[];
};

export const ResidueListResultOverview: FunctionComponent<Props> = ({
  residues,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [selectedResidue, setSelectedResidue] = useState<PartialResidue>(
    residues[0]
  );

  return (
    <div className={clsx('residue-list-container', 'border')}>
      <div className={clsx('residues-side-menu')}>
        {residues.map((r, i) => (
          <ResidueMenuItem
            key={r.reference}
            residue={r}
            residueIndex={i + 1}
            className={[
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
  residue: PartialResidue;
  residueIndex: number;
  className: ClassValue[];
  onClick: () => void;
}> = ({ residue, residueIndex, className, onClick, ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <button
      className={clsx(
        'residues-side-menu-item-container',
        'border-bottom',
        cx('fr-p-2w'),
        ...className
      )}
      onClick={onClick}
    >
      <div className={'residue-item-number'}>
        {residue.compliance && (
          <ResidueComplianceIcon
            compliance={residue.compliance}
            className={['fr-pr-1w']}
          />
        )}

        <div className={cx('fr-text--heavy')}>Résidu n°{residueIndex}</div>
      </div>
      <div
        className={clsx('residue-item-reference', cx('fr-text--sm', 'fr-m-0'))}
      >
        {residue.reference ? SSD2IdLabel[residue.reference] : null}
      </div>
    </button>
  );
};

const ResidueItem: FunctionComponent<{
  residue: PartialResidue;
}> = ({ residue, ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div className={clsx(cx('fr-p-3w'), 'residue-detail', 'border-left')}>
      <ResidueResultOverview residue={residue} />
    </div>
  );
};
