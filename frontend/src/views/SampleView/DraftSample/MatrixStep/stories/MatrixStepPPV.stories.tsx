import type { Meta, StoryObj } from '@storybook/react';

import { expect, userEvent, within } from '@storybook/test';
import { StageList } from 'maestro-shared/referential/Stage';
import { genPrescription } from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedSampleData,
  genSampleContextData
} from 'maestro-shared/test/sampleFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import { genUser } from 'maestro-shared/test/userFixtures';
import { ApiClient } from '../../../../../services/apiClient';
import {
  defaultMockApiClientConf,
  getMockApi
} from '../../../../../services/mockApiClient';
import MatrixStep from '../MatrixStep';

const meta = {
  title: 'Views/MatrixStep',
  component: MatrixStep,
  decorators: (Story) => (
    <div className="sample-overview">
      <Story />
    </div>
  )
} satisfies Meta<typeof MatrixStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampler = genUser({
  roles: ['Sampler']
});
const programmingPlan = genProgrammingPlan({
  domain: 'PPV'
});
const prescription1 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrixKind: 'A001M',
  stages: [oneOf(StageList), oneOf(StageList)]
});
const prescription2 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrixKind: 'A00TQ'
});

export const MatrixStepPPV: Story = {
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
      }
    },
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useFindPrescriptionsQuery: {
        data: [prescription1, prescription2]
      }
    })
  },
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
      }
    },
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useFindPrescriptionsQuery: {
        data: [prescription1, prescription2]
      }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('submit-button'));
    expect(
      canvas.getByText(
        'Veuillez renseigner la catégorie de matrice programmée.'
      )
    ).toBeInTheDocument();
    expect(
      canvas.getByText('Veuillez renseigner la matrice.')
    ).toBeInTheDocument();
    expect(
      canvas.getByText('Veuillez renseigner la partie du végétal.')
    ).toBeInTheDocument();
    expect(
      canvas.getByText('Veuillez renseigner le stade de prélèvement.')
    ).toBeInTheDocument();
  }
};
