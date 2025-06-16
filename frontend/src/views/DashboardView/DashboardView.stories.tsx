import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { RegionList } from 'maestro-shared/referential/Region';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genAuthUser,
  Region1Fixture,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { ApiClient } from '../../services/apiClient';
import {
  defaultMockApiClientConf,
  getMockApi
} from '../../services/mockApiClient';
import DashboardView from './DashboardView';

const meta = {
  title: 'Views/DashboardView',
  component: DashboardView,
  args: { onSelect: fn() },
  decorators: [(Story) => <Story />]
} satisfies Meta<typeof DashboardView>;

export default meta;
type Story = StoryObj<typeof meta>;

const validatedProgrammingPlan = genProgrammingPlan({
  year: new Date().getFullYear(),
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'Validated'
  })),
  contexts: ['Control', 'Surveillance']
});

export const DashboardViewForSampler: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          role: 'Sampler',
          region: Region1Fixture,
          id: Sampler1Fixture.id
        })
      }
    },
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useGetProgrammingPlanByYearQuery: {
        data: validatedProgrammingPlan
      }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Tableau de bord')).toBeInTheDocument();
    await expect(
      canvas.getByText(`Plan de contrôle ${new Date().getFullYear()}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(`Plan de surveillance ${new Date().getFullYear()}`)
    ).toBeInTheDocument();
  }
};
