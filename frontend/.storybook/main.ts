import type { StorybookConfig } from '@storybook/react-vite';

import { join, dirname } from "path"

/**
* This function is used to resolve the absolute path of a package.
* It is needed in projects that use Yarn PnP or are set up within a monorepo.
*/
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}
const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.tsx"
  ],
  "addons": [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath("@storybook/experimental-addon-test")
  ],
  "framework": {
    "name": getAbsolutePath('@storybook/react-vite'),
    "options": {}
  },
  core: {
    disableWhatsNewNotifications: true,
    enableCrashReports: false
  },
  async viteFinal(config){
    const { mergeConfig } = await import('vite')
    return mergeConfig(config, {
      base: '/storybook',
    })
  }
};
export default config;