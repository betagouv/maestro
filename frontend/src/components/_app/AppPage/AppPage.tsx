import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import type React from 'react';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { assert, type Equals } from 'tsafe';

interface Props {
  title: string | React.ReactNode;
  subtitle: string;
  illustration: string;
  documentTitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const AppPage = ({
  title,
  subtitle,
  illustration,
  documentTitle,
  action,
  children,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  useDocumentTitle(documentTitle);

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        illustration={illustration}
        action={action}
      />
      {children}
    </section>
  );
};
