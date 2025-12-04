import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import useWindowSize from 'src/hooks/useWindowSize';

export type StepSummaryMode = 'tab' | 'section';

interface Props {
  title: React.ReactNode;
  mode: StepSummaryMode;
  children: NonNullable<React.ReactNode>;
  onEdit?: () => void;
}

const StepSummary = ({ title, mode, onEdit, children }: Props) => {
  const { isMobile } = useWindowSize();

  const editButton = useMemo(
    () =>
      onEdit ? (
        <Button
          onClick={async (e) => {
            e.preventDefault();
            onEdit();
          }}
          size="small"
          priority="secondary"
          iconId="fr-icon-edit-line"
        >
          Corriger
        </Button>
      ) : null,
    [onEdit]
  );

  return (
    <>
      {isMobile && mode === 'section' ? (
        <Accordion
          label={title}
          className="sample-step-summary-accordion"
          classes={{
            collapse: 'sample-step-summary'
          }}
        >
          {editButton}
          {children}
        </Accordion>
      ) : (
        <section className="sample-step-summary">
          {mode === 'section' && (
            <div className={clsx('d-flex-align-center')}>
              <h5 className={clsx(cx('fr-mb-0'), 'flex-grow-1')}>{title}</h5>
              {editButton}
            </div>
          )}
          {children}
        </section>
      )}
    </>
  );
};

export default StepSummary;
