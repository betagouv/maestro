import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionList } from 'maestro-shared/referential/Region';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import type { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import {
  genProgrammingPlan,
  genProgrammingPlanDomain,
  genProgrammingSubPlan
} from 'maestro-shared/test/programmingPlanFixtures';
import { genAuthUser } from 'maestro-shared/test/userFixtures';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { getMockApi } from '../../services/mockApiClient';
import { ProgrammingPlanSettingsView } from './ProgrammingPlanSettingsView';

const regionalStatus = (status: ProgrammingPlanStatus) =>
  RegionList.map((region) => ({ region, status }));

const createProgrammingPlanDomain = fn();

const pesticideDomains = [2024, 2025, 2026].map((year) =>
  genProgrammingPlanDomain({ label: 'Résidus de pesticides', year })
);
const chemicalDomains = [2024, 2025, 2026].map((year) =>
  genProgrammingPlanDomain({ label: 'Contaminants chimiques', year })
);
const [pesticide2024, pesticide2025, pesticide2026] = pesticideDomains;
const [, , chemical2026] = chemicalDomains;

const meta = {
  title: 'Views/ProgrammingPlanSettings',
  component: ProgrammingPlanSettingsView,
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser({ userRole: 'AdministratorMaestro' }) }
    },
    apiClient: getMockApi({
      useFindProgrammingPlanDomainsQuery: {
        data: [...pesticideDomains, ...chemicalDomains]
      },
      useFindProgrammingPlansQuery: {
        data: [
          genProgrammingPlan({
            year: 2024,
            domainId: pesticide2024.id,
            regionalStatus: regionalStatus('InProgress')
          }),
          genProgrammingPlan({
            year: 2025,
            domainId: pesticide2025.id,
            regionalStatus: regionalStatus('Validated')
          }),
          genProgrammingPlan({
            year: 2026,
            domainId: pesticide2026.id,
            subPlans: [genProgrammingSubPlan(), genProgrammingSubPlan()],
            regionalStatus: regionalStatus('Validated')
          }),
          genProgrammingPlan({
            year: 2026,
            domainId: pesticide2026.id,
            regionalStatus: regionalStatus('SubmittedToRegion')
          }),
          genProgrammingPlan({
            year: 2026,
            domainId: chemical2026.id,
            subPlans: [
              genProgrammingSubPlan(),
              genProgrammingSubPlan(),
              genProgrammingSubPlan()
            ],
            regionalStatus: regionalStatus('Validated')
          })
        ]
      },
      useCreateProgrammingPlanDomainMutation: [createProgrammingPlanDomain, {}]
    })
  }
} satisfies Meta<typeof ProgrammingPlanSettingsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    //le libellé d'un domaine apparaît aussi dans les selects de la section de rattachement
    const domainCard = (label: string) =>
      within(
        canvas
          .getAllByText(label)
          .map((element) => element.closest('.fr-card'))
          .find((card) => card !== null) as HTMLElement
      );

    await expect(
      canvas.getByRole('button', { name: '2026' })
    ).toBeInTheDocument();

    await expect(canvas.getByText('Tous les domaines (2)')).toBeInTheDocument();

    await expect(
      domainCard('Résidus de pesticides').getByText('2 plans / 3 sous-plans')
    ).toBeInTheDocument();
    await expect(
      domainCard('Contaminants chimiques').getByText('1 plan / 3 sous-plans')
    ).toBeInTheDocument();

    await expect(
      domainCard('Résidus de pesticides').getByText('Campagne en partie lancée')
    ).toBeInTheDocument();
    await expect(
      domainCard('Contaminants chimiques').getByText('Campagne lancée')
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '2026' }));
    await userEvent.click(await canvas.findByRole('button', { name: '2024' }));

    await expect(
      canvas.getByRole('button', { name: '2024' })
    ).toBeInTheDocument();
    await expect(
      domainCard('Résidus de pesticides').getByText('1 plan / 1 sous-plan')
    ).toBeInTheDocument();
    await expect(
      domainCard('Contaminants chimiques').getByText('0 plan / 0 sous-plan')
    ).toBeInTheDocument();

    await expect(
      domainCard('Résidus de pesticides').getByText('Campagne non lancée')
    ).toBeInTheDocument();
    await expect(
      domainCard('Contaminants chimiques').getByText('Campagne non lancée')
    ).toBeInTheDocument();
  }
};

export const AddDomain: Story = {
  parameters: {
    initialEntries: [
      AppRouteLinks.ProgrammingPlanSettingsRoute.link({ year: 2026 })
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    createProgrammingPlanDomain.mockClear();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Ajouter un domaine' })
    );

    const modal = within(
      canvasElement.querySelector<HTMLElement>(
        '#programming-plan-domain-create-modal'
      ) as HTMLElement
    );

    await userEvent.click(modal.getByText('Ajouter'));
    await expect(createProgrammingPlanDomain).not.toHaveBeenCalled();
    await expect(
      modal.getByText('Veuillez renseigner le libellé du domaine.')
    ).toBeInTheDocument();

    await userEvent.type(
      modal.getByLabelText(/Libellé du domaine/),
      'Contaminants environnementaux'
    );
    await userEvent.click(modal.getByText('Ajouter'));

    await waitFor(() =>
      expect(createProgrammingPlanDomain).toHaveBeenCalledWith({
        label: 'Contaminants environnementaux',
        year: 2026
      })
    );
  }
};
