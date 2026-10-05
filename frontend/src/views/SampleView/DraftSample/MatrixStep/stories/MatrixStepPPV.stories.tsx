import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import {
  genLocalPrescription,
  genPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import {
  genProgrammingPlan,
  PPVValidatedSubPlanFixture,
  PPVValidatedSubPlanId,
  withMatrixKindSubPlans
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedSampleData,
  genSampleContextData
} from 'maestro-shared/test/sampleFixtures';
import { PPVFieldConfigs } from 'maestro-shared/test/specificDataFixtures';
import { genAuthUser, genUser } from 'maestro-shared/test/userFixtures';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import {
  getMockApi,
  type MockApi
} from '../../../../../services/mockApiClient';
import MatrixStep from '../MatrixStep';

const createOrUpdateMock = fn();
const meta = {
  title: 'Views/SampleView/MatrixStep',
  component: MatrixStep,
  decorators: (Story) => (
    <div className="sample-overview">
      <Story />
    </div>
  ),
  async beforeEach() {
    return () => {
      createOrUpdateMock.mockReset();
    };
  }
} satisfies Meta<typeof MatrixStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampler = genUser({
  roles: ['Sampler'],
  region: '44',
  programmingSubPlanIds: [PPVValidatedSubPlanId]
});
const programmingPlan = withMatrixKindSubPlans(
  genProgrammingPlan({
    subPlans: [PPVValidatedSubPlanFixture],
    distributionKind: 'REGIONAL'
  }),
  ['A001M', 'A00TQ']
);
const prescription1 = genPrescription({
  programmingSubPlanId: programmingPlan.subPlans[0].id
});
const prescription2 = genPrescription({
  programmingSubPlanId: programmingPlan.subPlans[1].id
});
const regionalPrescription1 = genLocalPrescription({
  prescriptionId: prescription1.id,
  region: sampler.region
});
const regionalPrescription2 = genLocalPrescription({
  prescriptionId: prescription2.id,
  region: sampler.region
});

const storyMockApi: Partial<MockApi> = {
  useGetProgrammingPlanQuery: {
    data: programmingPlan
  },
  useFindPrescriptionsQuery: {
    data: [prescription1, prescription2]
  },
  useFindLocalPrescriptionsQuery: {
    data: [regionalPrescription1, regionalPrescription2]
  },
  useFindProgrammingSubPlanFieldConfigsQuery: {
    data: PPVFieldConfigs
  }
};

const story: Pick<Story, 'args' | 'parameters'> = {
  args: {
    partialSample: {
      ...genSampleContextData({
        programmingPlanId: programmingPlan.id,
        sampler
      }),
      ...genCreatedSampleData()
    }
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(sampler) },
      programmingPlan: {
        programmingPlan
      }
    },
    apiClient: getMockApi(storyMockApi)
  }
};

export const MatrixStepPPV: Story = {
  ...story,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByTestId('matrix-kind-select')).toHaveLength(1);
    await expect(canvas.getAllByTestId('matrix-select')).toHaveLength(1);
    await expect(canvas.getAllByTestId('stage-select')).toHaveLength(2);
    await expect(canvas.getAllByTestId('matrixdetails-input')).toHaveLength(2);
    await expect(canvas.getAllByTestId('culturekind-select')).toHaveLength(2);
    await expect(canvas.getAllByTestId('matrixpart-select')).toHaveLength(2);
    await expect(
      canvas.getByLabelText('Contrôle libératoire')
    ).toBeInTheDocument();
    await expect(canvas.getAllByTestId('notes-input')).toHaveLength(2);

    await expect(canvas.getAllByTestId('previous-button')).toHaveLength(2);
    await expect(canvas.getByTestId('save-button')).toBeInTheDocument();
    await expect(canvas.getByTestId('submit-button')).toBeInTheDocument();
  }
};

