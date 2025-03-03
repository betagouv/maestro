import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Analysis } from 'maestro-shared/schema/Analysis/Analysis';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { ApiClient } from '../../../../services/apiClient';
import { AnalysisDocumentPreview } from '../../components/AnalysisDocumentPreview';
import '../../SampleView.scss';
import '../SampleDraftAnalysis/SampleDraftAnalysis.scss';

export interface Props {
  sample: Sample;
  analysis: Pick<Analysis, 'reportDocumentId'>;
  apiClient: Pick<
    ApiClient,
    'useGetDocumentQuery' | 'useLazyGetDocumentDownloadSignedUrlQuery'
  >;
  onValidateAnalysis: () => void;
  onCorrectAnalysis: () => void;
}

export const SampleAnalysisReview: FunctionComponent<Props> = ({
  sample,
  analysis,
  apiClient,
  onValidateAnalysis,
  onCorrectAnalysis,
  ...rest
}) => {
  assert<Equals<keyof typeof rest, never>>();

  return (
    <div
      {...rest}
      className={clsx(
        cx('fr-callout', 'fr-callout--green-emeraude'),
        'sample-callout',
        'analysis-container'
      )}
    >
      <AnalysisDocumentPreview
        apiClient={apiClient}
        reportDocumentId={analysis.reportDocumentId}
      />
      <hr />
      <div>
        <h6 className="d-flex-align-center">
          <span
            className={clsx(cx('fr-icon-survey-line', 'fr-mr-1w'), 'icon-grey')}
          ></span>
          <div className="flex-grow-1">Conformité globale de l'échantillon</div>
        </h6>
        <div>
          <span
            className={cx(
              'fr-icon-success-fill',
              'fr-label--success',
              'fr-mr-1w'
            )}
          />
          Échantillon conforme
        </div>
      </div>
      <hr />
      <ButtonsGroup
        inlineLayoutWhen="always"
        buttons={[
          {
            children: "Valider les données et l'interprétation",
            iconId: 'fr-icon-check-line',
            priority: 'primary',
            className: cx('fr-mb-0', 'fr-mt-0'),
            onClick: onValidateAnalysis
          },
          {
            children: 'Corriger',
            iconId: 'fr-icon-edit-line',
            priority: 'secondary',
            className: cx('fr-mb-0', 'fr-mt-0'),
            onClick: onCorrectAnalysis
          }
        ]}
      />
    </div>
  );
};
