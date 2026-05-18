import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import z from 'zod';
import { useForm } from '../../../hooks/useForm';
import AppMultipleInput from './AppMultipleInput';

const meta = {
  title: 'Components/MultipleInput',
  component: AppMultipleInput
} satisfies Meta<typeof AppMultipleInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {} as unknown as Story['args'],
  decorators: [
    (Story) => {
      const [values, setValues] = useState<string[]>([
        'foo@example.com',
        'bar@example.com'
      ]);
      const form = useForm(z.object({ emails: z.array(z.email()) }), {
        emails: values
      });
      const args: Story['args'] = {
        label: 'Emails',
        hintText: 'Une adresse par champ',
        values,
        onChange: setValues,
        inputForm: form,
        inputKey: 'emails',
        addLabel: 'Ajouter un email'
      };
      return <Story args={args} />;
    }
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const firstInput = canvas.getByLabelText('Emails — valeur 1');
    await expect(firstInput).toHaveValue('foo@example.com');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Ajouter un email' })
    );
    const thirdInput = await canvas.findByLabelText('Emails — valeur 3');
    await userEvent.type(thirdInput, 'baz@example.com');
    await expect(thirdInput).toHaveValue('baz@example.com');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Supprimer la valeur 1' })
    );
    await expect(canvas.queryByLabelText('Emails — valeur 3')).toBeNull();
    await expect(canvas.getByLabelText('Emails — valeur 1')).toHaveValue(
      'bar@example.com'
    );
    await expect(canvas.getByLabelText('Emails — valeur 2')).toHaveValue(
      'baz@example.com'
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Supprimer la valeur 2' })
    );
    await expect(canvas.getByLabelText('Emails — valeur 1')).toHaveValue(
      'bar@example.com'
    );
    await expect(
      canvas.queryByRole('button', { name: 'Supprimer la valeur 1' })
    ).toBeNull();
  }
};

export const Empty: Story = {
  args: {} as unknown as Story['args'],
  decorators: [
    (Story) => {
      const [values, setValues] = useState<string[]>([]);
      const form = useForm(z.object({ items: z.array(z.string()) }), {
        items: values
      });
      const args: Story['args'] = {
        label: 'Items',
        values,
        onChange: setValues,
        inputForm: form,
        inputKey: 'items',
        addLabel: 'Ajouter un item'
      };
      return <Story args={args} />;
    }
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByLabelText('Items — valeur 1');
    await expect(input).toHaveValue('');
    await expect(
      canvas.queryByRole('button', { name: 'Supprimer la valeur 1' })
    ).toBeNull();

    await userEvent.type(input, 'alpha');
    await expect(input).toHaveValue('alpha');
  }
};

export const Required: Story = {
  args: {} as unknown as Story['args'],
  decorators: [
    (Story) => {
      const [values, setValues] = useState<string[]>([]);
      const form = useForm(z.object({ tags: z.array(z.string().min(1)) }), {
        tags: values
      });
      const args: Story['args'] = {
        label: 'Tags',
        values,
        onChange: setValues,
        inputForm: form,
        inputKey: 'tags',
        required: true,
        addLabel: 'Ajouter un tag'
      };
      return <Story args={args} />;
    }
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Tags')).toBeInTheDocument();
    await expect(canvas.getByText('*')).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Ajouter un tag' })
    );
    const input = await canvas.findByLabelText('Tags — valeur 1');
    await expect(input).toBeRequired();

    await userEvent.type(input, 'alpha');
    await expect(input).toHaveValue('alpha');
  }
};