export const MatrixStepPPVWithoutPrescriptions: Story = {
  ...story,
  parameters: {
    ...story.parameters,
    apiClient: {
      ...getMockApi({
        ...storyMockApi,
        useFindPrescriptionsQuery: {
          data: []
        }
      })
    }
  },
  args: {
    ...story.args,
    partialSample: {
      ...story.args.partialSample,
      context: 'Surveillance',
      matrices: undefined
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Aucune matrice programmée pour le plan de surveillance')
    ).toBeInTheDocument();
  }
};

export const MatrixStepPPVFieldConfigsLoading: Story = {
  ...story,
  parameters: {
    ...story.parameters,
    apiClient: {
      ...getMockApi({
        ...storyMockApi,
        useFindProgrammingSubPlanFieldConfigsQuery: { data: undefined }
      })
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('submit-button')).toBeDisabled();
  }
};

export const MatrixStepPPVSubmittingErrors: Story = {
  ...story,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('submit-button'));
    await expect(
      canvas.queryByText(
        'Veuillez renseigner la catégorie de matrice programmée.'
      )
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByText('Veuillez renseigner la matrice.')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Veuillez renseigner le champ « Type de production ».')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Veuillez renseigner le champ « Stade de prélèvement ».')
    ).toBeInTheDocument();
  }
};

export const MatrixStepPPVSaveOnBlurWithoutHandlingErrors: Story = {
  ...story,
  parameters: {
    ...story.parameters,
    apiClient: {
      ...getMockApi({
        ...storyMockApi,
        useCreateOrUpdateSampleMutation: [
          createOrUpdateMock,
          { isSuccess: false }
        ]
      })
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const matrixKindInput = canvas.getAllByTestId('matrix-kind-select')[0];
    const stageSelect = canvas.getAllByTestId('stage-select')[1];

    await userEvent.click(matrixKindInput);

    const matrixKindListbox = await screen.findByRole('listbox');

    await expect(matrixKindListbox).toBeInTheDocument();
    await expect(within(matrixKindListbox).getAllByRole('option').length).toBe(
      1
    );

    await userEvent.selectOptions(matrixKindListbox, MatrixKindLabels.A001M);
    await userEvent.click(stageSelect);
    await expect(
      canvas.queryByText(
        'Veuillez renseigner la catégorie de matrice programmée.'
      )
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Veuillez renseigner la matrice.')
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText(
        'Veuillez renseigner le champ « Stade de prélèvement ».'
      )
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Veuillez renseigner la partie du végétal.')
    ).not.toBeInTheDocument();

    await waitFor(() => expect(createOrUpdateMock).toHaveBeenCalled());
  }
};

const andSubPlan = {
  ...PPVValidatedSubPlanFixture,
  matrices: {
    operator: 'And' as const,
    items: [
      {
        matrixKind: 'A00QT' as const,
        matrices: ['A00QV', 'A00QX'] as Matrix[]
      },
      { matrixKind: 'A01GP' as const, matrices: ['A01GQ'] as Matrix[] }
    ]
  }
};
const andProgrammingPlan = genProgrammingPlan({
  subPlans: [andSubPlan],
  distributionKind: 'REGIONAL'
});
const andPrescription = genPrescription({
  programmingSubPlanId: andSubPlan.id
});

export const MatrixStepPPVAnd: Story = {
  args: {
    partialSample: {
      ...genSampleContextData({
        programmingPlanId: andProgrammingPlan.id,
        programmingSubPlanId: andSubPlan.id,
        context: 'Control',
        sampler
      }),
      ...genCreatedSampleData()
    }
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(sampler) },
      programmingPlan: {
        programmingPlan: andProgrammingPlan
      }
    },
    apiClient: getMockApi({
      ...storyMockApi,
      useGetProgrammingPlanQuery: { data: andProgrammingPlan },
      useFindPrescriptionsQuery: { data: [andPrescription] },
      useFindLocalPrescriptionsQuery: {
        data: [
          genLocalPrescription({
            prescriptionId: andPrescription.id,
            region: sampler.region
          })
        ]
      },
      useCreateOrUpdateSampleMutation: [
        createOrUpdateMock,
        { isSuccess: false }
      ]
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const matrixKindInputs = canvas.getAllByTestId('matrix-kind-select');
    await expect(matrixKindInputs).toHaveLength(2);
    await expect(matrixKindInputs[0]).toBeDisabled();
    await expect(matrixKindInputs[0]).toHaveValue(MatrixKindLabels.A00QT);
    await expect(matrixKindInputs[1]).toHaveValue(MatrixKindLabels.A01GP);

    await userEvent.click(canvas.getAllByTestId('matrix-select')[0]);
    const matrixListbox = await screen.findByRole('listbox');
    await expect(within(matrixListbox).getAllByRole('option')).toHaveLength(2);
    await userEvent.selectOptions(matrixListbox, MatrixLabels.A00QV);

    await waitFor(() =>
      expect(createOrUpdateMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          matrices: [
            { matrixKind: 'A00QT', matrix: 'A00QV' },
            { matrixKind: 'A01GP', matrix: 'A01GQ' }
          ]
        })
      )
    );
  }
};

