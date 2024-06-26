import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import React from 'react';

interface Props {
  title: string | React.ReactNode;
  subtitle: string;
  illustration: string;
  action?: React.ReactNode;
}

const SectionHeader = ({ title, subtitle, illustration, action }: Props) => {
  return (
    <div className="section-header">
      <img src={illustration} height="100%" aria-hidden alt="" />
      <div>
        <h1>{title}</h1>
        <div
          className={cx(
            'fr-text--lg',
            'fr-text--regular',
            'fr-hint-text',
            'fr-mb-0'
          )}
        >
          {subtitle}
        </div>
      </div>
      {action}
    </div>
  );
};

export default SectionHeader;
