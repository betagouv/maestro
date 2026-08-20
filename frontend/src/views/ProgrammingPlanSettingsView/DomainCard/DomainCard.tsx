import type { FrIconClassName } from '@codegouvfr/react-dsfr';
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

const isCampaignLaunched = (plan: ProgrammingPlanChecked): boolean =>
  [...plan.regionalStatus, ...plan.departmentalStatus].some(({ status }) =>
    ['Validated', 'Closed'].includes(status)
  );

export const DomainCard = ({ domain, programmingPlans, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const subPlanCount = sumBy(programmingPlans, (plan) => plan.subPlans.length);

  const launchedPlanCount = programmingPlans.filter(isCampaignLaunched).length;

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
