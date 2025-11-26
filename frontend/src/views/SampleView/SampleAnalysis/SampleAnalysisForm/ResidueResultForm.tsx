import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';

type Props = {
  residue: PartialResidue;
};
export const ResidueResultForm: FunctionComponent<Props> = ({
  residue,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  return <div>TODO</div>;
};
