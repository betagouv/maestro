import { createModal } from '@codegouvfr/react-dsfr/Modal';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LaboratoryListFixture } from 'maestro-shared/test/laboratoryFixtures';
import { fn } from 'storybook/test';
import { v4 as uuidv4 } from 'uuid';
import LaboratoryAgreementsModal, {
  type ModalInstance
} from './LaboratoryAgreementsModal';

const storyModal = createModal({
  id: 'agreements-modal-story',
  isOpenedByDefault: false
}) as ModalInstance;

const programmingPlanId = uuidv4();

const laboratories = LaboratoryListFixture;

const selectedGroup = {
  programmingPlanId,
  programmingPlanKind: 'PPV',
  substanceKind: 'Any'
};

const agreements = [
  {
    laboratoryId: laboratories[0].id,
    laboratoryName: laboratories[0].name,
    laboratoryShortName: laboratories[0].shortName,
    programmingPlanId,
    programmingPlanKind: 'PPV' as const,
    programmingPlanYear: 2026,
    substanceKind: 'Any' as const,
    referenceLaboratory: true,
    detectionAnalysis: true,
    confirmationAnalysis: false
  },
  {
    laboratoryId: laboratories[1].id,
    laboratoryName: laboratories[1].name,
    laboratoryShortName: laboratories[1].shortName,
    programmingPlanId,
    programmingPlanKind: 'PPV' as const,
    programmingPlanYear: 2026,
    substanceKind: 'Any' as const,
    referenceLaboratory: false,
    detectionAnalysis: true,
    confirmationAnalysis: true
  }
];

const meta = {
  title: 'Views/LaboratoryAgreementsView/LaboratoryAgreementsModal',
  component: LaboratoryAgreementsModal,
  args: {
    modal: storyModal,
    selectedGroup,
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
