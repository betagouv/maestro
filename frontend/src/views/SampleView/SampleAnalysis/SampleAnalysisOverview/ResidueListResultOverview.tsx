import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';

type Props = {};
export const ResidueListResultOverview: FunctionComponent<Props> = ({
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  return <div>TODO</div>;
};
