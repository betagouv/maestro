import { isNil } from 'lodash-es';
import { assert, type Equals } from 'tsafe';
import YearSelector from '../YearSelector/YearSelector';

type Props = {
  title: string;
  year: number | undefined;
  years: number[];
  onChange: (year: number) => void;
};

export const YearTitle = ({
  title,
  year,
  years,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div className="d-flex-align-center">
      {title}{' '}
      {isNil(year) || years.length <= 1 ? (
        year
      ) : (
        <YearSelector year={year} years={years} onChange={onChange} />
      )}
    </div>
  );
};
