import clsx from 'clsx';
import {
  FunctionComponent,
  ReactNode,
  useEffect,
  useRef,
  useState
} from 'react';
import { assert, type Equals } from 'tsafe';

import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ClassValue } from 'clsx/clsx';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import {
  PartialResidue,
  ResidueLmrCheck
} from 'maestro-shared/schema/Analysis/Residue/Residue';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { ResidueComplianceIcon } from './ResidueComplianceIcon';
import './ResidueListResult.scss';

type Props = {
  residues: (PartialResidue & Omit<Sample, 'reference'>)[];
  residuePanel: (i: number) => ReactNode;
  onAddResidue?: () => void;
};

export const ResidueListResult: FunctionComponent<Props> = ({
  residues,
  residuePanel,
  onAddResidue,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const oldResiduesLength = useRef(residues.length);

  useEffect(() => {
    if (oldResiduesLength.current < residues.length) {
      setSelectedIndex(residues.length - 1);
    } else if (oldResiduesLength.current > residues.length) {
      setSelectedIndex(0);
    }
    oldResiduesLength.current = residues.length;
  }, [residues]);

  return (
    <div className={clsx('residue-list-container', 'border')}>
      <div className={clsx('residues-side-menu')}>
        {residues.map((r, i) => (
          <ResidueMenuItem
            key={`${r.reference}_${i}`}
            residue={r}
            residueIndex={i + 1}
            className={[selectedIndex === i ? 'current-residue' : undefined]}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
        {onAddResidue ? (
          <button
            className={clsx(
              'residues-side-menu-item-container',
              'border-bottom',
              'd-flex-align-center',
              cx('fr-p-2w')
            )}
            onClick={onAddResidue}
          >
            <span
              className={clsx(
                cx('fr-icon-add-line', 'fr-icon--sm', 'fr-pr-1w')
              )}
            ></span>
            <div className={cx('fr-text--md', 'fr-m-0', 'fr-text--bold')}>
              Ajouter un résidu
            </div>
          </button>
        ) : null}
      </div>
      <div className={clsx(cx('fr-p-3w'), 'residue-detail', 'border-left')}>
        {residuePanel(selectedIndex)}
      </div>
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

  const hasIssue = !ResidueLmrCheck.safeParse(residue).success;

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
      {hasIssue && (
        <div
          className={clsx(
            'residue-item-reference',
            cx('fr-text--sm', 'fr-m-0', 'fr-label--error')
          )}
        >
          Incomplet
        </div>
      )}
    </button>
  );
};
