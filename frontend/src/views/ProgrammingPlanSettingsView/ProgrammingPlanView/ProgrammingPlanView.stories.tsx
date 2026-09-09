import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import type {
  ProgrammingPlanSettingsForm,
  ProgrammingSubPlanSettingsForm
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { AdminFieldConfig } from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import { SpecificDataFieldId } from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import {
  genProgrammingPlan,
  genProgrammingPlanDomain,
  genProgrammingSubPlan,
  NationalCoordinatorEmail,
  NationalCoordinatorId,
  NationalCoordinatorName
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  genAuthUser,
  genUser,
  NationalCoordinatorDaoaFixture
} from 'maestro-shared/test/userFixtures';
import { Route, Routes } from 'react-router';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { getMockApi, type MockApi } from '../../../services/mockApiClient';
import { ProgrammingPlanView } from './ProgrammingPlanView';

const PPVPlanId = 'e0a9de3a-4f9a-4c0f-9a03-1f0dd4a3e6f1';
const CerealesSubPlanId = ProgrammingSubPlanId.parse(
  'b5f1a0c2-2d6e-4a15-9f4c-3c2b7d1e8a90'
);
const FruitsSubPlanId = ProgrammingSubPlanId.parse(
  '7c3d9e51-8b24-4f0a-bd63-1a5e4c9f2d78'
);
const AnimauxSubPlanId = ProgrammingSubPlanId.parse(
  '2f6b9e14-5c8a-4d2f-9e01-6b3a8f0c1d47'
);

const updateProgrammingPlanSettings = fn();
const updateProgrammingSubPlanSettings = fn();

const genAdminField = (key: string, id: string): AdminFieldConfig => ({
  id: SpecificDataFieldId.parse(id),
  key,
  inputType: 'text',
  label: `Champ ${key}`,
  hintText: null,
  sachaCommemoratifSigle: null,
  sachaInDai: false,
  sachaOptional: false,
  options: []
});

const matriceField = genAdminField(
  'matrice',
  '0c0f6a41-7a3d-4d6e-9f21-5b9c4a1e2d33'
);
const quantiteField = genAdminField(
  'quantite',
  '4a1e2d33-0c0f-6a41-7a3d-4d6e9f215b9c'
);
const especeField = genAdminField(
  'espece',
  '9f215b9c-4a1e-2d33-0c0f-6a417a3d4d6e'
);

const subPlanSettings: Record<string, ProgrammingSubPlanSettingsForm> = {
  [CerealesSubPlanId]: {
    stages: ['PRODUCTION_PRIMAIRE_VEGETALE'],
    stagesManaged: true,
    settingsCompleted: false,
    fields: [matriceField, quantiteField].map(({ id }) => ({
      fieldId: id,
      required: false,
      optionIds: [],
      inheritance: 'Own',
      managedAtPlanLevel: false
    }))
  },
  [FruitsSubPlanId]: {
    stages: ['TRANSFORMATION'],
    stagesManaged: false,
    settingsCompleted: false,
    fields: []
  },
  [AnimauxSubPlanId]: {
    stages: ['ELEVAGE'],
    stagesManaged: false,
    settingsCompleted: true,
    fields: [
      {
        fieldId: especeField.id,
        required: true,
        optionIds: [],
        inheritance: 'Inherited',
        managedAtPlanLevel: true
      }
    ]
  }
};

const nationalCoordinator = {
  id: NationalCoordinatorId,
  name: NationalCoordinatorName,
  email: NationalCoordinatorEmail
};

const otherNationalCoordinator = {
  id: NationalCoordinatorDaoaFixture.id,
  name: NationalCoordinatorDaoaFixture.name,
  email: NationalCoordinatorDaoaFixture.email
};

const neverLoggedNationalCoordinator = {
  id: '16161616-1616-1616-1616-161616161616',
  name: null,
  email: 'nouvelle.coordination@example.net'
};

const planSettings: ProgrammingPlanSettingsForm = {
  stages: ['TRANSFORMATION'],
  stagesManaged: true,
  settingsCompleted: false,
  nationalCoordinators: [nationalCoordinator],
  fields: [{ fieldId: especeField.id, required: true, optionIds: [] }]
};

const pesticide2026 = genProgrammingPlanDomain({
  label: 'Résidus de pesticides',
  year: 2026
});

const mockApiConf: Partial<MockApi> = {
  useUpdateProgrammingPlanSettingsMutation: [updateProgrammingPlanSettings, {}],
  useFindProgrammingPlanSettingsQuery: { data: planSettings },
  useUpdateProgrammingSubPlanSettingsMutation: [
    updateProgrammingSubPlanSettings,
    {}
  ],
  useFindProgrammingSubPlanSettingsQuery: ({
    programmingSubPlanId
  }: {
    programmingSubPlanId: string;
  }) => ({ data: subPlanSettings[programmingSubPlanId] }),
  useFindAllFieldConfigsQuery: {
    data: [matriceField, quantiteField, especeField]
  },
  useFindProgrammingPlanDomainsQuery: { data: [pesticide2026] },
  useFindUsersQuery: {
    data: [
      nationalCoordinator,
      otherNationalCoordinator,
      neverLoggedNationalCoordinator
    ].map((user) => genUser({ ...user, roles: ['NationalCoordinator'] }))
  },
  useFindProgrammingPlansQuery: {
    data: [
      genProgrammingPlan({
        id: PPVPlanId,
        year: 2026,
        domainId: pesticide2026.id,
        title: 'Production primaire végétale',
        stages: ['TRANSFORMATION'],
        stagesManaged: true,
        settingsCompleted: false,
        subPlans: [
          genProgrammingSubPlan({
            id: FruitsSubPlanId,
            subPlanNumber: '102',
            label: 'Fruits et légumes',
            stages: ['PRODUCTION_PRIMAIRE_VEGETALE', 'TRANSFORMATION'],
            settingsCompleted: false
          }),
          genProgrammingSubPlan({
            id: CerealesSubPlanId,
            subPlanNumber: '101',
            label: 'Céréales',
            stages: ['PRODUCTION_PRIMAIRE_VEGETALE'],
            settingsCompleted: false
          }),
          genProgrammingSubPlan({
            id: AnimauxSubPlanId,
            subPlanNumber: '103',
            label: 'Animaux',
            stages: ['ELEVAGE'],
            settingsCompleted: true
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
};

const meta = {
  title: 'Views/ProgrammingPlan',
  component: ProgrammingPlanView,
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser({ userRole: 'AdministratorMaestro' }) }
    },
    apiClient: getMockApi(mockApiConf),
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

    await expect(
      canvas.getByRole('tab', { name: 'Paramétrage global' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Transformation', { selector: '.fr-tag' })
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('tab', { name: 'Formulaire préleveur' })
    );
    await expect(canvas.getByText('Champ espece')).toBeInTheDocument();
  }
};

export const PlanSave: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    updateProgrammingPlanSettings.mockClear();

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: /Stade\(s\) de prélèvement/ }),
      'ELEVAGE'
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Enregistrer en brouillon' })
    );

    await waitFor(() =>
      expect(updateProgrammingPlanSettings).toHaveBeenCalledWith({
        programmingPlanId: PPVPlanId,
        stages: ['TRANSFORMATION', 'ELEVAGE'],
        stagesManaged: true,
        settingsCompleted: false,
        nationalCoordinators: [nationalCoordinator],
        fields: planSettings.fields
      })
    );
  }
};

export const SubPlanList: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('3 sous-plans')).toBeInTheDocument();

    const subPlans = within(
      canvas.getByRole('list', { name: 'Liste des sous-plans' })
    ).getAllByRole('listitem');
    await expect(subPlans[0]).toHaveTextContent('101 - Céréales');
    await expect(subPlans[1]).toHaveTextContent('102 - Fruits et légumes');
    await expect(subPlans[2]).toHaveTextContent('103 - Animaux');

    await expect(canvas.getAllByTitle('Paramétrage terminé')).toHaveLength(1);
    await expect(
      within(subPlans[2]).getByTitle('Paramétrage terminé')
    ).toBeInTheDocument();

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
      canvas.getByRole('link', { name: 'Production primaire végétale' })
    ).toHaveAttribute('href', `/parametrage-des-plans/plans/${PPVPlanId}`);
    await expect(canvas.getByTitle('Revenir au plan')).toHaveAttribute(
      'href',
      `/parametrage-des-plans/plans/${PPVPlanId}`
    );

    await expect(
      canvas.getByRole('link', { current: 'page' })
    ).toHaveTextContent('101 - Céréales');

    await expect(
      canvas.getByRole('tab', { name: 'Paramétrage global' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Production primaire végétale', {
        selector: '.fr-tag'
      })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText('Transformation', { selector: '.fr-tag' })
    ).not.toBeInTheDocument();

    await expect(
      canvas.getByRole('button', { name: 'Réinitialiser les modifications' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Enregistrer en brouillon' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Enregistrer et terminer' })
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('button', { name: 'Réinitialiser les modifications' })
    ).toBeDisabled();

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: /Stade\(s\) de prélèvement/ }),
      'ELEVAGE'
    );
    await expect(
      canvas.getByText('Élevage', { selector: '.fr-tag' })
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Réinitialiser les modifications' })
    );
    await expect(
      canvas.queryByText('Élevage', { selector: '.fr-tag' })
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByText('Production primaire végétale', {
        selector: '.fr-tag'
      })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Réinitialiser les modifications' })
    ).toBeDisabled();
  }
};

