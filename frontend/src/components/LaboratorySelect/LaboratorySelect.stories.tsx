import type { Meta, StoryObj } from '@storybook/react-vite';
import { LaboratoryListFixture } from 'maestro-shared/test/laboratoryFixtures';
import {
  expect,
  fireEvent,
  fn,
  screen,
  userEvent,
  within
} from 'storybook/test';
import { getMockApi } from '../../services/mockApiClient';
import LaboratorySelect from './LaboratorySelect';

const meta = {
  title: 'Components/LaboratorySelect',
  component: LaboratorySelect,
  parameters: {
    apiClient: getMockApi({
      useFindLaboratoriesQuery: { data: LaboratoryListFixture }
    })
  }
} satisfies Meta<typeof LaboratorySelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    programmingPlanId: undefined,
    onSelect: fn()
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('laboratorySelect-input');

    await userEvent.click(input);
    await userEvent.type(input, 'GIRPA');
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Enter' });

    await expect(args.onSelect).toHaveBeenCalled();
  }
};

export const Preselected: Story = {
  args: {
    programmingPlanId: undefined,
    laboratoryId: LaboratoryListFixture[0].id,
    onSelect: fn()
  }
};

export const Readonly: Story = {
  args: {
    programmingPlanId: undefined,
    laboratoryId: LaboratoryListFixture[0].id,
    readonly: true,
    onSelect: fn()
  }
};

export const WithExcludedLaboratories: Story = {
  args: {
    programmingPlanId: undefined,
    // Capinov (index 2) est exclu des choix
    laboratoryIds: [LaboratoryListFixture[2].id],
    onSelect: fn()
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('laboratorySelect-input');

    await userEvent.click(input);
    await userEvent.type(input, LaboratoryListFixture[2].name);

    await expect(screen.queryByText('Aucun laboratoire')).toBeInTheDocument();
  }
};
