import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import {
  genProgrammingPlan,
  NationalCoordinatorEmail,
  NationalCoordinatorId,
  NationalCoordinatorName,
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
        PesticideResidueDomainId
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
    await expect(canvas.getByText(NationalCoordinatorName)).toBeInTheDocument();
  }
};

export const DomainWithSeveralPlans: Story = {
  args: {
    programmingPlans: [
      genProgrammingPlan({ year: 2026 }),
      genProgrammingPlan({
        year: 2026,
        nationalCoordinators: [
          {
            id: NationalCoordinatorId,
            name: NationalCoordinatorName,
            email: NationalCoordinatorEmail
          },
          {
            id: '14141414-1414-1414-1414-141414141414',
            name: 'Damien Coordination',
            email: 'damien.coordination@example.net'
          },
          {
            id: '15151515-1515-1515-1515-151515151515',
            name: null,
            email: 'zoe.coordination@example.net'
          }
        ]
      })
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('2 plans / 2 sous-plans')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(
        `Damien Coordination, ${NationalCoordinatorName}, zoe.coordination@example.net`
      )
    ).toBeInTheDocument();
  }
};

export const Plan: Story = {
  args: {
    title: 'Plan de surveillance',
    linkProps: {
      to: AppRouteLinks.ProgrammingPlanSettingsPlanRoute.link(
        'e0a9de3a-4f9a-4c0f-9a03-1f0dd4a3e6f1'
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
