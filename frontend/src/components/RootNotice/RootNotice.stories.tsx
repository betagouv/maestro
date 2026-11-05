import type { Meta, StoryObj } from '@storybook/react-vite';
import { RootNoticeComponent } from './RootNotice';

const meta = {
  title: 'Components/RootNotice',
  component: RootNoticeComponent
} satisfies Meta<typeof RootNoticeComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    notice: {
      type: 'root',
      title: 'Maintenance prévue',
      description: 'Le service sera indisponible samedi matin.'
    }
  }
};

export const Markdown: Story = {
  args: {
    notice: {
      type: 'root',
      title: 'Maintenance prévue',
      description: `Le service sera indisponible **samedi matin**, voir les [modalités](https://example.net).

Sont concernés :
- la saisie des prélèvements
- la programmation

Du HTML brut reste du texte : <script>alert(1)</script>`
    }
  }
};
