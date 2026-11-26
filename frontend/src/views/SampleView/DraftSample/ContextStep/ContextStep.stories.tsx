import type { Meta, StoryObj } from '@storybook/react-vite';
import { SlaughterhouseCompanyFixture1 } from 'maestro-shared/test/companyFixtures';
import {
  genLocalPrescription,
  genPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import {
  genProgrammingPlan,
  genProgrammingSubPlan
} from 'maestro-shared/test/programmingPlanFixtures';
import { genSampleContextData } from 'maestro-shared/test/sampleFixtures';
import {
  genAuthUser,
  genUser,
  Sampler1Fixture,
  SamplerDaoaFixture
} from 'maestro-shared/test/userFixtures';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { getMockApi } from '../../../../services/mockApiClient';
import ContextStep from './ContextStep';

const meta = {
  title: 'Views/SampleView/ContextStep',
  component: ContextStep,
  decorators: (Story) => (
    <div className="sample-overview">
      <Story />
    </div>
  )
} satisfies Meta<typeof ContextStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const controlProgrammingPlan = genProgrammingPlan();
const programmingPlan = {
  ...controlProgrammingPlan,
  subPlans: [
    ...controlProgrammingPlan.subPlans,
    genProgrammingSubPlan({
      programmingPlanId: controlProgrammingPlan.id,
      subPlanNumber: 'PPV02',
      context: 'Surveillance'
    })
  ]
};

export const EmptyForm: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: () => ({
        data: [programmingPlan]
      })
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByTestId('draft_sample_creation_form')
    ).toBeInTheDocument();
    await expect(canvas.getAllByTestId('geolocationX-input')).toHaveLength(2);
    await expect(canvas.getAllByTestId('geolocationY-input')).toHaveLength(2);
    await expect(canvas.getAllByTestId('parcel-input')).toHaveLength(2);
    await expect(canvas.getAllByTestId('context-radio')).toHaveLength(1);
    await expect(canvas.getAllByTestId('legalContext-radio')).toHaveLength(1);
    await expect(canvas.getAllByTestId('companySearch-input')).toHaveLength(1);
    await expect(canvas.getAllByTestId('resytalId-input')).toHaveLength(2);
    await expect(canvas.getAllByTestId('notes-input')).toHaveLength(2);

    await expect(canvas.getByTestId('cancel-button')).toBeInTheDocument();
    await expect(canvas.getByTestId('submit-button')).toBeInTheDocument();
  }
};

export const SubmittingErrors: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: () => ({
        data: [programmingPlan]
      }),
      useGetProgrammingPlanQuery: () => ({
        data: programmingPlan
      })
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('submit-button'));

    await expect(
      canvas.getByText('Veuillez renseigner la latitude.')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Veuillez renseigner la longitude.')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Veuillez renseigner le type de plan.')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Veuillez renseigner le contexte.')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Veuillez renseigner le cadre juridique.')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText("Veuillez renseigner l'entité")
    ).toBeInTheDocument();
  }
};

const mockCreateOrUpdateSample = fn().mockResolvedValue({});
const sampleContextData = genSampleContextData({
  sampler: Sampler1Fixture,
  programmingPlanId: programmingPlan.id,
  programmingSubPlanId: programmingPlan.subPlans[0].id
});

export const SubmittingSuccess: Story = {
  args: {
    partialSample: {
      ...sampleContextData,
      step: 'Draft' as const
    }
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) }
    },
    apiClient: getMockApi({
      useCreateOrUpdateSampleMutation: [
        async (...args) => await mockCreateOrUpdateSample(...args),
        { isSuccess: true }
      ],
      useGetProgrammingPlanQuery: () => ({
        data: programmingPlan
      })
    })
  },
  play: async ({ canvasElement }) => {
    mockCreateOrUpdateSample.mockClear();

    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('submit-button'));

    await expect(mockCreateOrUpdateSample).toHaveBeenCalledWith(
      expect.objectContaining({
        ...sampleContextData,
        step: 'DraftMatrix'
      })
    );
  }
};

const mixedPlanId = crypto.randomUUID();
const slaughterhouseSubPlan = genProgrammingSubPlan({
  programmingPlanId: mixedPlanId,
  subPlanNumber: 'M01',
  stages: [{ stage: 'ABATTAGE', subStages: [] }]
});
const farmingSubPlan = genProgrammingSubPlan({
  programmingPlanId: mixedPlanId,
  subPlanNumber: 'M03',
  stages: [{ stage: 'ELEVAGE', subStages: [] }]
});
const mixedProgrammingPlan = genProgrammingPlan({
  id: mixedPlanId,
  subPlans: [slaughterhouseSubPlan, farmingSubPlan]
});
const mixedPlanSampler = genUser({
  ...SamplerDaoaFixture,
  programmingSubPlans: [slaughterhouseSubPlan, farmingSubPlan]
});
const slaughterhousePrescription = genPrescription({
  programmingSubPlanId: slaughterhouseSubPlan.id
});
const farmingPrescription = genPrescription({
  programmingSubPlanId: farmingSubPlan.id
});

export const MixedPlanCompanyFollowsSubPlan: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(mixedPlanSampler) }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: () => ({
        data: [mixedProgrammingPlan]
      }),
      useGetProgrammingPlanQuery: () => ({
        data: mixedProgrammingPlan
      }),
      useFindPrescriptionsQuery: {
        data: [slaughterhousePrescription, farmingPrescription]
      },
      useFindLocalPrescriptionsQuery: {
        data: [
          genLocalPrescription({
            prescriptionId: slaughterhousePrescription.id,
            region: mixedPlanSampler.region,
            department: mixedPlanSampler.department,
            companySiret: SlaughterhouseCompanyFixture1.siret,
            sampleCount: 2
          }),
          genLocalPrescription({
            prescriptionId: farmingPrescription.id,
            region: mixedPlanSampler.region,
            department: mixedPlanSampler.department,
            sampleCount: 3
          })
        ]
      }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByTestId('companySearch-input')
    ).not.toBeInTheDocument();

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: /Type de plan/ }),
      farmingSubPlan.id
    );

    await expect(await canvas.findByTestId('companySearch-input')).toHaveValue(
      ''
    );

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: /Type de plan/ }),
      slaughterhouseSubPlan.id
    );

    await waitFor(() =>
      expect(
        (canvas.getByTestId('companySearch-input') as HTMLInputElement).value
      ).toContain(SlaughterhouseCompanyFixture1.siret)
    );
  }
};
