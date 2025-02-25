import 'openapi-explorer/dist/es/openapi-explorer';
import React, { useEffect } from 'react';
// @ts-expect-error TS7016
import { reactEventListener } from 'openapi-explorer/dist/es/react';
import config from 'src/utils/config';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'openapi-explorer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
export const OpenApiExplorerView = () => {
  // Necessary because react by default does not know how to listen to HTML5 events
  reactEventListener({ useEffect }, 'request');
  return (
    <openapi-explorer
      hide-server-selection={true}
      hide-authentication={true}
      spec-url={`${config.apiEndpoint}/api/api-docs`}
      server-url={`${config.apiEndpoint}/api`}
    />
  );
};
