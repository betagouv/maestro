import type { Meta, StoryObj } from '@storybook/react-vite';
import { genAuthUser, genUserListItem } from 'maestro-shared/test/userFixtures';
import { expect, userEvent, within } from 'storybook/test';
import { getMockApi } from '../../services/mockApiClient';
import { UserListView } from './UserListView';

const authUser = genAuthUser({ roles: ['AdministratorMaestro'] });
const myself = genUserListItem({ ...authUser.user, name: 'Marie Moi' });
const userList = Array.from(Array(10).keys()).map(() => genUserListItem({}));
const meta = {
  title: 'Views/Users',
  component: UserListView,
  parameters: {
    preloadedState: {
      auth: { authUser }
    },
    apiClient: getMockApi({
      useFindUsersQuery: {
        data: [...userList, myself]
      }
    })
  }
} satisfies Meta<typeof UserListView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByTestId(`user-edit-button-${userList[0].id}`)
    );
    await userEvent.click(canvas.getByText('Enregistrer'));
    await userEvent.click(canvas.getByText('Ajouter un utilisateur'));

    //@ts-expect-error ...
    const dialog = within(canvasElement.querySelector('#user-form-modale-id'));
    await expect(dialog.getByTestId('user-form-role-select')).toHaveValue('');

    await userEvent.click(dialog.getByText('Annuler'));
  }
};

export const MyselfFirst: Story = {
  play: async ({ canvasElement }) => {
    const [firstCard] = canvasElement.querySelectorAll('.user-list-item-card');
    const card = within(firstCard as HTMLElement);

    await expect(card.getByText('Marie Moi')).toBeVisible();
    await expect(card.getByText('Vous')).toBeVisible();
    await expect(card.queryAllByRole('button')).toHaveLength(0);
  }
};
