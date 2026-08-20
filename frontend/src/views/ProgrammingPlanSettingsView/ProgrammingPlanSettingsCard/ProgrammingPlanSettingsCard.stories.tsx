import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import {
  genProgrammingPlan,
  PesticideResidueDomainId
} from 'maestro-shared/test/programmingPlanFixtures';
import { expect, within } from 'storybook/test';
import { ProgrammingPlanSettingsCard } from './ProgrammingPlanSettingsCard';

const meta = {
  title: 'Components/ProgrammingPlanSettingsCard',
  component: ProgrammingPlanSettingsCard,
  args: {
    title: 'Résidus de pesticides',
    programmingPlans: [genProgrammingPlan({ year: 2026 })],
    linkProps: {
      to: AppRouteLinks.ProgrammingPlanSettingsDomainRoute.link(
        PesticideResidueDomainId,
        { year: 2026 }
      )
    },
    withPlanCount: true
  }
} satisfies Meta<typeof ProgrammingPlanSettingsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Domain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Résidus de pesticides')).toBeInTheDocument();
    await expect(canvas.getByText('1 plan / 1 sous-plan')).toBeInTheDocument();

    for (const title of ['Dupliquer', 'Supprimer']) {
      const button = canvas.getByTitle(title);
      const { left, top, width, height } = button.getBoundingClientRect();
      const topElement = document.elementFromPoint(
        left + width / 2,
        top + height / 2
      );
      await expect(button.contains(topElement)).toBe(true);
    }
  }
};

export const Plan: Story = {
  args: {
    title: 'Plan de surveillance',
    linkProps: {
      to: AppRouteLinks.ProgrammingPlanSettingsPlanRoute.link(
        PesticideResidueDomainId,
        'e0a9de3a-4f9a-4c0f-9a03-1f0dd4a3e6f1',
        { year: 2026 }
      )
    },
    withPlanCount: false
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Plan de surveillance')).toBeInTheDocument();
    await expect(canvas.getByText('1 sous-plan')).toBeInTheDocument();
  }
};
