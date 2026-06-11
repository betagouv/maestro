import { createModal } from '@codegouvfr/react-dsfr/Modal';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LaboratoryListFixture } from 'maestro-shared/test/laboratoryFixtures';
import { fn } from 'storybook/test';
import { v4 as uuidv4 } from 'uuid';
import { LaboratoryAgreementDetailProvider } from '../../../components/LaboratoryAgreement/LaboratoryAgreementDetailModal/LaboratoryAgreementDetailContext';
import LaboratoryAgreementsModal, {
  type ModalInstance
} from './LaboratoryAgreementsModal';

const storyModal = createModal({
  id: 'agreements-modal-story',
  isOpenedByDefault: false
}) as ModalInstance;

const programmingSubPlanId = uuidv4();

const laboratories = LaboratoryListFixture;

const agreements = [
  {
    laboratoryId: laboratories[0].id,
    programmingSubPlanId,
    substanceKind: 'Any' as const,
    referenceLaboratory: true,
    detectionAnalysis: true,
    confirmationAnalysis: false
  },
  {
    laboratoryId: laboratories[1].id,
    programmingSubPlanId,
    substanceKind: 'Any' as const,
    referenceLaboratory: false,
    detectionAnalysis: true,
    confirmationAnalysis: true
  }
];

const meta = {
  title: 'Views/LaboratoryAgreementsView/LaboratoryAgreementsModal',
  component: LaboratoryAgreementsModal,
  decorators: [
    (Story) => (
      <LaboratoryAgreementDetailProvider>
        <Story />
      </LaboratoryAgreementDetailProvider>
    )
  ],
  args: {
    modal: storyModal,
    laboratoryAgreementRowKeys: [
      {
        programmingSubPlanId,
        substanceKind: 'Any' as const
      }
    ],
    agreements,
    laboratories,
    onSave: fn()
  }
} as Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async () => {
    storyModal.open();
  }
};
