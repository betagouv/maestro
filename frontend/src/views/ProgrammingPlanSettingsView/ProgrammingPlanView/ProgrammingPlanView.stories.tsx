import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import {
  genProgrammingPlan,
  genProgrammingPlanDomain,
  genProgrammingSubPlan
} from 'maestro-shared/test/programmingPlanFixtures';
import { genAuthUser } from 'maestro-shared/test/userFixtures';
import { Route, Routes } from 'react-router';
import { expect, userEvent, within } from 'storybook/test';
import { getMockApi } from '../../../services/mockApiClient';
import { ProgrammingPlanView } from './ProgrammingPlanView';

const PPVPlanId = 'e0a9de3a-4f9a-4c0f-9a03-1f0dd4a3e6f1';
const CerealesSubPlanId = ProgrammingSubPlanId.parse(
  'b5f1a0c2-2d6e-4a15-9f4c-3c2b7d1e8a90'
);
const FruitsSubPlanId = ProgrammingSubPlanId.parse(
  '7c3d9e51-8b24-4f0a-bd63-1a5e4c9f2d78'
);

const pesticide2026 = genProgrammingPlanDomain({
  label: 'Résidus de pesticides',
  year: 2026
});

const meta = {
  title: 'Views/ProgrammingPlan',
  component: ProgrammingPlanView,
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser({ userRole: 'AdministratorMaestro' }) }
    },
    apiClient: getMockApi({
      useFindProgrammingPlanDomainsQuery: { data: [pesticide2026] },
      useFindProgrammingPlansQuery: {
        data: [
          genProgrammingPlan({
            id: PPVPlanId,
            year: 2026,
            domainId: pesticide2026.id,
            title: 'Production primaire végétale',
            subPlans: [
              genProgrammingSubPlan({
                id: FruitsSubPlanId,
                subPlanNumber: '102',
                label: 'Fruits et légumes'
              }),
              genProgrammingSubPlan({
                id: CerealesSubPlanId,
                subPlanNumber: '101',
                label: 'Céréales'
              })
            ]
          }),
          genProgrammingPlan({
            year: 2026,
            domainId: pesticide2026.id,
            title: 'Transformation végétale'
          })
        ]
      }
    }),
    initialEntries: [
      AppRouteLinks.ProgrammingPlanSettingsPlanRoute.link(PPVPlanId)
    ]
  },
  decorators: [
    (Story) => (
      <Routes>
        <Route
          path={AppRouteLinks.ProgrammingPlanSettingsPlanRoute.path}
          element={<Story />}
        />
        <Route
          path={AppRouteLinks.ProgrammingPlanSettingsSubPlanRoute.path}
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
      `/parametrage-des-plans/domaines/${pesticide2026.id}`
    );

    await expect(canvas.getByText('2026')).toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: '2026' })
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Transformation végétale')
    ).not.toBeInTheDocument();

    // Le bouton retour ramène au domaine
    await expect(canvas.getByTitle('Revenir au domaine')).toHaveAttribute(
      'href',
      `/parametrage-des-plans/domaines/${pesticide2026.id}`
    );
  }
};

export const SubPlanList: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('2 sous-plans')).toBeInTheDocument();

    const subPlans = within(
      canvas.getByRole('list', { name: 'Liste des sous-plans' })
    ).getAllByRole('listitem');
    await expect(subPlans[0]).toHaveTextContent('101 - Céréales');
    await expect(subPlans[1]).toHaveTextContent('102 - Fruits et légumes');

    // La recherche filtre la liste
    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Rechercher un sous-plan' }),
      'légumes'
    );
    await expect(
      canvas.getByText('102 - Fruits et légumes')
    ).toBeInTheDocument();
    await expect(canvas.queryByText('101 - Céréales')).not.toBeInTheDocument();
  }
};

export const SubPlan: Story = {
  parameters: {
    initialEntries: [
      AppRouteLinks.ProgrammingPlanSettingsSubPlanRoute.link(
        PPVPlanId,
        CerealesSubPlanId
      )
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: '101 - Céréales' })
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('Production primaire végétale')
    ).toHaveAttribute('href', `/parametrage-des-plans/plans/${PPVPlanId}`);
    await expect(canvas.getByTitle('Revenir au plan')).toHaveAttribute(
      'href',
      `/parametrage-des-plans/plans/${PPVPlanId}`
    );

    await expect(
      canvas.getByRole('link', { current: 'page' })
    ).toHaveTextContent('101 - Céréales');
  }
};
