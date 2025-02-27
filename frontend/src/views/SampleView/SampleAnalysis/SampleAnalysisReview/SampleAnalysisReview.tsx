import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';

interface Props {
  sample: Sample;
}


export const SampleAnalysisReview: FunctionComponent<Props> = ({sample, ...rest}) => {

  assert<Equals<keyof typeof rest, never>>()

  return <div {...rest}>Toto</div>
}