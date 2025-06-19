import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  Sampler1Fixture,
  SamplerAndNationalObserver
} from 'maestro-shared/test/userFixtures';
import { DepartmentsSelect } from './DepartmentsSelect';

const meta = {
  title: 'Components/DepartmentsSelect',
  component: DepartmentsSelect,
  args: { onSelect: fn() }
} satisfies Meta<typeof DepartmentsSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: { authUser: { user: Sampler1Fixture } }
    }
  }
};
export const National: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: { authUser: { user: SamplerAndNationalObserver } }
    }
  }
};
