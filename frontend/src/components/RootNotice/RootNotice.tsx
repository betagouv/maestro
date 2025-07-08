import Notice from '@codegouvfr/react-dsfr/Notice';
import { Notice as NoticeType } from 'maestro-shared/schema/Notice/Notice';
import { FunctionComponent, useContext } from 'react';
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
  notice: NoticeType;
}> = ({ notice, ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    notice.title && (
      <Notice
        title={notice.title}
        description={notice.description}
        severity="warning"
        iconDisplayed={true}
        isClosable={true}
      />
    )
  );
};
