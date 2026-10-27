import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import type { DaiSentMethod } from 'maestro-shared/schema/AnalysisDai/DaiSentMethod';
import type { FindAnalysisDaiOptions } from 'maestro-shared/schema/AnalysisDai/FindAnalysisDaiOptions';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { useContext, useState } from 'react';
import { ApiClientContext } from 'src/services/apiClient';
import { AnalysisDaiHistory } from 'src/views/SampleView/SampleOverview/AnalysisDaiHistory/AnalysisDaiHistory';
import { AnalysisDaiFilters } from './AnalysisDaiFilters';

export type Filters = {
  [K in 'states' | 'laboratoryIds']: NonNullable<FindAnalysisDaiOptions[K]>;
} & {
  sentMethod: DaiSentMethod | undefined;
  edi: Exclude<FindAnalysisDaiOptions['edi'], null>;
  sentDateFrom: string | undefined;
  sentDateTo: string | undefined;
};

export const AnalysisDaiAdminView = () => {
  const apiClient = useContext(ApiClientContext);
  const [filters, setFilters] = useState<Filters>({
    states: [],
    sentMethod: undefined,
    laboratoryIds: [],
    sentDateFrom: undefined,
    sentDateTo: undefined,
    edi: undefined
  });
  const [page, setPage] = useState(1);

  const { data } = apiClient.useGetAnalysisDaiQuery({
    states: filters.states.length ? filters.states : undefined,
    sentMethods: filters.sentMethod ? [filters.sentMethod] : undefined,
    laboratoryIds: filters.laboratoryIds.length
      ? filters.laboratoryIds
      : undefined,
    sentDateFrom: filters.sentDateFrom
      ? new Date(filters.sentDateFrom)
      : undefined,
    sentDateTo: filters.sentDateTo ? new Date(filters.sentDateTo) : undefined,
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
