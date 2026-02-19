import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import React from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import './SectionHeader.scss';

interface Props {
  title: string | React.ReactNode;
  subtitle: string;
  illustration: string;
  action?: React.ReactNode;
}

const SectionHeader = ({ title, subtitle, illustration, action }: Props) => {
  const { isDesktop } = useWindowSize();
  return (
    <div className="section-header">
      {isDesktop && <img src={illustration} height="100%" aria-hidden alt="" />}
      <div style={{ flex: 1 }}>
        <h1 className={clsx('fr-mb-0')}>{title}</h1>
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
