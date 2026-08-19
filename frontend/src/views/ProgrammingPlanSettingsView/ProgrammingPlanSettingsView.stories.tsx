import type { Meta, StoryObj } from '@storybook/react-vite';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { genAuthUser } from 'maestro-shared/test/userFixtures';
import { expect, userEvent, within } from 'storybook/test';
import { getMockApi } from '../../services/mockApiClient';
import { ProgrammingPlanSettingsView } from './ProgrammingPlanSettingsView';

const years = [2024, 2025, 2026];

const meta = {
  title: 'Views/ProgrammingPlanSettings',
  component: ProgrammingPlanSettingsView,
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser({ userRole: 'AdministratorMaestro' }) }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: years.map((year) => genProgrammingPlan({ year }))
      }
    })
  }
} satisfies Meta<typeof ProgrammingPlanSettingsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('2026')).toBeInTheDocument();

    await userEvent.click(canvas.getByText('2026'));
    await userEvent.click(await canvas.findByText('2024'));

    await expect(canvas.getByText('2024')).toBeInTheDocument();
  }
};
