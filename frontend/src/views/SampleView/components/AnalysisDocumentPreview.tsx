import { FunctionComponent } from 'react';
import clsx from 'clsx';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import DocumentLink from '../../../components/DocumentLink/DocumentLink';
import { ApiClient } from '../../../services/apiClient';
import { assert, Equals } from 'tsafe';

export type Props = {
  reportDocumentId: string,
  apiClient: Pick<ApiClient, 'useGetDocumentQuery' | 'useLazyGetDocumentDownloadSignedUrlQuery'>
  children?: JSX.Element
}

export const AnalysisDocumentPreview: FunctionComponent<Props> = ({reportDocumentId, apiClient, children, ...rest}) => {

  assert<Equals<keyof typeof rest, never>>()
  return (
    <div {...rest}>
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
        <DocumentLink documentId={reportDocumentId} apiClient={apiClient} />
      </div>
    </div>
  );
}