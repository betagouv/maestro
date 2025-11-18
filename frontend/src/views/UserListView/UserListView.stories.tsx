import type { Meta, StoryObj } from '@storybook/react-vite';
import { genUser } from 'maestro-shared/test/userFixtures';
import { expect, userEvent, within } from 'storybook/test';
import { getMockApi } from '../../services/mockApiClient';
import { UserListView } from './UserListView';

const userList = Array.from(Array(10).keys()).map(() => genUser({}));
const meta = {
  title: 'Views/Users',
  component: UserListView,
  parameters: {
    apiClient: getMockApi({
      useFindUsersQuery: {
        data: userList
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
