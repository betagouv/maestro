import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionList } from 'maestro-shared/referential/Region';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import type { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import {
  ChemicalContaminantDomainId,
  genProgrammingPlan,
  genProgrammingSubPlan,
  PesticideResidueDomainId
} from 'maestro-shared/test/programmingPlanFixtures';
import { genAuthUser } from 'maestro-shared/test/userFixtures';
import { Route, Routes } from 'react-router';
import { expect, within } from 'storybook/test';
import { getMockApi } from '../../../services/mockApiClient';
import { ProgrammingPlanDomainView } from './ProgrammingPlanDomainView';

const PPVPlanId = 'e0a9de3a-4f9a-4c0f-9a03-1f0dd4a3e6f1';

const regionalStatus = (status: ProgrammingPlanStatus) =>
  RegionList.map((region) => ({ region, status }));

const meta = {
  title: 'Views/ProgrammingPlanDomain',
  component: ProgrammingPlanDomainView,
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser({ userRole: 'AdministratorMaestro' }) }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: [
          genProgrammingPlan({
            id: PPVPlanId,
            year: 2026,
            domainId: PesticideResidueDomainId,
            title: 'Production primaire végétale',
            subPlans: [genProgrammingSubPlan(), genProgrammingSubPlan()],
            regionalStatus: regionalStatus('Validated')
          }),
          genProgrammingPlan({
            year: 2026,
            domainId: PesticideResidueDomainId,
            title: 'Transformation végétale',
            regionalStatus: regionalStatus('InProgress')
          }),
          genProgrammingPlan({
            year: 2025,
            domainId: PesticideResidueDomainId,
            title: 'Plan de l’année précédente',
            regionalStatus: regionalStatus('Closed')
          }),
          genProgrammingPlan({
            year: 2026,
            domainId: ChemicalContaminantDomainId,
            title: 'Plan d’un autre domaine',
            regionalStatus: regionalStatus('Validated')
          })
        ]
      }
    }),
    initialEntries: [
      AppRouteLinks.ProgrammingPlanSettingsDomainRoute.link(
        PesticideResidueDomainId
      )
    ]
  },
  decorators: [
    (Story) => (
      <Routes>
        <Route
          path={AppRouteLinks.ProgrammingPlanSettingsDomainRoute.path}
          element={<Story />}
        />
      </Routes>
    )
  ]
} satisfies Meta<typeof ProgrammingPlanDomainView>;

export default meta;
type Story = StoryObj<typeof ProgrammingPlanDomainView>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const planCard = (title: string) =>
      within(canvas.getByText(title).closest('.fr-card') as HTMLElement);

    await expect(
      canvas.getByRole('heading', { name: 'Résidus de pesticides (2)' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByTitle('Revenir à tous les domaines')
    ).toBeInTheDocument();

    await expect(canvas.getByText('2026')).toBeInTheDocument();

    // Seuls les plans du domaine et de l'année sélectionnée sont affichés
    await expect(
      canvas.queryByText('Plan de l’année précédente')
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Plan d’un autre domaine')
    ).not.toBeInTheDocument();

    await expect(
      planCard('Production primaire végétale').getByText('2 sous-plans')
    ).toBeInTheDocument();
    await expect(
      planCard('Production primaire végétale').getByText('Campagne lancée')
    ).toBeInTheDocument();
    await expect(
      planCard('Production primaire végétale').getByText('Terminé')
    ).toBeInTheDocument();

    await expect(
      planCard('Transformation végétale').getByText('1 sous-plan')
    ).toBeInTheDocument();
    await expect(
      planCard('Transformation végétale').getByText('Campagne non lancée')
    ).toBeInTheDocument();
    await expect(
      planCard('Transformation végétale').getByText('En cours')
    ).toBeInTheDocument();

    // La carte mène à la page du plan, année conservée
    await expect(
      canvas
        .getByText('Production primaire végétale')
        .closest('.fr-card')
        ?.querySelector('a')
    ).toHaveAttribute(
      'href',
      `/parametrage-des-plans/${PesticideResidueDomainId}/${PPVPlanId}?year=2026`
    );
  }
};
