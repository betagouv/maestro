import type { Preview } from '@storybook/react'
import "@codegouvfr/react-dsfr/main.css";
import { startReactDsfr } from '@codegouvfr/react-dsfr/spa';
import { withRouter } from 'storybook-addon-remix-react-router';

startReactDsfr({
  "defaultColorScheme": "system",
  "useLang": () => "fr",
});
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    layout: 'centered'
  },
  decorators: [withRouter]
};

export default preview;