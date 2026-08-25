import { isNil, uniq } from 'lodash-es';
import type React from 'react';
import { useCallback, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { YearTitle } from 'src/components/YearTitle/YearTitle';
import { assert, type Equals } from 'tsafe';
import { ApiClientContext } from '../../../services/apiClient';
import { AppPage } from './AppPage';

interface Props {
  title: string;
  years?: number[];
  render: (year: number) => React.ReactNode;
}

export const AppPageWithYearTitle = ({
  title,
  years,
  render,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: programmingPlans = [] } =
    apiClient.useFindProgrammingPlansQuery({});

  const availableYears = useMemo(
    () =>
      uniq(years ?? programmingPlans.map((p) => p.year)).sort((a, b) => b - a),
    [years, programmingPlans]
  );

  const yearParam = searchParams.get('year');
  const selectedYear = yearParam ? Number(yearParam) : undefined;
  const year =
    isNil(selectedYear) || !availableYears.includes(selectedYear)
      ? availableYears[0]
      : selectedYear;

  const setYear = useCallback(
    (year: number) =>
      setSearchParams(
        (params) => {
          params.set('year', String(year));
          return params;
        },
        { replace: true }
      ),
    [setSearchParams]
  );

  return (
    <AppPage
      title={
        <YearTitle
          title={title}
          year={year}
          years={availableYears}
          onChange={setYear}
        />
      }
      documentTitle={title}
    >
      {isNil(year) ? null : render(year)}
    </AppPage>
  );
};
