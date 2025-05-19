import type { Meta, StoryObj } from '@storybook/react';

import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { AnalysisDocumentPreview } from './AnalysisDocumentPreview';

const meta = {
  title: 'Views/AnalysisDocumentPreview',
  component: AnalysisDocumentPreview
} satisfies Meta<typeof AnalysisDocumentPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    reportDocumentId: 'fakeDocumentId'
  }
};

export const DefaultWithChildren: Story = {
  args: {
    reportDocumentId: 'fakeDocumentId',
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
