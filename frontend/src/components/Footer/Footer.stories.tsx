import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { MuiDsfrThemeProvider } from '../../App';
import Header from '../Header/Header';
import Footer from './Footer';

const meta = {
  title: 'Components/Footer',
  component: Footer,
  args: { onSelect: fn() },
  decorators: [
    (Story) => (
      <MuiDsfrThemeProvider>
        {/*Footer requires Header to be rendered, but we hide it in the story*/}
        <div className={cx('fr-hidden')}>
          <Header />
        </div>
        <div data-testid="footer-container">
          <Story />
        </div>
      </MuiDsfrThemeProvider>
    )
  ]
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const footerContainer = canvas.getByTestId('footer-container');

    await expect(
      within(footerContainer).getByTitle('Accueil')
    ).toBeInTheDocument();
  }
};
