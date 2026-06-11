import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SevesId } from 'maestro-shared/schema/Sample/Seves';
import { expect, within } from 'storybook/test';
import { SampleSeves } from './SampleSeves';

const meta = {
  title: 'Views/SampleView/SampleSeves',
  component: SampleSeves
} satisfies Meta<typeof SampleSeves>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FicheCreee: Story = {
  args: {
    sample: {
      seves: { id: 123456 as SevesId, numero: '123456' },
      hasResidueWithInterpretation: false,
      reference: 'GS-08-24-313-A'
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Fiche Sèves créée/)).toBeInTheDocument();
    await expect(canvas.getByText('Voir la fiche')).toBeInTheDocument();
  }
};

export const CreationConseillee: Story = {
  args: {
    sample: {
      seves: null,
      hasResidueWithInterpretation: true,
      reference: 'GS-08-24-313-A'
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Création d'une fiche Sèves conseillée.")
    ).toBeInTheDocument();
  }
};

export const AucunResidu: Story = {
  args: {
    sample: {
      seves: null,
      hasResidueWithInterpretation: false,
      reference: 'GS-08-24-313-A'
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByText("Création d'une fiche Sèves conseillée")
    ).not.toBeInTheDocument();
  }
};
