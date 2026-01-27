import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import Select from '@codegouvfr/react-dsfr/Select';
import { skipToken } from '@reduxjs/toolkit/query';
import clsx from 'clsx';
import { getResidueKind } from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import { SSD2Referential } from 'maestro-shared/referential/Residue/SSD2Referential';
import {
  ResidueKind,
  ResidueKindLabels
} from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { useContext, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import microscope from 'src/assets/illustrations/microscope.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ApiClientContext } from '../../services/apiClient';
import { getURLQuery } from '../../utils/fetchUtils';
import { pluralize } from '../../utils/stringUtils';
import LaboratoryAnalyticalCompetencesForm from './LaboratoryAnalyticalCompetenceForm';
import './LaboratoryAnalyticalCompetences.scss';

const LaboratoryAnalyticalCompetencesView = () => {
  useDocumentTitle('Compétence analytique des laboratoires');
  const apiClient = useContext(ApiClientContext);
  const { user } = useAuthentication();

  const [searchParams] = useSearchParams();

  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const allResidues = Object.entries(SSD2Referential);
  const [laboratoryId, setLaboratoryId] = useState(user?.laboratoryId);
  const [residueKind, setResidueKind] = useState<ResidueKind>();
  const [residueSearch, setResidueSearch] = useState('');

  const { data: laboratoryAnalyticalCompetences } =
    apiClient.useGetLaboratoryAnalyticalCompetencesQuery(
      laboratoryId ?? skipToken
    );

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery({
    programmingPlanKind: 'PPV'
  });

  const filteredResidues = useMemo(
    () =>
      allResidues
        .filter(([, ssd2Referential]) =>
          residueKind
            ? getResidueKind(ssd2Referential.reference) === residueKind
            : true
        )
        .filter(([ssd2Code, ssd2Referential]) =>
          residueSearch
            ? ssd2Code
                .toLowerCase()
                .includes(residueSearch.toLowerCase().trim()) ||
              ssd2Referential.name
                .toLowerCase()
                .includes(residueSearch.toLowerCase().trim())
            : true
        ),
    [allResidues, residueKind, residueSearch]
  );

  const paginatedResidues = useMemo(
    () =>
      filteredResidues.slice(
        (page - 1) * defaultPerPage,
        page * defaultPerPage
      ),
    [filteredResidues, page]
  );

  return (
    <section
      className={clsx(
        cx('fr-container'),
        'analytical-competences-container',
        'main-section'
      )}
    >
      <SectionHeader
        title="Compétence analytique des laboratoires"
        illustration={microscope}
      />
      <div className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}>
        {!user?.laboratoryId && (
          <Select
            label="Laboratoire"
            nativeSelectProps={{
              defaultValue: laboratoryId || '',
              onChange: (e) => setLaboratoryId(e.target.value as string)
            }}
            style={{ width: '25%' }}
          >
            <option value="" disabled>
              Sélectionner un laboratoire
            </option>
            {laboratories?.map((laboratory) => (
              <option
                key={`laboratory-option-${laboratory.id}`}
                value={laboratory.id}
              >
                {laboratory.name}
              </option>
            ))}
          </Select>
        )}
        <div className="d-flex-align-center">
          <h3 className={clsx(cx('fr-mb-0'), 'flex-grow-1')}>
            {pluralize(filteredResidues.length, {
              preserveCount: true
            })('résidu')}
          </h3>
          <SegmentedControl
            hideLegend
            legend="Type de résidu"
            segments={[
              {
                label: (
                  <div>
                    <span
                      className={cx('fr-icon-list-unordered', 'fr-mr-1w')}
                    />
                    Tous
                  </div>
                ),
                nativeInputProps: {
                  checked: residueKind === undefined,
                  onChange: () => setResidueKind(undefined)
                }
              },
              {
                label: ResidueKindLabels['Complex'],
                nativeInputProps: {
                  checked: residueKind === 'Complex',
                  onChange: () => setResidueKind('Complex')
                }
              },
              {
                label: ResidueKindLabels['Simple'],
                nativeInputProps: {
                  checked: residueKind === 'Simple',
                  onChange: () => setResidueKind('Simple')
                }
              }
            ]}
            className={cx('fr-mr-3w')}
          />
          <SearchBar
            defaultValue={residueSearch}
            onButtonClick={(value) => setResidueSearch(value)}
            label="Rechercher un résidu"
          />
        </div>
      </div>
      {laboratoryId && laboratoryAnalyticalCompetences && (
        <>
          {paginatedResidues
            .filter(([, ssd2Referential]) =>
              residueKind
                ? getResidueKind(ssd2Referential.reference) === residueKind
                : true
            )
            .map(([ssd2Code, ssd2Referential]) => (
              <LaboratoryAnalyticalCompetencesForm
                key={ssd2Code}
                laboratoryId={laboratoryId as string}
                ssd2Referential={ssd2Referential}
                residueAnalyticalCompetence={laboratoryAnalyticalCompetences?.find(
                  (competence) =>
                    competence.residueReference === ssd2Code &&
                    !competence.analyteReference
                )}
                analyteAnalyticalCompetences={laboratoryAnalyticalCompetences.filter(
                  (competence) =>
                    competence.residueReference === ssd2Code &&
                    competence.analyteReference
                )}
              />
            ))}
          <Pagination
            count={Math.floor(allResidues.length / defaultPerPage) + 1}
            defaultPage={page}
            getPageLinkProps={(page: number) => ({
              to: getURLQuery({
                page: page.toString()
              })
            })}
            className={cx('fr-mt-5w')}
          />
        </>
      )}
    </section>
  );
};

export default LaboratoryAnalyticalCompetencesView;
