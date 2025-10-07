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
            siren: '12341234123421341234',
            nom_complet: 'Test 1',
            siege: {
              activite_principale: '62.02A',
              adresse: '12 RTE DE BEAUREGARD 21500 MONTVAL',
              code_postal: '21500',
              commune: '',
              departement: '',
              numero_voie: '12',
              type_voie: 'RUE',
              libelle_voie: 'DE BEAUREGARD',
              libelle_commune: 'MONTVAL',
              region: '',
              siret: '1234123412342134'
            },
            activite_principale: '01.15Z'
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

    await expect(
      canvas.queryByText('Test 1 • 1234123412342134')
    ).toBeInTheDocument();
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
