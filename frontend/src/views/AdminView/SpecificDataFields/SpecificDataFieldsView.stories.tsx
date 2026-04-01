import type { Meta, StoryObj } from '@storybook/react-vite';
import { getMockApi } from '../../../services/mockApiClient';
import { SpecificDataFieldsView } from './SpecificDataFieldsView';
import { storyFields, storySachaFields } from './storyFixtures';

const meta = {
  title: 'Views/SpecificDataFields/SpecificDataFieldsView',
  component: SpecificDataFieldsView,
  parameters: {
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