export const SubPlanSave: Story = {
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

    updateProgrammingSubPlanSettings.mockClear();

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: /Stade\(s\) de prélèvement/ }),
      'ELEVAGE'
    );

    for (const [buttonLabel, settingsCompleted] of [
      ['Enregistrer en brouillon', false],
      ['Enregistrer et terminer', true]
    ] as const) {
      updateProgrammingSubPlanSettings.mockClear();

      await userEvent.click(canvas.getByRole('button', { name: buttonLabel }));

      await waitFor(() =>
        expect(updateProgrammingSubPlanSettings).toHaveBeenCalledWith({
          programmingPlanId: PPVPlanId,
          programmingSubPlanId: CerealesSubPlanId,
          stages: ['PRODUCTION_PRIMAIRE_VEGETALE', 'ELEVAGE'],
          stagesManaged: true,
          settingsCompleted,
          fields: subPlanSettings[CerealesSubPlanId].fields
        })
      );
    }
  }
};

export const SubPlanCompleted: Story = {
  parameters: {
    initialEntries: [
      AppRouteLinks.ProgrammingPlanSettingsSubPlanRoute.link(
        PPVPlanId,
        AnimauxSubPlanId
      )
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    updateProgrammingSubPlanSettings.mockClear();

    await expect(
      canvas.queryByRole('button', { name: 'Enregistrer en brouillon' })
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Enregistrer et terminer' })
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() =>
      expect(updateProgrammingSubPlanSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          programmingSubPlanId: AnimauxSubPlanId,
          settingsCompleted: true
        })
      )
    );
  }
};

