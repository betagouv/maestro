import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import SampleCard from './SampleCard';

const meta = {
  title: 'Components/SampleCard',
  component: SampleCard
} satisfies Meta<typeof SampleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sample: Sample11Fixture
  }
};
