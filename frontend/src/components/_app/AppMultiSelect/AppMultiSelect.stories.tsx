import type { Meta, StoryObj } from '@storybook/react-vite';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import z from 'zod';
import { useForm } from '../../../hooks/useForm';
import { AppMultiSelect } from './AppMultiSelect';

const meta = {
  title: 'Components/MultiSelect',
  component: AppMultiSelect
} satisfies Meta<typeof AppMultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as unknown as Story['args'],
  decorators: [
    (Story) => {
      const form = useForm(z.object({ region: z.array(Region) }), {});

      const [regions, setRegions] = useState<Region[]>([]);

      const keysWithLabels = RegionList.reduce(
        (acc, r) => {
          acc[r] = Regions[r].name;
          return acc;
        },
        {} as Record<Region, string>
      );

      const args: Story['args'] = {
        label: 'Régions',
        items: Region.options,
        values: regions,
        inputForm: form,
        inputKey: 'region',
        keysWithLabels,
        defaultLabel: 'région sélectionnée',
        onChange: (r) => setRegions(r as Region[])
      };

      return <Story args={args} />;
    }
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.selectOptions(canvas.getByLabelText(`Régions`), '53');
    await expect(canvas.getByLabelText('Régions')).toHaveValue('');
    await expect(
      within(canvas.getByLabelText('Régions'))
        .getAllByRole('option')[0]
        .getAttribute('label')
    ).toBe('1 région sélectionnée');

    await userEvent.selectOptions(canvas.getByLabelText(`Régions`), '11');
    await expect(
      within(canvas.getByLabelText('Régions'))
        .getAllByRole('option')[0]
        .getAttribute('label')
    ).toBe('2 régions sélectionnées');

    await userEvent.click(canvas.getByText(Regions['53'].name));
    await userEvent.click(canvas.getByText(Regions['11'].name));
    await expect(
      within(canvas.getByLabelText('Régions'))
        .getAllByRole('option')[0]
        .getAttribute('label')
    ).toBe('Sélectionner une valeur');
  }
};