export const SubPlanIncompleteCannotComplete: Story = {
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

    updateProgrammingSubPlanSettings.mockClear();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Production primaire végétale' })
    );

    await userEvent.click(
      canvas.getByRole('tab', { name: 'Formulaire préleveur' })
    );
    await expect(
      canvas.getByRole('tab', { name: 'Formulaire préleveur' })
    ).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Enregistrer et terminer' })
    );

    await waitFor(() =>
      expect(
        canvas.getByRole('tab', { name: 'Paramétrage global' })
      ).toHaveAttribute('aria-selected', 'true')
    );
    await expect(
      canvas.getByText('Veuillez renseigner au moins un stade de prélèvement.')
    ).toBeInTheDocument();
    await expect(updateProgrammingSubPlanSettings).not.toHaveBeenCalled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Enregistrer en brouillon' })
    );

    await waitFor(() =>
      expect(updateProgrammingSubPlanSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          programmingSubPlanId: CerealesSubPlanId,
          stages: [],
          settingsCompleted: false
        })
      )
    );
  }
};

export const SubPlanSamplerForm: Story = {
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

    updateProgrammingSubPlanSettings.mockClear();

    await userEvent.click(
      canvas.getByRole('tab', { name: 'Formulaire préleveur' })
    );

    const iconButtons = (title: string) => canvas.getAllByTitle(title);
    const inModal = (id: string) =>
      within(canvasElement.querySelector(`#${id}`) as HTMLElement);
    const fieldCount = () => iconButtons('Monter').length;

    await expect(canvas.getByText('Champ matrice')).toBeInTheDocument();
    await expect(fieldCount()).toBe(2);
    await expect(
      canvas.getByRole('button', { name: 'Réinitialiser les modifications' })
    ).toBeDisabled();

    await userEvent.click(
      canvas.getByText('Ajouter un descripteur', { selector: 'button' })
    );
    await waitFor(() =>
      expect(
        inModal('sampler-form-add-field-modal').getByLabelText(/^Descripteur/)
      ).toBeVisible()
    );
    await userEvent.selectOptions(
      inModal('sampler-form-add-field-modal').getByLabelText(/^Descripteur/),
      especeField.id
    );
    await userEvent.click(
      inModal('sampler-form-add-field-modal').getByText('Ajouter', {
        selector: 'button'
      })
    );
    await waitFor(() => expect(fieldCount()).toBe(3));
    await expect(updateProgrammingSubPlanSettings).not.toHaveBeenCalled();

    await userEvent.click(iconButtons('Monter')[1]);
    await expect(canvas.getByText('Champ quantite')).toBeInTheDocument();

    await userEvent.click(iconButtons('Retirer')[2]);
    await waitFor(() =>
      expect(canvas.queryByText('Champ espece')).not.toBeInTheDocument()
    );

    await expect(updateProgrammingSubPlanSettings).not.toHaveBeenCalled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Enregistrer en brouillon' })
    );

    await waitFor(() =>
      expect(updateProgrammingSubPlanSettings).toHaveBeenCalledTimes(1)
    );
    await expect(updateProgrammingSubPlanSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        programmingPlanId: PPVPlanId,
        programmingSubPlanId: CerealesSubPlanId,
        stages: ['PRODUCTION_PRIMAIRE_VEGETALE'],
        stagesManaged: true,
        settingsCompleted: false,
        fields: [quantiteField, matriceField].map(({ id }) => ({
          fieldId: id,
          required: false,
          optionIds: [],
          inheritance: 'Own',
          managedAtPlanLevel: false
        }))
      })
    );
  }
};

