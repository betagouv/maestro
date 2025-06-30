import type { Meta, StoryObj } from '@storybook/react-vite';

import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ApiClient } from '../../../services/apiClient';
import {
  defaultMockApiClientConf,
  getMockApi
} from '../../../services/mockApiClient';
import { AnalysisDocumentPreview } from './AnalysisDocumentPreview';

const meta = {
  title: 'Views/AnalysisDocumentPreview',
  component: AnalysisDocumentPreview,
  args: {
    analysisId: 'fakeAnalysisId',
    sampleId: 'fakeAnalysisId',
    readonly: true
  }
} satisfies Meta<typeof AnalysisDocumentPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NotReadonly: Story = {
  args: {
    readonly: false,
    button: (
      <Button
        priority="secondary"
        iconId="fr-icon-add-line"
        className={cx('fr-mt-0')}
        size="small"
        onClick={() => {}}
      >
        Ajouter
      </Button>
    )
  }
};

export const WithHistory: Story = {
  parameters: {
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useGetAnalysisReportDocumentIdsQuery: {
        data: ['document1Id', 'document2Id', 'document3Id']
      }
    })
  }
};
