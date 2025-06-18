import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import React, { FunctionComponent } from 'react';
import { assert, Equals } from 'tsafe';
import DocumentLink from '../../../components/DocumentLink/DocumentLink';

type Props = {
  reportDocumentId: string;
  children?: React.JSX.Element;
};

export const AnalysisDocumentPreview: FunctionComponent<Props> = ({
  reportDocumentId,
  children,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div className={clsx(cx('fr-py-4w', 'fr-px-5w'), 'border')}>
      <h6 className="d-flex-align-center">
        <span
          className={clsx(
            cx('fr-icon-newspaper-line', 'fr-mr-1w'),
            'icon-grey'
          )}
        ></span>
        <div className="flex-grow-1">Document du rapport d’analyse</div>
        {children}
      </h6>
      <div className={cx('fr-pl-4w')}>
        <DocumentLink documentId={reportDocumentId} />
      </div>
    </div>
  );
};
