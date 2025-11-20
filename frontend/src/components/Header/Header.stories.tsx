import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionList } from 'maestro-shared/referential/Region';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { genAuthUser } from 'maestro-shared/test/userFixtures';
import { expect, fn, within } from 'storybook/test';
import { MuiDsfrThemeProvider } from '../../App';
import { getMockApi } from '../../services/mockApiClient';
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
    year: new Date().getFullYear() - 1,
    closedAt: new Date()
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

export const programmingPlans = [
  closedProgrammingPlan,
  validatedProgrammingPlan,
  inProgressProgrammingPlan
];

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

export const NationalCoordinator: Story = {
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
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: programmingPlans
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
      within(navigation).getByText('Documents ressources')
    ).toBeInTheDocument();

    await expect(
      within(navigation).queryByText('Utilisateurs')
    ).not.toBeInTheDocument();

    await expect(
      within(navigation).queryByText('Administration')
    ).not.toBeInTheDocument();

    const historyMenu = within(navigation).getByText('Historique');
    await expect(historyMenu).toBeInTheDocument();
  }
};

export const Administrator: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          role: 'Administrator'
        })
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: programmingPlans
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
      within(navigation).getByText('Documents ressources')
    ).toBeInTheDocument();

    await expect(
      within(navigation).getByText('Utilisateurs')
    ).toBeInTheDocument();

    await expect(
      within(navigation).getByText('Administration')
    ).toBeInTheDocument();

    const historyMenu = within(navigation).getByText('Historique');
    await expect(historyMenu).toBeInTheDocument();
  }
};

export const LaboratoryUser: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          role: 'LaboratoryUser'
        })
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: programmingPlans
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
      within(navigation).queryByText('Prélèvements')
    ).not.toBeInTheDocument();

    const programmingPlanMenu = within(navigation).queryByText('Programmation');
    await expect(programmingPlanMenu).not.toBeInTheDocument();

    await expect(
      within(navigation).queryByText('Documents ressources')
    ).not.toBeInTheDocument();

    await expect(
      within(navigation).queryByText('Utilisateurs')
    ).not.toBeInTheDocument();

    await expect(
      within(navigation).queryByText('Administration')
    ).not.toBeInTheDocument();

    const historyMenu = within(navigation).queryByText('Historique');
    await expect(historyMenu).not.toBeInTheDocument();
  }
};