export const PlanStagesSwitch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    updateProgrammingPlanSettings.mockClear();

    const managedSwitch = canvas.getByTitle(
      'Paramétrer « Stade(s) de prélèvement » au niveau du plan'
    );
    const stages = canvas.getByRole('combobox', {
      name: /Stade\(s\) de prélèvement/
    });

    await expect(managedSwitch).toBeChecked();
    await expect(stages).toBeEnabled();

    await userEvent.click(managedSwitch);
    await expect(stages).toBeDisabled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Enregistrer en brouillon' })
    );
    await waitFor(() =>
      expect(updateProgrammingPlanSettings).toHaveBeenCalledWith({
        programmingPlanId: PPVPlanId,
        stages: ['TRANSFORMATION'],
        stagesManaged: false,
        settingsCompleted: false,
        nationalCoordinators: [nationalCoordinator],
        fields: planSettings.fields
      })
    );
  }
};

export const SubPlanInheritedStages: Story = {
  parameters: {
    initialEntries: [
      AppRouteLinks.ProgrammingPlanSettingsSubPlanRoute.link(
        PPVPlanId,
        FruitsSubPlanId
      )
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    updateProgrammingSubPlanSettings.mockClear();

    await expect(canvas.getByTitle('Géré par le plan')).toBeInTheDocument();
    await expect(
      canvas.getByRole('combobox', { name: /Stade\(s\) de prélèvement/ })
    ).toBeDisabled();
    await expect(
      canvas.getByText('Transformation', { selector: '.fr-tag' })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Transformation' })
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByTitle('Géré par le plan'));
    await expect(canvas.getByTitle('Détaché du plan')).toBeInTheDocument();
    await expect(
      canvas.getByRole('combobox', { name: /Stade\(s\) de prélèvement/ })
    ).toBeEnabled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Enregistrer en brouillon' })
    );
    await waitFor(() =>
      expect(updateProgrammingSubPlanSettings).toHaveBeenCalledWith({
        programmingPlanId: PPVPlanId,
        programmingSubPlanId: FruitsSubPlanId,
        stages: ['TRANSFORMATION'],
        stagesManaged: true,
        settingsCompleted: false,
        fields: []
      })
    );
  }
};

