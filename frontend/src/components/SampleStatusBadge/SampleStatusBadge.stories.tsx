import type { Meta, StoryObj } from '@storybook/react-vite';
import { genCreatedSample } from 'maestro-shared/test/sampleFixtures';
import { SampleStatusBadge } from './SampleStatusBadge';

const meta = {
  title: 'Components/SampleStatusBadge',
  component: SampleStatusBadge
} satisfies Meta<typeof SampleStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  args: {
    sample: genCreatedSample({ step: 'Draft', status: 'Draft' })
  }
};

export const CompletedConform: Story = {
  args: {
    sample: genCreatedSample({
      step: 'Sent',
      status: 'Completed',
      compliance: 'Compliant'
    })
  }
};

export const CompletedNonConform: Story = {
  args: {
    sample: genCreatedSample({
      step: 'Sent',
      status: 'Completed',
      compliance: 'NonCompliant'
    })
  }
};
