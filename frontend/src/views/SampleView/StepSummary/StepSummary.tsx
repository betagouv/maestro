import Accordion from '@codegouvfr/react-dsfr/Accordion';
import React from 'react';
import useWindowSize from 'src/hooks/useWindowSize';

interface Props {
  label: React.ReactNode;
  children: NonNullable<React.ReactNode>;
}

const StepSummary = ({ label, children }: Props) => {
  const { isMobile } = useWindowSize();

  return (
    <>
      {isMobile ? (
        <Accordion
          label={label}
          className="sample-step-summary-accordion"
          classes={{
            collapse: 'sample-step-summary',
          }}
        >
          {children}
        </Accordion>
      ) : (
        <section className="sample-step-summary">
          {label}
          {children}
        </section>
      )}
    </>
  );
};

export default StepSummary;
