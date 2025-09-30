import type { Meta, StoryObj } from '@storybook/react-vite';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { genSampleContextData } from 'maestro-shared/test/sampleFixtures';
import { genAuthUser, Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { expect, fn, userEvent, within } from 'storybook/test';
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

const programmingPlan = genProgrammingPlan({
  kinds: ['PPV']
});

export const EmptyForm: Story = {
  args: { programmingPlan },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) }
    }
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
  args: { programmingPlan },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) }
    }
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
  programmingPlanId: programmingPlan.id
});

export const SubmittingSuccess: Story = {
  args: {
    programmingPlan,
    partialSample: {
      ...sampleContextData,
      status: 'Draft' as const
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
      ]
    })
  },
  play: async ({ canvasElement }) => {
    mockCreateOrUpdateSample.mockClear();

    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('submit-button'));

    await expect(mockCreateOrUpdateSample).toHaveBeenCalledWith(
      expect.objectContaining({
        ...sampleContextData,
        status: 'DraftMatrix'
      })
    );
  }
};
