import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import type {
  AnalysisRaiSource,
  AnalysisRaiState
} from 'maestro-shared/schema/AnalysisRai/AnalysisRai';
import type { FindAnalysisRaiOptions } from 'maestro-shared/schema/AnalysisRai/FindAnalysisRaiOptions';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { useContext, useState } from 'react';
import { ApiClientContext } from 'src/services/apiClient';
import { AnalysisRaiHistory } from 'src/views/SampleView/SampleOverview/AnalysisRaiHistory/AnalysisRaiHistory';
import { AnalysisRaiFilters } from './AnalysisRaiFilters';

export type Filters = {
  state: AnalysisRaiState | undefined;
  source: AnalysisRaiSource | undefined;
  laboratoryIds: NonNullable<FindAnalysisRaiOptions['laboratoryIds']>;
  edi: Exclude<FindAnalysisRaiOptions['edi'], null>;
  receivedAtFrom: string | undefined;
  receivedAtTo: string | undefined;
};

export const AnalysisRaiAdminView = () => {
  const apiClient = useContext(ApiClientContext);
  const [filters, setFilters] = useState<Filters>({
    state: undefined,
    source: undefined,
    laboratoryIds: [],
    receivedAtFrom: undefined,
    receivedAtTo: undefined,
    edi: undefined
  });
  const [page, setPage] = useState(1);

  const { data } = apiClient.useGetAnalysisRaiQuery({
    states: filters.state ? [filters.state] : undefined,
    sources: filters.source ? [filters.source] : undefined,
    laboratoryIds: filters.laboratoryIds.length
      ? filters.laboratoryIds
      : undefined,
    receivedAtFrom: filters.receivedAtFrom
      ? new Date(filters.receivedAtFrom)
      : undefined,
    receivedAtTo: filters.receivedAtTo
      ? new Date(filters.receivedAtTo)
      : undefined,
    edi: filters.edi,
    page,
    perPage: defaultPerPage
  });

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery({});

  const rais = data?.rais ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.ceil(total / defaultPerPage);

  const updateFilter = (updates: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1);
  };

  return (
    <div>
      <AnalysisRaiFilters
        filters={filters}
        laboratories={laboratories ?? []}
        onChange={updateFilter}
      />

      <AnalysisRaiHistory rais={rais} showSampleReference={true} />

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
