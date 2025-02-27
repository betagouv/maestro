import type { Meta, StoryObj } from '@storybook/react';

import { Document } from 'maestro-shared/schema/Document/Document';
import { AnalysisDocumentPreview } from './AnalysisDocumentPreview';

const meta: Meta<typeof AnalysisDocumentPreview> = {
  title: 'Views/AnalysisDocumentPreview',
  component: AnalysisDocumentPreview
};

export default meta;
type Story = StoryObj<typeof meta>;

const document: Document = {
  createdAt: new Date(12345),
  createdBy: 'Storybook',
  id: '',
  kind: 'AnalysisRequestDocument',
  filename: 'analyses.pdf'
};

export const Default: Story = {
  args: {
    reportDocumentId: 'fakeDocumentId',
    apiClient: {
      useGetDocumentQuery: (_documentId) => {
        return {
          data: document
        };
      },
      useLazyGetDocumentDownloadSignedUrlQuery: () => [() => ({ unwrap: async () => 'https://maestro.beta.gouv.fr'})]
    }
  }
};
