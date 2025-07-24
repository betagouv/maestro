import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';

type Props = Record<never, never>;
export const DashboardSamplesInReview: FunctionComponent<Props> = ({
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const samples = [
    {
      reference: 'GES-24-0008',
      localisation: 'Ferme de l"espérance',
      sample: 'Mechiel Dupis',
      type: 'Plan de contrôle',
      matrix: 'Avocats',
      status: 'InReview'
    }
  ] as const;

  return (
    <div>
      <span>Rapport à terminer</span>
      {samples.map((sample) => (
        <div>{sample.reference}</div>
      ))}
    </div>
  );
};
