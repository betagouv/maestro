import type { Meta, StoryObj } from '@storybook/react-vite';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { QuantityUnitList } from 'maestro-shared/referential/QuantityUnit';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { genPrescription } from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import {
  genCreatedSampleData,
  genSampleContextData
} from 'maestro-shared/test/sampleFixtures';
import { genAuthUser, Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ApiClient } from '../../../../services/apiClient';
import {
  defaultMockApiClientConf,
  getMockApi
} from '../../../../services/mockApiClient';
import ItemsStep from './ItemsStep';

const meta = {
  title: 'Views/SampleView/ItemsStep',
  component: ItemsStep,
  decorators: (Story) => (
    <div className="sample-overview">
      <Story />
    </div>
  )
} satisfies Meta<typeof ItemsStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const programmingPlan = genProgrammingPlan({
  kinds: ['PPV']
});
const prescription1 = genPrescription({
  programmingPlanId: programmingPlan.id,
  context: 'Control',
  matrixKind: 'A001M',
  stages: ['STADE1', 'STADE5']
});

const partialSample = {
  ...genSampleContextData(),
  ...genCreatedSampleData(),
  matrixKind: 'A0D9Y' as MatrixKind,
  prescriptionId: prescription1.id,
  programmingPlanId: programmingPlan.id,
  status: 'DraftItems' as const
};

export const OneItem: Story = {
  args: {
    partialSample
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) },
      programmingPlan: {
        programmingPlan
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByTestId('item-quantity-input-0')).toHaveLength(
      2
    );
    await expect(canvas.getAllByTestId('item-unit-select-0')).toHaveLength(2);
    await expect(canvas.getAllByTestId('item-sealid-input-0')).toHaveLength(2);
    await expect(
      canvas.queryByTestId('recipientKind-radio-0')
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByTestId('item-quantity-input-1')
    ).not.toBeInTheDocument();

    await expect(canvas.getByTestId('previous-button')).toBeInTheDocument();
    await expect(canvas.getByTestId('submit-button')).toBeInTheDocument();
  }
};

export const AddItem: Story = {
  args: {
    partialSample
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) },
      programmingPlan: {
        programmingPlan
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('add-item-button'));

    await expect(canvas.getAllByTestId('item-quantity-input-0')).toHaveLength(
      2
    );
    await expect(canvas.getAllByTestId('item-unit-select-0')).toHaveLength(2);
    await expect(canvas.getAllByTestId('item-sealid-input-0')).toHaveLength(2);
    await expect(canvas.getAllByTestId('item-quantity-input-1')).toHaveLength(
      2
    );
    await expect(canvas.getAllByTestId('item-unit-select-1')).toHaveLength(2);
    await expect(canvas.getAllByTestId('item-sealid-input-1')).toHaveLength(2);
    await expect(canvas.getAllByTestId('recipientKind-radio-1')).toHaveLength(
      1
    );
  }
};

export const RemoveItem: Story = {
  args: {
    partialSample
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) },
      programmingPlan: {
        programmingPlan
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('add-item-button'));
    await expect(
      canvas.getByTestId('remove-item-button-1')
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByTestId('remove-item-button-1'));

    await expect(
      canvas.queryByTestId('item-quantity-input-1')
    ).not.toBeInTheDocument();
  }
};

export const SubmittingErrors: Story = {
  args: {
    partialSample: {
      ...genSampleContextData(),
      ...genCreatedSampleData(),
      status: 'DraftItems' as const
    } as Sample
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) },
      programmingPlan: {
        programmingPlan
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('submit-button'));

    await expect(
      canvas.getByText('Veuillez renseigner la quantité.')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText("Veuillez renseigner l'unité de mesure.")
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Veuillez renseigner le numéro de scellé.')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(
        "Veuillez renseigner si l'échantillon respecte la directive 2002/63"
      )
    ).toBeInTheDocument();
  }
};

const mockCreateOrUpdateSample = fn().mockResolvedValue({});
const sampleContextData = genSampleContextData({});

export const SubmittingSuccess: Story = {
  args: {
    partialSample: {
      ...partialSample,
      items: [
        {
          sampleId: sampleContextData.id,
          itemNumber: 1,
          quantity: 1,
          quantityUnit: QuantityUnitList[0],
          sealId: '12a',
          recipientKind: 'Laboratory',
          compliance200263: false
        }
      ]
    } as Sample
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) },
      programmingPlan: {
        programmingPlan
      }
    },
    apiClient: getMockApi<ApiClient>({
      ...defaultMockApiClientConf,
      useCreateOrUpdateSampleMutation: [
        async (...args) => {
          const result = await mockCreateOrUpdateSample(...args);
          return result;
        },
        { isSuccess: true }
      ]
    })
  },
  play: async ({ canvasElement }) => {
    mockCreateOrUpdateSample.mockClear();

    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('submit-button'));

    await expect(mockCreateOrUpdateSample).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            quantity: 1,
            sealId: '12a',
            quantityUnit: QuantityUnitList[0],
            recipientKind: 'Laboratory',
            compliance200263: false
          })
        ]),
        status: 'Submitted'
      })
    );
  }
};
