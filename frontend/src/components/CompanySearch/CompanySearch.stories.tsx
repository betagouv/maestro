import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { getMockApi } from '../../services/mockApiClient';
import CompanySearch from './CompanySearch';

const meta = {
  title: 'Components/CompanySearch',
  component: CompanySearch,
  parameters: {
    apiClient: getMockApi({
      useLazySearchCompaniesQuery: [
        [
          {
            siren: '',
            nom_complet: 'Test 1',
            siege: {
              activite_principale: '',
              adresse: '',
              code_postal: '',
              commune: '',
              departement: '',
              libelle_commune: '',
              region: '',
              siret: ''
            },
            activite_principale: ''
          }
        ],
        {}
      ]
    })
  }
} satisfies Meta<typeof CompanySearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSelectCompany: fn()
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByTestId('companySearch-input');
    await userEvent.click(select);
    await userEvent.type(select, 'test1');

    await fireEvent.keyDown(select, { key: 'ArrowDown' });
    await fireEvent.keyDown(select, { key: 'Enter' });

    await expect(canvas.queryByText('- Test 1')).toBeInTheDocument();
  }
};

export const Error: Story = {
  args: {
    onSelectCompany: fn()
  },
  parameters: {
    apiClient: getMockApi({
      useLazySearchCompaniesQuery: [[], { isError: true }]
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByText(
        `L'API Recherche d'entreprises semble inaccessible. Veuillez réessayer ultérieurement.`
      )
    ).toBeInTheDocument();
  }
};
