import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import Select from '@codegouvfr/react-dsfr/Select';
import { skipToken } from '@reduxjs/toolkit/query';
import clsx from 'clsx';
import { SSD2Referential } from 'maestro-shared/referential/Residue/SSD2Referential';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router';
import microscope from 'src/assets/illustrations/microscope.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { ApiClientContext } from '../../services/apiClient';
import { getURLQuery } from '../../utils/fetchUtils';
import LaboratoryAnalyticalCompetencesForm from './LaboratoryAnalyticalCompetenceForm';
import './LaboratoryAnalyticalCompetences.scss';

const LaboratoryAnalyticalCompetencesView = () => {
  useDocumentTitle('Compétence analytique des laboratoires');
  const apiClient = useContext(ApiClientContext);

  const [searchParams] = useSearchParams();

  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const allResidues = Object.entries(SSD2Referential);
  const [laboratoryId, setLaboratoryId] = useState<string>();

  const { data: laboratoryAnalyticalCompetences } =
    apiClient.useGetLaboratoryAnalyticalCompetencesQuery(
      laboratoryId ?? skipToken
    );

  const { data: laboratories } = apiClient.useFindLaboratoriesQuery({});

  const residues = allResidues.slice(
    (page - 1) * defaultPerPage,
    page * defaultPerPage
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
        <Select
          label="Laboratoire"
          nativeSelectProps={{
            defaultValue: laboratoryId || '',
            onChange: (e) => setLaboratoryId(e.target.value as string)
          }}
        >
          {laboratories?.map((laboratory) => (
            <option
              key={`laboratory-option-${laboratory.id}`}
              value={laboratory.id}
            >
              {laboratory.name}
            </option>
          ))}
        </Select>
      </div>
      {laboratoryId && laboratoryAnalyticalCompetences && (
        <>
          {residues.map(([ssd2Code, ssd2Referential]) => (
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
