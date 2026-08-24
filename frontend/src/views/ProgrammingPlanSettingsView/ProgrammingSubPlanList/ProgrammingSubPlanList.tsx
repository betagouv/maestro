import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import clsx from 'clsx';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import type {
  ProgrammingSubPlan,
  ProgrammingSubPlanId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { pluralize } from 'src/utils/stringUtils';
import { assert, type Equals } from 'tsafe';
import './ProgrammingSubPlanList.scss';

type Props = {
  subPlans: ProgrammingSubPlan[];
  domainId: string;
  programmingPlanId: string;
  year: number;
  currentSubPlanId?: ProgrammingSubPlanId;
};

export const ProgrammingSubPlanList = ({
  subPlans,
  domainId,
  programmingPlanId,
  year,
  currentSubPlanId,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [search, setSearch] = useState('');

  const filteredSubPlans = useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase();

    return subPlans
      .filter((subPlan) =>
        `${subPlan.subPlanNumber} ${subPlan.label}`
          .toLowerCase()
          .includes(trimmedSearch)
      )
      .sort((a, b) => a.subPlanNumber.localeCompare(b.subPlanNumber));
  }, [subPlans, search]);

  return (
    <div className={clsx('white-container', 'programming-sub-plan-list')}>
      <div
        className={clsx(
          'header',
          'd-flex-align-center',
          cx('fr-px-2w', 'fr-py-1w')
        )}
      >
        <span
          className={cx('fr-icon-list-unordered', 'fr-icon--sm', 'fr-mr-1w')}
          aria-hidden="true"
        ></span>
        <span className={cx('fr-text--sm', 'fr-m-0')}>
          {pluralize(subPlans.length, { preserveCount: true })('sous-plan')}
        </span>
        <Button
          className={cx('fr-ml-auto')}
          size="small"
          priority="secondary"
          iconId="fr-icon-file-add-line"
          onClick={() => ({
            //FIXME DOMAIN implémenter l'ajout d'un sous-plan
          })}
        >
          Ajouter
        </Button>
      </div>
      <div className={cx('fr-px-2w', 'fr-py-1w')}>
        <Input
          label="Rechercher un sous-plan"
          hideLabel
          iconId="fr-icon-search-line"
          className={cx('fr-mb-0')}
          nativeInputProps={{
            type: 'search',
            placeholder: 'Rechercher un sous-plan',
            value: search,
            onChange: (event) => setSearch(event.currentTarget.value)
          }}
        />
      </div>
      {filteredSubPlans.length === 0 ? (
        <p className={cx('fr-px-2w', 'fr-py-1w', 'fr-text--sm', 'fr-mb-0')}>
          Aucun sous-plan
        </p>
      ) : (
        <ul className="sub-plans" aria-label="Liste des sous-plans">
          {filteredSubPlans.map((subPlan) => (
            <li key={subPlan.id} className={cx('fr-mx-2w', 'fr-mb-0')}>
              <Link
                className={clsx(
                  'd-flex-align-center',
                  'd-flex-justify-between',
                  cx('fr-p-1w', 'fr-text--sm', 'fr-mb-0')
                )}
                to={AppRouteLinks.ProgrammingPlanSettingsSubPlanRoute.link(
                  domainId,
                  programmingPlanId,
                  subPlan.id,
                  { year }
                )}
                aria-current={
                  subPlan.id === currentSubPlanId ? 'page' : undefined
                }
              >
                {subPlan.subPlanNumber} - {subPlan.label}
                {/*FIXME DOMAIN afficher la pastille seulement si le paramétrage du sous-plan est terminé*/}
                <span
                  className={clsx(
                    'settings-completed',
                    cx('fr-icon-checkbox-circle-fill', 'fr-icon--sm')
                  )}
                  title="Paramétrage terminé"
                ></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
