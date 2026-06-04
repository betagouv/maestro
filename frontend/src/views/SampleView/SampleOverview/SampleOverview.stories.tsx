import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import {
  DAOAInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  genSampleItem,
  Sample11Fixture,
  SampleDAOA1Fixture
} from 'maestro-shared/test/sampleFixtures';
import {
  DepartmentalCoordinator,
  genAuthUser,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { expect, fn, within } from 'storybook/test';
import { getMockApi } from '../../../services/mockApiClient';
import SampleOverview from './SampleOverview';
import './SampleOverview.scss';

const apiClient = getMockApi({
  useUpdateSampleMutation: [fn(), { isSuccess: false }],
  useUpdateSampleComplianceMutation: [fn(), {}]
});

const meta = {
  title: 'Views/SampleView/SampleOverview',
  component: SampleOverview,
  parameters: {
    apiClient
  }
} satisfies Meta<typeof SampleOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

const COMPLIANCE_TITLE = 'Conformité globale du prélèvement';

const expectComplianceFormVisible = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByText(COMPLIANCE_TITLE)).toHaveLength(2);
};

const expectComplianceFormHidden = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  await expect(canvas.queryByText(COMPLIANCE_TITLE)).not.toBeInTheDocument();
};

export const DAOACompleted: Story = {
  args: {
    sample: {
      ...SampleDAOA1Fixture,
      status: 'Completed' as const,
      region: DepartmentalCoordinator.region,
      items: [
        genSampleItem({
          sampleId: SampleDAOA1Fixture.id,
          itemNumber: 1,
          copyNumber: 1,
          substanceKind: 'Mono',
          analysis: {
            status: 'Completed',
            compliance: true,
            notesOnCompliance: null
          }
        }),
        genSampleItem({
          sampleId: SampleDAOA1Fixture.id,
          itemNumber: 2,
          copyNumber: 1,
          substanceKind: 'Multi',
          analysis: {
            status: 'Completed',
            compliance: true,
            notesOnCompliance: null
          }
        }),
        genSampleItem({
          sampleId: SampleDAOA1Fixture.id,
          itemNumber: 3,
          copyNumber: 1,
          substanceKind: 'Copper',
          analysis: {
            status: 'NotAdmissible',
            compliance: true,
            notesOnCompliance: null
          }
        })
      ]
    } as SampleChecked
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(DepartmentalCoordinator) }
    }
  },
  play: async ({ canvasElement }) => {
    await expectComplianceFormHidden(canvasElement);
  }
};

export const DAOAItemsAchievedStatusInReview: Story = {
  args: {
    sample: {
      ...SampleDAOA1Fixture,
      status: 'InReview' as const,
      region: DepartmentalCoordinator.region,
      items: [
        genSampleItem({
          sampleId: SampleDAOA1Fixture.id,
          itemNumber: 1,
          copyNumber: 1,
          substanceKind: 'Mono',
          analysis: {
            status: 'Completed',
            compliance: true,
            notesOnCompliance: null
          }
        }),
        genSampleItem({
          sampleId: SampleDAOA1Fixture.id,
          itemNumber: 2,
          copyNumber: 1,
          substanceKind: 'Multi',
          analysis: {
            status: 'Completed',
            compliance: false,
            notesOnCompliance: null
          }
        }),
        genSampleItem({
          sampleId: SampleDAOA1Fixture.id,
          itemNumber: 3,
          copyNumber: 1,
          substanceKind: 'Copper',
          analysis: {
            status: 'NotAdmissible',
            compliance: true,
            notesOnCompliance: null
          }
        })
      ]
    } as SampleChecked
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(DepartmentalCoordinator) }
    },
    apiClient: getMockApi({
      useUpdateSampleMutation: [fn(), { isSuccess: false }],
      useUpdateSampleComplianceMutation: [fn(), {}],
      useGetProgrammingPlanQuery: () => ({
        data: DAOAInProgressProgrammingPlanFixture
      })
    })
  },
  play: async ({ canvasElement }) => {
    await expectComplianceFormVisible(canvasElement);
  }
};

export const DAOAItemsNotAchieved: Story = {
  args: {
    sample: {
      ...SampleDAOA1Fixture,
      status: 'InReview' as const,
      region: DepartmentalCoordinator.region,
      items: [
        genSampleItem({
          sampleId: SampleDAOA1Fixture.id,
          itemNumber: 1,
          copyNumber: 1,
          substanceKind: 'Mono',
          analysis: {
            status: 'InReview',
            compliance: true,
            notesOnCompliance: null
          }
        }),
        genSampleItem({
          sampleId: SampleDAOA1Fixture.id,
          itemNumber: 2,
          copyNumber: 1,
          substanceKind: 'Multi',
          analysis: {
            status: 'Completed',
            compliance: true,
            notesOnCompliance: null
          }
        }),
        genSampleItem({
          sampleId: SampleDAOA1Fixture.id,
          itemNumber: 3,
          copyNumber: 1,
          substanceKind: 'Copper',
          analysis: {
            status: 'NotAdmissible',
            compliance: true,
            notesOnCompliance: null
          }
        })
      ]
    } as SampleChecked
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(DepartmentalCoordinator) }
    }
  },
  play: async ({ canvasElement }) => {
    await expectComplianceFormHidden(canvasElement);
  }
};

export const PPV: Story = {
  args: {
    sample: {
      ...Sample11Fixture,
      status: 'InReview' as const,
      region: Sampler1Fixture.region,
      items: [
        genSampleItem({
          sampleId: Sample11Fixture.id,
          copyNumber: 1,
          analysis: {
            status: 'Completed',
            compliance: true,
            notesOnCompliance: null
          }
        })
      ]
    } as SampleChecked
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) }
    },
    apiClient: getMockApi({
      useUpdateSampleMutation: [fn(), { isSuccess: false }],
      useUpdateSampleComplianceMutation: [fn(), {}],
      useGetProgrammingPlanQuery: () => ({
        data: PPVValidatedProgrammingPlanFixture
      })
    })
  },
  play: async ({ canvasElement }) => {
    await expectComplianceFormHidden(canvasElement);
  }
};
