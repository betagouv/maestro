import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import {
  genProgrammingPlan,
  PesticideResidueDomainId
} from 'maestro-shared/test/programmingPlanFixtures';
import { genAuthUser } from 'maestro-shared/test/userFixtures';
import { Route, Routes } from 'react-router';
import { expect, within } from 'storybook/test';
import { getMockApi } from '../../../services/mockApiClient';
import { ProgrammingPlanView } from './ProgrammingPlanView';

const PPVPlanId = 'e0a9de3a-4f9a-4c0f-9a03-1f0dd4a3e6f1';

const meta = {
  title: 'Views/ProgrammingPlan',
  component: ProgrammingPlanView,
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
            title: 'Production primaire végétale'
          }),
          genProgrammingPlan({
            year: 2026,
            domainId: PesticideResidueDomainId,
            title: 'Transformation végétale'
          })
        ]
      }
    }),
    initialEntries: [
      AppRouteLinks.ProgrammingPlanSettingsPlanRoute.link(
        PesticideResidueDomainId,
        PPVPlanId
      )
    ]
  },
  decorators: [
    (Story) => (
      <Routes>
        <Route
          path={AppRouteLinks.ProgrammingPlanSettingsPlanRoute.path}
          element={<Story />}
        />
      </Routes>
    )
  ]
} satisfies Meta<typeof ProgrammingPlanView>;

export default meta;
type Story = StoryObj<typeof ProgrammingPlanView>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Production primaire végétale' })
    ).toBeInTheDocument();

    await expect(canvas.getByText('Tous les domaines')).toHaveAttribute(
      'href',
      '/parametrage-des-plans?year=2026'
    );
    await expect(canvas.getByText('Résidus de pesticides')).toHaveAttribute(
      'href',
      `/parametrage-des-plans/${PesticideResidueDomainId}?year=2026`
    );
    await expect(
      canvas.queryByText('Transformation végétale')
    ).not.toBeInTheDocument();

    // Le bouton retour ramène au domaine, année conservée
    await expect(canvas.getByTitle('Revenir au domaine')).toHaveAttribute(
      'href',
      `/parametrage-des-plans/${PesticideResidueDomainId}?year=2026`
    );
  }
};
