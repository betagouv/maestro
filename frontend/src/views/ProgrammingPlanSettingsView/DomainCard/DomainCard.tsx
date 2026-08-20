import type { FrIconClassName } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import type { ProgrammingPlanDomain } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { CSSProperties } from 'react';
import { pluralize } from 'src/utils/stringUtils';
import { assert, type Equals } from 'tsafe';

type Props = {
  domain: ProgrammingPlanDomain;
  programmingPlans: ProgrammingPlanChecked[];
};

//FIXME temporaire, à terme on souhaite savoir si le PARAMÉTRAGE de tous les plans/sous-plans est terminé ou non
const hasSettingsInProgress = (plan: ProgrammingPlanChecked): boolean =>
  [...plan.regionalStatus, ...plan.departmentalStatus].some(
    ({ status }) => status === 'InProgress'
  );

const isCampaignLaunched = (plan: ProgrammingPlanChecked): boolean =>
  [...plan.regionalStatus, ...plan.departmentalStatus].some(({ status }) =>
    ['Validated', 'Closed'].includes(status)
  );

export const DomainCard = ({ domain, programmingPlans, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const subPlanCount = sumBy(programmingPlans, (plan) => plan.subPlans.length);

  const launchedPlanCount = programmingPlans.filter(isCampaignLaunched).length;

  const areSettingsCompleted =
    programmingPlans.length > 0 &&
    !programmingPlans.some(hasSettingsInProgress);

  const campaign: {
    label: string;
    icon: FrIconClassName;
    style?: CSSProperties;
  } =
    launchedPlanCount === 0
      ? { label: 'Campagne non lancée', icon: 'fr-icon-time-line' }
      : launchedPlanCount === programmingPlans.length
        ? {
            label: 'Campagne lancée',
            icon: 'fr-icon-success-fill',
            style: {
              color: 'var(--text-default-info)',
              backgroundColor: 'var(--background-contrast-info)'
            }
          }
        : { label: 'Campagne en partie lancée', icon: 'fr-icon-time-line' };

  return (
    <Card
      title={domain.label}
      titleAs="h6"
      start={
        <span className={clsx('d-flex-align-center', 'd-flex-justify-between')}>
          <Badge small severity={areSettingsCompleted ? 'success' : 'warning'}>
            {areSettingsCompleted ? 'Terminé' : 'En cours'}
          </Badge>
          <span className="d-flex-align-center" style={{ gap: '0.25rem' }}>
            <Button
              size="small"
              title="Dupliquer"
              iconId="ri-file-copy-line"
              priority="tertiary"
              onClick={() => ({})}
            />
            <Button
              size="small"
              title="Supprimer"
              iconId="fr-icon-delete-bin-line"
              priority="tertiary"
              onClick={() => ({})}
            />
          </span>
        </span>
      }
      desc={
        <>
          <Tag
            as="span"
            small
            iconId={campaign.icon}
            className={clsx('no-wrap', cx('fr-mb-1w'))}
            style={campaign.style}
          >
            {campaign.label}
          </Tag>
          <span className={cx('fr-text--xs', 'fr-mb-0')}>
            <span className="icon-text ">
              <span
                className={cx('fr-icon-folder-2-line', 'fr-icon--sm')}
              ></span>
              {pluralize(programmingPlans.length, { preserveCount: true })(
                'plan'
              )}
              {' / '}
              {pluralize(subPlanCount, { preserveCount: true })('sous-plan')}
            </span>
          </span>
        </>
      }
    />
  );
};
