import type { Meta, StoryObj } from '@storybook/react-vite';
import { genAuthUser } from 'maestro-shared/test/userFixtures';
import { expect, within } from 'storybook/test';
import { getMockApi } from '../../../services/mockApiClient';
import { SpecificDataFieldsView } from './SpecificDataFieldsView';
import { storyFields, storySachaFields } from './storyFixtures';

const meta = {
  title: 'Views/SpecificDataFields/SpecificDataFieldsView',
  component: SpecificDataFieldsView,
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser({ userRole: 'AdministratorMaestro' }) }
    },
    apiClient: getMockApi({
      useFindAllFieldConfigsQuery: { data: storyFields },
      useFindSachaFieldConfigsQuery: { data: storySachaFields }
    })
  }
} satisfies Meta<typeof SpecificDataFieldsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: {
    apiClient: getMockApi({
      useFindAllFieldConfigsQuery: { data: [] },
      useFindSachaFieldConfigsQuery: { data: [] }
    })
  }
};

export const ConfigurationIncomplete: Story = {
  parameters: {
    apiClient: getMockApi({
      useFindAllFieldConfigsQuery: { data: storyFields },
      useFindSachaFieldConfigsQuery: {
        data: [
          { ...storySachaFields[0], inDai: true, sachaCommemoratifSigle: null }
        ]
      }
    })
  }
};

export const ReadOnlyForNationalCoordinator: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser({ userRole: 'NationalCoordinator' }) }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByText('Importer le nouveau référentiel Sacha')
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByTitle('Ajouter un descripteur')
    ).not.toBeInTheDocument();
    await expect(canvas.queryAllByTitle('Supprimer')).toHaveLength(0);
  }
};
