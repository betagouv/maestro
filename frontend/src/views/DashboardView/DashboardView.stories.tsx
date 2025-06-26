import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionList } from 'maestro-shared/referential/Region';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genAuthUser,
  NationalCoordinator,
  Region1Fixture,
  RegionalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { expect, fn, within } from 'storybook/test';
import { ApiClient } from '../../services/apiClient';
import {
  defaultMockApiClientConf,
  getMockApi
} from '../../services/mockApiClient';
import DashboardView from './DashboardView';

const meta = {
  title: 'Views/DashboardView',
  component: DashboardView,
  args: { onSelect: fn() }
} satisfies Meta<typeof DashboardView>;

export default meta;
type Story = StoryObj<typeof meta>;

const useGetProgrammingPlanByYearQueryMock = (year: number) => ({
  data:
    year === new Date().getFullYear() - 1
      ? genProgrammingPlan({
          year,
          regionalStatus: RegionList.map((region) => ({
            region,
            status: 'Validated'
          })),
          contexts: ['Control', 'Surveillance']
        })
      : genProgrammingPlan({
          year,
          regionalStatus: RegionList.map((region) => ({
            region,
            status: 'InProgress'
          })),
          contexts: ['Control', 'Surveillance']
        })
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
      useGetProgrammingPlanByYearQuery: useGetProgrammingPlanByYearQueryMock
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

export const DashboardViewForRegionalCoordinator: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          role: 'RegionalCoordinator',
          id: RegionalCoordinator.id
        })
      }
    },
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useGetProgrammingPlanByYearQuery: useGetProgrammingPlanByYearQueryMock
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
    ).not.toBeInTheDocument();

    await expect(
      canvas.queryByTestId('close-programming-plan-button')
    ).not.toBeInTheDocument();
  }
};

export const DashboardViewForNationalCoordinator: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          role: 'NationalCoordinator',
          id: NationalCoordinator.id
        })
      }
    },
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useGetProgrammingPlanByYearQuery: useGetProgrammingPlanByYearQueryMock
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

    await expect(
      canvas.getByTestId('close-programming-plan-button')
    ).toBeInTheDocument();
  }
};