export const SubPlanDetachedStages: Story = {
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

    updateProgrammingSubPlanSettings.mockClear();

    await expect(canvas.getByTitle('Détaché du plan')).toBeInTheDocument();
    await expect(
      canvas.getByRole('combobox', { name: /Stade\(s\) de prélèvement/ })
    ).toBeEnabled();
    await expect(
      canvas.getByText('Production primaire végétale', { selector: '.fr-tag' })
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByTitle('Détaché du plan'));
    await expect(canvas.getByTitle('Géré par le plan')).toBeInTheDocument();
    await expect(
      canvas.getByText('Transformation', { selector: '.fr-tag' })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText('Production primaire végétale', {
        selector: '.fr-tag'
      })
    ).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Enregistrer en brouillon' })
    );
    await waitFor(() =>
      expect(updateProgrammingSubPlanSettings).toHaveBeenCalledWith({
        programmingPlanId: PPVPlanId,
        programmingSubPlanId: CerealesSubPlanId,
        stages: ['TRANSFORMATION'],
        stagesManaged: false,
        settingsCompleted: false,
        fields: subPlanSettings[CerealesSubPlanId].fields
      })
    );
  }
};

export const SubPlanManagedField: Story = {
  parameters: {
    initialEntries: [
      AppRouteLinks.ProgrammingPlanSettingsSubPlanRoute.link(
        PPVPlanId,
        AnimauxSubPlanId
      )
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('tab', { name: 'Formulaire préleveur' })
    );

    const fieldItem = () =>
      within(
        canvas
          .getByTitle('Retirer')
          .closest('.programming-sub-plan-field-item') as HTMLElement
      );

    await expect(fieldItem().getByTitle('Hérité du plan')).toBeInTheDocument();
    await expect(fieldItem().getByLabelText('Obligatoire')).toBeDisabled();

    await userEvent.click(fieldItem().getByTitle('Hérité du plan'));
    await expect(
      fieldItem().getByTitle('Piloté par le sous-plan')
    ).toBeInTheDocument();
    await expect(fieldItem().getByLabelText('Obligatoire')).toBeEnabled();

    await userEvent.click(fieldItem().getByTitle('Retirer'));
    await waitFor(() =>
      expect(
        canvas.queryByText('Champ espece', { selector: 'p' })
      ).not.toBeInTheDocument()
    );

    await userEvent.click(
      canvas.getByText('Ajouter un descripteur', { selector: 'button' })
    );
    const addModal = within(
      canvasElement.querySelector(
        '#sampler-form-add-field-modal'
      ) as HTMLElement
    );
    await waitFor(() =>
      expect(addModal.getByLabelText(/^Descripteur/)).toBeVisible()
    );
    await userEvent.selectOptions(
      addModal.getByLabelText(/^Descripteur/),
      especeField.id
    );
    await userEvent.click(
      addModal.getByText('Ajouter', { selector: 'button' })
    );

    await waitFor(() =>
      expect(
        canvas.getByText('Champ espece', { selector: 'p' })
      ).toBeInTheDocument()
    );
    await expect(fieldItem().getByTitle('Hérité du plan')).toBeInTheDocument();
    await expect(fieldItem().getByLabelText('Obligatoire')).toBeDisabled();
  }
};

