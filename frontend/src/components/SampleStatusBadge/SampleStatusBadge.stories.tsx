import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { SampleStatusBadge } from './SampleStatusBadge';

const meta = {
  title: 'Components/SampleStatusBadge',
  component: SampleStatusBadge
} satisfies Meta<typeof SampleStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  args: {
    sample: { ...Sample11Fixture, step: 'Draft', status: 'Draft' }
  }
};

export const CompletedConform: Story = {
  args: {
    sample: {
      ...Sample11Fixture,
      step: 'Sent',
      status: 'Completed',
      compliance: 'Compliant'
    }
  }
};

export const CompletedNonConform: Story = {
  args: {
    sample: {
      ...Sample11Fixture,
      step: 'Sent',
      status: 'Completed',
      compliance: 'NonCompliant'
    }
  }
};