// const createdSample = {
//   ...genSampleContextData({
//     programmingPlanId: programmingPlan.id,
//     context: 'Control'
//   }),
//   ...genCreatedSampleData({ sampler }),
//   prescriptionId: prescription1.id
// };

// export const MatrixStepPPVSubmitSampleAndUpdatingStatus: Story = {
//   ...story,
//   args: {
//     ...story.args,
//     partialSample: createdSample
//   },
//   parameters: MatrixStepPPVSaveOnBlurWithoutHandlingErrors.parameters,
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//
//     const matrixKindInput = canvas.getAllByTestId('matrix-kind-select')[0];
//     const matrixInput = canvas.getAllByTestId('matrix-select')[0];
//     const stageSelect = canvas.getAllByTestId('stage-select')[1];
//     const matrixDetailsInput = canvas.getAllByTestId('matrixdetails-input')[1];
//     const cultureKindSelect = canvas.getAllByTestId('culturekind-select')[1];
//     const matrixPartSelect = canvas.getAllByTestId('matrixpart-select')[1];
//     const notesInput = canvas.getAllByTestId('notes-input')[1];
//     const submitButton = canvas.getByTestId('submit-button');
//
//     await userEvent.click(matrixKindInput);
//
//     const matrixKindListbox = await screen.findByRole('listbox');
//
//     await userEvent.selectOptions(
//       matrixKindListbox,
//       MatrixKindLabels[prescription1.matrixKind]
//     ); //1 call
//     await userEvent.click(matrixInput);
//
//     const matrixListbox = await screen.findByRole('listbox');
//
//     await userEvent.selectOptions(
//       matrixListbox,
//       MatrixLabels[MatrixListByKind[prescription1.matrixKind][1]]
//     ); //1 call
//
//     await userEvent.selectOptions(stageSelect, prescription1.stages[1]); //1 call
//     await userEvent.type(matrixDetailsInput, 'Details'); //7 calls
//     await userEvent.selectOptions(cultureKindSelect, CultureKindList[0]); //1 call
//     await userEvent.selectOptions(matrixPartSelect, MatrixPartList[0]); //1 call
//     await userEvent.type(notesInput, 'Comment'); //7 calls
//     await userEvent.click(submitButton); //1 call
//
//     await expect(createOrUpdateMock).toHaveBeenCalledTimes(20);
//     await expect(createOrUpdateMock).toHaveBeenLastCalledWith(
//       omitBy(
//         {
//           ...createdSample,
//           createdAt: createdSample.createdAt,
//           lastUpdatedAt: createdSample.lastUpdatedAt,
//           sampledAt: createdSample.sampledAt,
//           status: 'DraftItems',
//           matrixKind: prescription1.matrixKind,
//           matrix: MatrixListByKind[prescription1.matrixKind][1],
//           specificData: {
//             matrixPart: MatrixPartList[0],
//             matrixDetails: 'Details',
//             programmingPlanKind: 'PPV',
//             cultureKind: CultureKindList[0],
//             releaseControl: undefined,
//             stage: prescription1.stages[1]
//           },
//           notesOnMatrix: 'Comment'
//         },
//         isNil
//       )
//     );
//   }
// };
