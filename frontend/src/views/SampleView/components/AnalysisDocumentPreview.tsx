import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import React, { FunctionComponent, useContext } from 'react';
import { assert, Equals } from 'tsafe';
import DocumentLink from '../../../components/DocumentLink/DocumentLink';
import { ApiClientContext } from '../../../services/apiClient';

type Props = {
  analysisId: string;
  children?: React.JSX.Element;
};

export const AnalysisDocumentPreview: FunctionComponent<Props> = ({
  analysisId,
  children,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { useGetAnalysisReportDocumentIdsQuery } = useContext(ApiClientContext);

  const { data: reportDocumentIds } =
    useGetAnalysisReportDocumentIdsQuery(analysisId);
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
      {reportDocumentIds && (
        <div className={cx('fr-pl-4w')}>
          {reportDocumentIds.length === 1 ? (
            <DocumentLink documentId={reportDocumentIds[0]} />
          ) : (
            <div
              className={'d-flex-align-start'}
              style={{ flexDirection: 'column' }}
            >
              <span className={cx('fr-text--sm', 'fr-text--bold')}>
                Dernière version du rapport
              </span>
              <span>
                <DocumentLink documentId={reportDocumentIds[0]} />
              </span>
              <div
                className={clsx('border-middle', cx('fr-mx-0', 'fr-mb-2w'))}
                style={{ width: '100%' }}
              ></div>
              <span className={cx('fr-text--sm', 'fr-text--bold')}>
                Historique des rapports téléversés
              </span>
              {reportDocumentIds.map((id, index) => {
                if (index === 0) {
                  return null;
                }
                return (
                  <span>
                    <DocumentLink documentId={id} />
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
