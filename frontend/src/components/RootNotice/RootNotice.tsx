import Notice from '@codegouvfr/react-dsfr/Notice';
import { FunctionComponent, useContext } from 'react';
import { Notice as RootNoticeType } from 'shared/schema/RootNotice/Notice';
import { assert, type Equals } from 'tsafe';
import { ApiClientContext } from '../../services/apiClient';

type Props = Record<never, never>;
export const RootNotice: FunctionComponent<Props> = ({ ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { useGetRootNoticeQuery } = useContext(ApiClientContext);

  const { data } = useGetRootNoticeQuery();

  return data && <RootNoticeComponent notice={data} />;
};
export const RootNoticeComponent: FunctionComponent<{
  notice: RootNoticeType;
}> = ({ notice, ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <Notice
      title={notice.title}
      description={notice.description}
      severity="warning"
      iconDisplayed={true}
      isClosable={true}
    />
  );
};