export const PlanNationalCoordinators: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    updateProgrammingPlanSettings.mockClear();

    const select = canvas.getByRole('combobox', {
      name: /Coordinateur\(s\) national\(aux\)/
    });
    await expect(select).toBeEnabled();
    await expect(
      canvas.getByRole('button', { name: nationalCoordinator.name as string })
    ).toBeInTheDocument();

    await userEvent.selectOptions(select, otherNationalCoordinator.id);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Enregistrer en brouillon' })
    );

    await waitFor(() =>
      expect(updateProgrammingPlanSettings).toHaveBeenCalledWith({
        programmingPlanId: PPVPlanId,
        stages: ['TRANSFORMATION'],
        stagesManaged: true,
        settingsCompleted: false,
        nationalCoordinators: [nationalCoordinator, otherNationalCoordinator],
        fields: planSettings.fields
      })
    );
  }
};

export const PlanNationalCoordinatorsRequired: Story = {
  parameters: {
    apiClient: getMockApi({
      ...mockApiConf,
      useFindProgrammingPlanSettingsQuery: {
        data: { ...planSettings, nationalCoordinators: [] }
      }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    updateProgrammingPlanSettings.mockClear();

    await userEvent.click(canvas.getByRole('tab', { name: 'Analyses' }));

    await userEvent.click(
      canvas.getByRole('button', { name: 'Enregistrer et terminer' })
    );

    await waitFor(() =>
      expect(
        canvas.getByText(
          'Veuillez renseigner au moins un coordinateur national.'
        )
      ).toBeInTheDocument()
    );
    await expect(updateProgrammingPlanSettings).not.toHaveBeenCalled();
  }
};

export const PlanNationalCoordinatorsLockedForCoordinator: Story = {
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          userRole: 'NationalCoordinator',
          id: nationalCoordinator.id
        })
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('combobox', {
        name: /Coordinateur\(s\) national\(aux\)/
      })
    ).toBeDisabled();
    await expect(
      canvas.getByRole('combobox', { name: /Stade\(s\) de prélèvement/ })
    ).toBeEnabled();
    await expect(
      canvas.getByRole('button', { name: 'Enregistrer en brouillon' })
    ).toBeInTheDocument();
  }
};

export const PlanReadOnlyForNonCoordinator: Story = {
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          userRole: 'NationalCoordinator',
          id: otherNationalCoordinator.id
        })
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const stages = canvas.getByRole('combobox', {
      name: /Stade\(s\) de prélèvement/
    });
    stages.focus();
    await expect(stages).not.toHaveFocus();

    const coordinators = canvas.getByRole('combobox', {
      name: /Coordinateur\(s\) national\(aux\)/
    });
    coordinators.focus();
    await expect(coordinators).not.toHaveFocus();

    await userEvent.click(
      canvas.getByRole('tab', { name: 'Formulaire préleveur' })
    );
    const addField = canvas.getByRole('button', {
      name: 'Ajouter un descripteur'
    });
    addField.focus();
    await expect(addField).not.toHaveFocus();

    await expect(
      canvas.queryByRole('button', { name: 'Enregistrer en brouillon' })
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Enregistrer et terminer' })
    ).not.toBeInTheDocument();
  }
};

export const SubPlanHasNoNationalCoordinators: Story = {
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
      canvas.getByRole('combobox', { name: /Stade\(s\) de prélèvement/ })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('combobox', {
        name: /Coordinateur\(s\) national\(aux\)/
      })
    ).not.toBeInTheDocument();
  }
};

export const PlanNationalCoordinatorWithoutName: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    updateProgrammingPlanSettings.mockClear();

    await userEvent.selectOptions(
      canvas.getByRole('combobox', {
        name: /Coordinateur\(s\) national\(aux\)/
      }),
      neverLoggedNationalCoordinator.id
    );

    await expect(
      canvas.getByRole('button', {
        name: neverLoggedNationalCoordinator.email
      })
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Enregistrer en brouillon' })
    );

    await waitFor(() =>
      expect(updateProgrammingPlanSettings).toHaveBeenCalledWith({
        programmingPlanId: PPVPlanId,
        stages: ['TRANSFORMATION'],
        stagesManaged: true,
        settingsCompleted: false,
        nationalCoordinators: [
          nationalCoordinator,
          neverLoggedNationalCoordinator
        ],
        fields: planSettings.fields
      })
    );
  }
};
