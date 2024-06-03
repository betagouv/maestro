import Alert from '@codegouvfr/react-dsfr/Alert';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';
import clsx from 'clsx';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Company } from 'shared/schema/Company/Company';
import { FindCompanyOptions } from 'shared/schema/Company/FindCompanyOptions';
import { PartialSample } from 'shared/schema/Sample/Sample';
import { SampleStatus } from 'shared/schema/Sample/SampleStatus';
import { isDefined } from 'shared/utils/utils';
import { useForm } from 'src/hooks/useForm';
import { useLazyFindCompaniesQuery } from 'src/services/company.service';
import { useUpdateSampleMutation } from 'src/services/sample.service';
import { z } from 'zod';
interface Props {
  partialSample: PartialSample;
}

const SampleStepDraftCompany = ({ partialSample }: Props) => {
  const navigate = useNavigate();

  const [, setSearchInputElement] = useState<HTMLInputElement | null>(null);
  const [siret, setSiret] = useState<string>(
    partialSample?.company?.siret ?? ''
  );
  const [company, setCompany] = useState(partialSample.company);

  const [updateSample] = useUpdateSampleMutation();
  const [findCompanies] = useLazyFindCompaniesQuery();

  const SearchForm = FindCompanyOptions.pick({
    siret: true,
  });

  const searchForm = useForm(SearchForm, {
    siret,
  });

  const search = async () => {
    await searchForm.validate(async () => {
      const companies = await findCompanies({
        siret: siret as string,
      }).unwrap();
      if (companies?.length >= 1) {
        setCompany(companies[0]);
      }
    });
  };

  const Form = z.object({
    company: Company.optional().nullable(),
    status: SampleStatus,
  });

  const form = useForm(Form, {
    company,
    status: partialSample.status,
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      await save('DraftInfos');
      navigate(`/prelevements/${partialSample.id}?etape=3`, {
        replace: true,
      });
    });
  };

  const save = async (status = partialSample.status) => {
    await updateSample({
      ...partialSample,
      company,
      status,
    });
  };

  return (
    <>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <div
            className={cx('fr-input-group', {
              'fr-input-group--error': searchForm.hasIssue('siret'),
            })}
          >
            <SearchBar
              label="Rechercher par Siret ou NumAgrit"
              onButtonClick={search}
              renderInput={({ className, id, placeholder, type }) => (
                <input
                  ref={setSearchInputElement}
                  className={clsx(
                    className,
                    cx({ 'fr-input--error': searchForm.hasIssue('siret') })
                  )}
                  id={id}
                  placeholder={placeholder}
                  type={type}
                  value={siret}
                  onChange={(event) => {
                    setCompany(undefined);
                    setSiret(event.currentTarget.value);
                  }}
                />
              )}
            />
            {searchForm.hasIssue('siret') && (
              <p className="fr-error-text">
                {searchForm.message('siret') as string}
              </p>
            )}
          </div>
        </div>
      </div>
      {company && (
        <>
          <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
          <ul>
            <li>
              <strong>SIRET :</strong> {company.siret}
            </li>
            <li>
              <strong>Nom :</strong> {company.name}
            </li>
            <li>
              <strong>Adresse :</strong>{' '}
              {[company.address, company.postalCode, company.city]
                .filter(isDefined)
                .join(' - ')}
            </li>
          </ul>
        </>
      )}
      {form.hasIssue('company') && (
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <Alert
              severity="error"
              description="Veuillez renseigner le lieu de prélèvement avant de continuer."
              small
              className={cx('fr-mt-4w')}
            />
          </div>
        </div>
      )}
      <hr className={cx('fr-mt-3w', 'fr-mx-0')} />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <ButtonsGroup
            inlineLayoutWhen="md and up"
            buttons={[
              {
                children: 'Etape précédente',
                priority: 'secondary',
                onClick: async (e) => {
                  e.preventDefault();
                  await save('Draft');
                  navigate(`/prelevements/${partialSample.id}?etape=1`, {
                    replace: true,
                  });
                },
                nativeButtonProps: {
                  'data-testid': 'previous-button',
                },
              },
              {
                children: 'Etape suivante',
                onClick: submit,
                nativeButtonProps: {
                  'data-testid': 'submit-button',
                },
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default SampleStepDraftCompany;
