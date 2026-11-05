import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardNotice } from './DashboardNotice';

const meta = {
  title: 'Views/DashboardView/DashboardNotice',
  component: DashboardNotice
} satisfies Meta<typeof DashboardNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    description: `Merci pour vos retours`,
    className: ''
  }
};

export const Markdown: Story = {
  args: {
    description: `Un mot en **gras**, un autre en *italique* et un [lien](https://example.net).

Les nouveautés :
- première nouveauté
- seconde nouveauté

Les étapes :
1. première étape
2. seconde étape

Du HTML brut reste du texte : <script>alert(1)</script>`,
    className: ''
  }
};
