import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { RegionList } from 'maestro-shared/referential/Region';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { genAuthUser } from 'maestro-shared/test/userFixtures';
import { undefined } from 'zod';
import { MuiDsfrThemeProvider } from '../../App';
import { ApiClient } from '../../services/apiClient';
import {
  defaultMockApiClientConf,
  getMockApi
} from '../../services/mockApiClient';
import Header from './Header';

const meta = {
  title: 'Components/Header',
  component: Header,
  args: { onSelect: fn() },
  decorators: [
    (Story) => (
      <MuiDsfrThemeProvider>
        <Story />
      </MuiDsfrThemeProvider>
    )
  ]
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

const closedProgrammingPlan = {
  ...genProgrammingPlan({
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'Closed'
    })),
    year: new Date().getFullYear() - 1
  })
};
const validatedProgrammingPlan = {
  ...genProgrammingPlan({
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'Validated'
    })),
    year: new Date().getFullYear()
  })
};
const inProgressProgrammingPlan = {
  ...genProgrammingPlan({
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'InProgress'
    })),
    year: new Date().getFullYear() + 1
  })
};

export const NotAuthenticated: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: { authUser: undefined }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText('Prélèvements')).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Documents ressources')
    ).not.toBeInTheDocument();
  }
};

export const Authenticated: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          role: 'NationalCoordinator'
        })
      }
    },
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useFindProgrammingPlansQuery: {
        data: [
          closedProgrammingPlan,
          validatedProgrammingPlan,
          inProgressProgrammingPlan
        ]
      }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole('navigation');

    await expect(navigation).toBeInTheDocument();

    await expect(
      within(navigation).getByText('Tableau de bord')
    ).toBeInTheDocument();

    await expect(
      within(navigation).getByText('Prélèvements')
    ).toBeInTheDocument();

    const programmingPlanMenu = within(navigation).getByText('Programmation');
    await expect(programmingPlanMenu).toBeInTheDocument();
    await expect(
      within(programmingPlanMenu.parentElement as HTMLElement).queryByText(
        `Campagne ${closedProgrammingPlan.year}`
      )
    ).not.toBeInTheDocument();
    await expect(
      within(programmingPlanMenu.parentElement as HTMLElement).getByText(
        `Campagne ${validatedProgrammingPlan.year}`
      )
    ).toBeInTheDocument();
    await expect(
      within(programmingPlanMenu.parentElement as HTMLElement).getByText(
        `Campagne ${inProgressProgrammingPlan.year}`
      )
    ).toBeInTheDocument();

    await expect(
      within(navigation).getByText('Documents ressources')
    ).toBeInTheDocument();

    const historyMenu = within(navigation).getByText('Historique');
    await expect(historyMenu).toBeInTheDocument();
  }
};
