import type { Meta, StoryObj } from '@storybook/react-vite';
import { genAuthUser, genUserListItem } from 'maestro-shared/test/userFixtures';
import { expect, fn, within } from 'storybook/test';
import { UserCard } from './UserCard';

const meta = {
  title: 'Views/Users/UserCard',
  component: UserCard,
  args: {
    user: genUserListItem({}),
    onEdit: fn(),
    onDisable: fn(),
    onEnable: fn(),
    onToggleCertification: fn()
  }
} satisfies Meta<typeof UserCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};

export const SamplerNotCertified: Story = {
  args: {
    user: genUserListItem({ roles: ['Sampler'], certified: false })
  }
};

const myself = genUserListItem({
  roles: ['AdministratorBGIR', 'NationalCoordinator']
});

export const Myself: Story = {
  args: {
    user: myself
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser({ id: myself.id, roles: myself.roles }) }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Vous')).toBeVisible();
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
  }
};
