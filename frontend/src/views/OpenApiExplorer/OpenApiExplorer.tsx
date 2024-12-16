import 'openapi-explorer';
import React, {  useEffect } from 'react';
// @ts-expect-error TS7016
import {reactEventListener} from 'openapi-explorer/dist/es/react'
import { authParams } from 'src/services/auth-headers';
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


  const onRequestFunction = (data: {detail: { request: {headers: Record<string, string>}}}) => {
    data.detail.request.headers = { ...data.detail.request.headers, ...authParams()}
  };

  // Necessary because react by default does not know how to listen to HTML5 events
  reactEventListener({ useEffect }, 'request', onRequestFunction);
  return (
    <openapi-explorer
      hide-server-selection={true}
      hide-authentication={true}
      spec-url={`${config.apiEndpoint}/api/api-docs`}
      server-url={`${config.apiEndpoint}/api`}
    />
  );
};
