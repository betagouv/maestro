import type { Meta, StoryObj } from '@storybook/react';

import { expect, fn, userEvent, within } from '@storybook/test';
import { screen } from '@storybook/testing-library';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { StagesByProgrammingPlanKind } from 'maestro-shared/referential/Stage';
import {
  genPrescription,
  genRegionalPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedSampleData,
  genSampleContextData
} from 'maestro-shared/test/sampleFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import { genAuthUser, genUser } from 'maestro-shared/test/userFixtures';
import { ApiClient } from '../../../../../services/apiClient';
import {
  defaultMockApiClientConf,
  getMockApi
} from '../../../../../services/mockApiClient';
import MatrixStep from '../MatrixStep';

const createOrUpdateMock = fn();
const meta = {
  title: 'Views/MatrixStep',
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
  role: 'Sampler'
});
const programmingPlan = genProgrammingPlan({
  kinds: ['PPV']
});
const prescription1 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrixKind: 'A001M',
  stages: [
    oneOf(StagesByProgrammingPlanKind['PPV']),
    oneOf(StagesByProgrammingPlanKind['PPV'])
  ]
});
const prescription2 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrixKind: 'A00TQ'
});
const regionalPrescription1 = genRegionalPrescription({
  prescriptionId: prescription1.id
});
const regionalPrescription2 = genRegionalPrescription({
  prescriptionId: prescription2.id
});

const story: Pick<Story, 'args' | 'parameters'> = {
  args: {
    partialSample: {
      ...genSampleContextData({
        programmingPlanId: programmingPlan.id
      }),
      ...genCreatedSampleData({ sampler })
    }
  },
  parameters: {
    preloadedState: {
      programmingPlan: {
        programmingPlan
      },
      auth: { authUser: genAuthUser(sampler) }
    },
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useFindPrescriptionsQuery: {
        data: [prescription1, prescription2]
      },
      useFindRegionalPrescriptionsQuery: {
        data: [regionalPrescription1, regionalPrescription2]
      }
    })
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

    await expect(canvas.getByTestId('previous-button')).toBeInTheDocument();
    await expect(canvas.getByTestId('save-button')).toBeInTheDocument();
    await expect(canvas.getByTestId('submit-button')).toBeInTheDocument();
  }
};

export const MatrixStepPPVSubmittingErrors: Story = {
  ...story,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('submit-button'));
    await expect(
      canvas.getByText(
        'Veuillez renseigner la catégorie de matrice programmée.'
      )
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Veuillez renseigner la matrice.')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Veuillez renseigner la partie du végétal.')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Veuillez renseigner le stade de prélèvement.')
    ).toBeInTheDocument();
  }
};

export const MatrixStepPPVSaveOnBlurWithoutHandlingErrors: Story = {
  ...story,
  parameters: {
    ...story.parameters,
    apiClient: {
      ...story.parameters?.apiClient,
      ...getMockApi<Pick<ApiClient, 'useCreateOrUpdateSampleMutation'>>({
        useCreateOrUpdateSampleMutation: [
          createOrUpdateMock,
          { isSuccess: false }
        ]
      })
    }
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);

    const matrixKindInput = canvas.getAllByTestId('matrix-kind-select')[0];
    const stageSelect = canvas.getAllByTestId('stage-select')[1];

    await userEvent.click(matrixKindInput);

    const matrixKindListbox = await screen.findByRole('listbox');

    expect(matrixKindListbox).toBeInTheDocument();
    await expect(within(matrixKindListbox).getAllByRole('option').length).toBe(
      2
    );

    await userEvent.selectOptions(
      matrixKindListbox,
      MatrixKindLabels[prescription1.matrixKind]
    );
    await userEvent.click(stageSelect);
    console.log('API Client mock:', parameters.apiClient);
    await expect(
      canvas.queryByText(
        'Veuillez renseigner la catégorie de matrice programmée.'
      )
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Veuillez renseigner la matrice.')
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Veuillez renseigner le stade de prélèvement.')
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Veuillez renseigner la partie du végétal.')
    ).not.toBeInTheDocument();

    await expect(createOrUpdateMock).toHaveBeenCalled();
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
//       fp.omitBy(
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
//         fp.isNil
//       )
//     );
//   }
// };
