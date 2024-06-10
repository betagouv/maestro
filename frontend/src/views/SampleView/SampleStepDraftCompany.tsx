import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Department } from 'shared/referential/Department';
import {
  Company,
  companyFromSearchResult,
} from 'shared/schema/Company/Company';
import { CompanySearchResult } from 'shared/schema/Company/CompanySearchResult';
import { PartialSample } from 'shared/schema/Sample/Sample';
import { SampleStatus } from 'shared/schema/Sample/SampleStatus';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import { useForm } from 'src/hooks/useForm';
import { useLazySearchCompaniesQuery } from 'src/services/company.service';
import { useUpdateSampleMutation } from 'src/services/sample.service';
import { pluralize } from 'src/utils/stringUtils';
import { z } from 'zod';
interface Props {
  partialSample: PartialSample;
}

const SampleStepDraftCompany = ({ partialSample }: Props) => {
  const navigate = useNavigate();

  const [, setSearchInputElement] = useState<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>();
  const [company, setCompany] = useState(partialSample.company);
  const [selectedCompany, setSelectedCompany] = useState<CompanySearchResult>();
  const [companySearchResults, setCompanySearchResults] =
    useState<CompanySearchResult[]>();
  const [commentCompany, setCommentCompany] = useState(
    partialSample?.commentCompany
  );

  const [updateSample] = useUpdateSampleMutation();
  const [searchCompanies] = useLazySearchCompaniesQuery();

  const SearchForm = z.object({
    searchQuery: z
      .string({
        required_error: 'Veuillez renseigner un nom, une adresse, ou un SIRET',
      })
      .min(3, {
        message: 'Veuillez renseigner au moins 3 caractères',
      }),
  });

  const searchForm = useForm(SearchForm, {
    searchQuery,
  });

  const search = async () => {
    await searchForm.validate(async () => {
      await searchCompanies({
        query: searchQuery as string,
        department: partialSample.department as Department,
      })
        .unwrap()
        .then((results) => {
          setCompanySearchResults(results);
          if (results.length === 1) {
            setSelectedCompany(results[0]);
          }
        });
    });
  };

  const Form = z.object({
    company: Company.optional().nullable(),
    commentCompany: z.string().optional().nullable(),
    status: SampleStatus,
  });

  type FormShape = typeof Form.shape;

  const form = useForm(Form, {
    company,
    commentCompany,
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
      company: selectedCompany
        ? companyFromSearchResult(selectedCompany)
        : company,
      commentCompany,
      status,
    });
  };

  return (
    <>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          {company ? (
            <div>
              {company.name} ({company.siret})
              <Button
                priority="tertiary no outline"
                iconId="fr-icon-edit-line"
                onClick={() => {
                  setCompany(undefined);
                  setCommentCompany('');
                }}
              >
                Modifier
              </Button>
            </div>
          ) : (
            <div
              className={cx('fr-input-group', {
                'fr-input-group--error': searchForm.hasIssue('searchQuery'),
              })}
            >
              <SearchBar
                label="Rechercher par Nom, adresse, n° SIRET/SIREN"
                onButtonClick={search}
                renderInput={({ className, id, placeholder, type }) => (
                  <input
                    ref={setSearchInputElement}
                    className={clsx(
                      className,
                      cx({
                        'fr-input--error': searchForm.hasIssue('searchQuery'),
                      })
                    )}
                    id={id}
                    placeholder={placeholder}
                    type={type}
                    value={searchQuery ?? ''}
                    onChange={(event) => {
                      setSelectedCompany(undefined);
                      setCompanySearchResults(undefined);
                      setSearchQuery(event.currentTarget.value);
                    }}
                  />
                )}
              />
              {searchForm.hasIssue('searchQuery') && (
                <p className="fr-error-text">
                  {searchForm.message('searchQuery') as string}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {companySearchResults && (
        <>
          <RadioButtons
            className={cx('fr-mt-3w', 'fr-mx-0')}
            legend={`${companySearchResults.length} ${pluralize(
              companySearchResults.length
            )('résultat trouvé')}`}
            options={companySearchResults.map((companySearchResult) => ({
              key: companySearchResult.siege.siret,
              label: (
                <div>
                  <strong>
                    {companySearchResult.nom_complet} (
                    {companySearchResult.siege.siret})
                  </strong>
                  <br />
                  {companySearchResult.siege.adresse}
                </div>
              ),
              nativeInputProps: {
                checked: selectedCompany === companySearchResult,
                onChange: () => setSelectedCompany(companySearchResult),
              },
            }))}
          />
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
          <AppTextAreaInput<FormShape>
            rows={3}
            defaultValue={commentCompany ?? ''}
            onChange={(e) => setCommentCompany(e.target.value)}
            inputForm={form}
            inputKey="commentCompany"
            whenValid="Commentaire correctement renseigné."
            data-testid="comment-input"
            label="Commentaires"
          />
        </div>
      </div>
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
