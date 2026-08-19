import type { Meta, StoryObj } from '@storybook/react-vite';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { genAuthUser } from 'maestro-shared/test/userFixtures';
import { expect, fn, userEvent, within } from 'storybook/test';
import { getMockApi } from '../../services/mockApiClient';
import { ProgrammingPlanSettingsView } from './ProgrammingPlanSettingsView';

const years = [2024, 2025, 2026];

const createProgrammingPlanDomain = fn();

const meta = {
  title: 'Views/ProgrammingPlanSettings',
  component: ProgrammingPlanSettingsView,
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser({ userRole: 'AdministratorMaestro' }) }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: years.map((year) => genProgrammingPlan({ year }))
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

    await expect(canvas.getByText('2026')).toBeInTheDocument();

    await expect(canvas.getByText('Résidus de pesticides')).toBeInTheDocument();
    await expect(
      canvas.getByText('Contaminants chimiques')
    ).toBeInTheDocument();
    await expect(canvas.getByText('Tous les domaines (2)')).toBeInTheDocument();

    await userEvent.click(canvas.getByText('2026'));
    await userEvent.click(await canvas.findByText('2024'));

    await expect(canvas.getByText('2024')).toBeInTheDocument();
  }
};

export const AddDomain: Story = {
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

    await expect(createProgrammingPlanDomain).toHaveBeenCalledWith({
      label: 'Contaminants environnementaux'
    });
  }
};
