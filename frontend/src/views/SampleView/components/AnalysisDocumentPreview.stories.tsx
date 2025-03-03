import type { Meta, StoryObj } from '@storybook/react';

import { AnalysisDocumentPreview  } from './AnalysisDocumentPreview';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { mockApiClient } from '../../../services/mockApiClient';

const meta = {
  title: 'Views/AnalysisDocumentPreview',
  component: AnalysisDocumentPreview
} satisfies  Meta<typeof AnalysisDocumentPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    reportDocumentId: 'fakeDocumentId',
    apiClient: mockApiClient
  }
};

export const DefaultWithChildren: Story = {
  args: {
    reportDocumentId: 'fakeDocumentId',
    apiClient: mockApiClient,
    children: (
      <Button
        priority="secondary"
        iconId="fr-icon-edit-line"
        className={cx('fr-mt-0')}
        onClick={() => {}}
      >
        Éditer
      </Button>
    )
  }
};
