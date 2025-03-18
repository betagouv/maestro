import { FunctionComponent } from 'react';
import clsx from 'clsx';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import DocumentLink from '../../../components/DocumentLink/DocumentLink';
import { assert, Equals } from 'tsafe';

export type Props = {
  reportDocumentId: string,
  children?: JSX.Element
}

export const AnalysisDocumentPreview: FunctionComponent<Props> = ({reportDocumentId,  children, ..._rest}) => {

  assert<Equals<keyof typeof _rest, never>>()

  return (
    <div>
      <h6 className="d-flex-align-center">
        <span
          className={clsx(
            cx('fr-icon-newspaper-line', 'fr-mr-1w'),
            'icon-grey'
          )}
        ></span>
        <div className="flex-grow-1">Document du rapport d’analyse</div>
        { children }
      </h6>
      <div className={cx('fr-pl-4w')}>
        <DocumentLink documentId={reportDocumentId} />
      </div>
    </div>
  );
}