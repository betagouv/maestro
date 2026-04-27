import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AnalysisDaiId } from 'maestro-shared/schema/AnalysisDai/AnalysisDai';
import type { AnalysisDaiAnalysisGroup } from 'maestro-shared/schema/AnalysisDai/AnalysisDaiAnalysisGroup';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import { fn } from 'storybook/test';
import { v4 as uuidv4 } from 'uuid';
import { getMockApi } from '../../../../services/mockApiClient';
import { AnalysisDaiHistory } from './AnalysisDaiHistory';

const sampleId = uuidv4();
const analysisId = uuidv4();
const analysisId2 = uuidv4();

const groupPending: AnalysisDaiAnalysisGroup = {
  analysisId,
  sample: { id: sampleId, reference: 'GES-08-24-313-A' },
  analysis: { itemNumber: 1, copyNumber: 1 },
  sampleItem: { substanceKind: 'Multi' },
  laboratory: LaboratoryFixture,
  latestAttemptAt: new Date('2025-03-10T09:00:00'),
  attempts: [
    {
      id: uuidv4() as AnalysisDaiId,
      analysisId,
      createdAt: new Date('2025-03-10T09:00:00'),
      state: 'PENDING',
      documents: []
    }
  ]
};

const groupWithMultipleAttempts: AnalysisDaiAnalysisGroup = {
  analysisId: analysisId2,
  sample: { id: sampleId, reference: 'GES-08-24-313-A' },
  analysis: { itemNumber: 1, copyNumber: 1 },
  sampleItem: { substanceKind: 'Multi' },
  laboratory: LaboratoryFixture,
  latestAttemptAt: new Date('2025-03-12T14:00:00'),
  attempts: [
    {
      id: uuidv4() as AnalysisDaiId,
      analysisId: analysisId2,
      createdAt: new Date('2025-03-11T10:30:00'),
      state: 'ERROR',
      message: 'Connexion SFTP échouée : timeout après 30s',
      sentMethod: 'EMAIL',
      edi: true,
      sentAt: new Date('2025-03-11T10:31:00'),
      documents: []
    },
    {
      id: uuidv4() as AnalysisDaiId,
      analysisId: analysisId2,
      createdAt: new Date('2025-03-12T14:00:00'),
      state: 'SENT',
      sentMethod: 'SFTP',
      edi: true,
      sentAt: new Date('2025-03-12T14:01:00'),
      documents: [
        {
          id: uuidv4(),
          filename: 'rapport-analyse.pdf',
          kind: 'AnalysisReportDocument'
        },
        {
          id: uuidv4(),
          filename: 'certificat-conformite.pdf',
          kind: 'AnalysisReportDocument'
        }
      ]
    }
  ]
};

const groupError: AnalysisDaiAnalysisGroup = {
  analysisId: uuidv4(),
  sample: { id: sampleId, reference: 'GES-08-24-313-A' },
  analysis: { itemNumber: 2, copyNumber: 1 },
  sampleItem: { substanceKind: 'Mono' },
  laboratory: LaboratoryFixture,
  latestAttemptAt: new Date('2025-03-11T10:30:00'),
  attempts: [
    {
      id: uuidv4() as AnalysisDaiId,
      analysisId: uuidv4(),
      createdAt: new Date('2025-03-11T10:30:00'),
      state: 'ERROR',
      message: 'Connexion SFTP échouée : timeout après 30s',
      sentMethod: 'EMAIL',
      edi: null,
      sentAt: new Date('2025-03-11T10:31:00'),
      documents: []
    }
  ]
};

const meta = {
  title: 'Views/SampleView/AnalysisDaiHistory',
  component: AnalysisDaiHistory,
  args: {
    analyses: [],
    showSampleReference: false
  }
} satisfies Meta<typeof AnalysisDaiHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    analyses: []
  },
  parameters: {
    apiClient: getMockApi({
      useCreateAnalysisDaiMutation: [fn(), {}]
    })
  }
};

export const WithRows: Story = {
  args: {
    analyses: [groupPending, groupWithMultipleAttempts]
  },
  parameters: {
    apiClient: getMockApi({
      useCreateAnalysisDaiMutation: [fn(), {}]
    })
  }
};

export const WithSampleReference: Story = {
  args: {
    analyses: [groupWithMultipleAttempts, groupError],
    showSampleReference: true
  },
  parameters: {
    apiClient: getMockApi({
      useCreateAnalysisDaiMutation: [fn(), {}]
    })
  }
};

export const RetrySuccess: Story = {
  args: {
    analyses: [groupError]
  },
  parameters: {
    apiClient: getMockApi({
      useCreateAnalysisDaiMutation: [fn(), { isSuccess: true }]
    })
  }
};
