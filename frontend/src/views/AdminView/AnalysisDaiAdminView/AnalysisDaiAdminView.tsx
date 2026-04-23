import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import type { AnalysisDaiSentMethod } from 'maestro-shared/schema/AnalysisDai/AnalysisDaiSentMethod';
import type { AnalysisDaiState } from 'maestro-shared/schema/AnalysisDai/AnalysisDaiState';
import type { FindAnalysisDaiOptions } from 'maestro-shared/schema/AnalysisDai/FindAnalysisDaiOptions';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { useContext, useState } from 'react';
import { ApiClientContext } from 'src/services/apiClient';
import { AnalysisDaiHistory } from 'src/views/SampleView/SampleOverview/AnalysisDaiHistory/AnalysisDaiHistory';
import { AnalysisDaiFilters } from './AnalysisDaiFilters';

export type Filters = {
  [K in 'states' | 'sentMethods' | 'laboratoryIds']: NonNullable<
    FindAnalysisDaiOptions[K]
  >;
} & {
  edi: Exclude<FindAnalysisDaiOptions['edi'], null>;
  sentDateFrom: string | undefined;
  sentDateTo: string | undefined;
};

export const AnalysisDaiAdminView = () => {
  const apiClient = useContext(ApiClientContext);
  const [filters, setFilters] = useState<Filters>({
    states: [] as AnalysisDaiState[],
    sentMethods: [] as AnalysisDaiSentMethod[],
    laboratoryIds: [],
    sentDateFrom: undefined,
    sentDateTo: undefined,
    edi: undefined
  });
  const [page, setPage] = useState(1);

  const { data } = apiClient.useGetAnalysisDaiQuery({
    states: filters.states.length ? filters.states : undefined,
    sentMethods: filters.sentMethods.length ? filters.sentMethods : undefined,
    laboratoryIds: filters.laboratoryIds.length
      ? filters.laboratoryIds
      : undefined,
    sentDateFrom: filters.sentDateFrom,
    sentDateTo: filters.sentDateTo,
    edi: filters.edi,
    page,
    perPage: defaultPerPage
  });

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery({});

  const analyses = data?.analyses ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.ceil(total / defaultPerPage);

  const updateFilter = (updates: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1);
  };

  return (
    <div>
      <AnalysisDaiFilters
        filters={filters}
        laboratories={laboratories ?? []}
        onChange={updateFilter}
      />

      <AnalysisDaiHistory analyses={analyses} showSampleReference={true} />

      {pageCount > 1 && (
        <Pagination
          count={pageCount}
          defaultPage={page}
          getPageLinkProps={(p) => ({
            onClick: (e) => {
              e.preventDefault();
              setPage(p);
            },
            href: '#'
          })}
          className={cx('fr-mt-5w')}
        />
      )}
    </div>
  );
};
