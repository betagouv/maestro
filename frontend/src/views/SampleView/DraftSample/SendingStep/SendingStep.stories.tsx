import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { genPrescription } from 'maestro-shared/test/prescriptionFixtures';
import { genProgrammingPlan } from 'maestro-shared/test/programmingPlanFixtures';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { genAuthUser, Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { fn, userEvent, within } from 'storybook/test';
import { getMockApi } from '../../../../services/mockApiClient';
import SendingStep from './SendingStep';

const meta = {
  title: 'Views/SampleView/SendingStep',
  component: SendingStep,
  decorators: (Story) => (
    <div className="sample-overview">
      <Story />
    </div>
  )
} satisfies Meta<typeof SendingStep>;

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

export const Complet: Story = {
  args: {
    sample: {
      ...Sample11Fixture,
      status: 'InReview',
      receivedAt: new Date(12345),
      ownerAgreement: true,
      ownerFirstName: 'John',
      ownerLastName: 'John',
      ownerEmail: 'john.john@john.john',
      matrixKind: 'A0D9Y',
      prescriptionId: prescription1.id,
      programmingPlanId: programmingPlan.id
    } as Sample
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(Sampler1Fixture) },
      programmingPlan: {
        programmingPlan
      }
    },
    apiClient: getMockApi({
      useUpdateSampleMutation: [async () => fn(), { isSuccess: false }]
    })
  }
};
export const CompletConfirmation: Story = {
  ...Complet,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sendButton = canvas.getByText('Envoyer la demande d’analyse');

    await userEvent.click(sendButton);
  }
};
