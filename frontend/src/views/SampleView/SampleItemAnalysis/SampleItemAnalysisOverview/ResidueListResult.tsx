import clsx from 'clsx';
import {
  FunctionComponent,
  ReactNode,
  useEffect,
  useRef,
  useState
} from 'react';
import { assert, type Equals } from 'tsafe';

import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ClassValue } from 'clsx/lite';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import {
  PartialResidue,
  ResidueLmrChecked
} from 'maestro-shared/schema/Analysis/Residue/Residue';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import useWindowSize from '../../../../hooks/useWindowSize';
import { ResidueComplianceIcon } from './ResidueComplianceIcon';
import './ResidueListResult.scss';

type Props = {
  residues: (PartialResidue & Omit<SampleChecked, 'reference'>)[];
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

  const { isDesktop } = useWindowSize();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const oldResiduesLength = useRef(residues.length);
  const container = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (oldResiduesLength.current < residues.length) {
      selectResidueAndScrollToTop(residues.length - 1);
    } else if (oldResiduesLength.current > residues.length) {
      selectResidueAndScrollToTop(0);
    }
    oldResiduesLength.current = residues.length;
  }, [residues]);

  const selectResidueAndScrollToTop = (newIndex: number) => {
    setSelectedIndex(newIndex);
    setTimeout(() => {
      container.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  return isDesktop ? (
    <div className={clsx('residue-list-container', 'border')} ref={container}>
      <div className={clsx('residues-side-menu')}>
        {residues.map((r, i) => (
          <ResidueMenuItem
            key={`${r.reference}_${i}`}
            residue={r}
            residueIndex={i + 1}
            className={[selectedIndex === i ? 'current-residue' : undefined]}
            onClick={() => selectResidueAndScrollToTop(i)}
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
      <div className={clsx('border-left', 'residue-detail')}>
        <div className={clsx(cx('fr-p-3w'), 'border-bottom')}>
          {residuePanel(selectedIndex)}
        </div>
        {residues.length > 1 && (
          <div className={clsx(cx('fr-p-3w'), 'd-flex-align-center')}>
            {selectedIndex !== 0 && (
              <Button
                priority={'tertiary no outline'}
                iconId={'fr-icon-arrow-left-s-line'}
                onClick={() => {
                  selectResidueAndScrollToTop(selectedIndex - 1);
                }}
              >
                Résidu n°{selectedIndex}
              </Button>
            )}
            {selectedIndex !== residues.length - 1 && (
              <Button
                priority={'tertiary no outline'}
                iconId={'fr-icon-arrow-right-s-line'}
                iconPosition={'right'}
                className={clsx(cx('fr-ml-auto'))}
                onClick={() => {
                  selectResidueAndScrollToTop(selectedIndex + 1);
                }}
              >
                Résidu n°{selectedIndex + 2}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  ) : (
    <>
      {residues.map((r, i) => (
        <div
          key={`${r.reference}_${i}`}
          className={clsx(cx('fr-p-3w'), 'residue-detail', 'border')}
        >
          {residuePanel(i)}
        </div>
      ))}
      {onAddResidue ? (
        <Button
          className={clsx()}
          onClick={onAddResidue}
          priority={'secondary'}
        >
          Ajouter un résidu
        </Button>
      ) : null}
    </>
  );
};

const ResidueMenuItem: FunctionComponent<{
  residue: PartialResidue;
  residueIndex: number;
  className: ClassValue[];
  onClick: () => void;
}> = ({ residue, residueIndex, className, onClick, ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  const hasIssue = !ResidueLmrChecked.safeParse(residue).success;

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
