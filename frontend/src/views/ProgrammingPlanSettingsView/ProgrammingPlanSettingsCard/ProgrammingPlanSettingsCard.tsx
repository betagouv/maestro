import type { FrIconClassName } from '@codegouvfr/react-dsfr';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { RegisteredLinkProps } from '@codegouvfr/react-dsfr/link';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { CSSProperties } from 'react';
import { pluralize } from 'src/utils/stringUtils';
import { assert, type Equals } from 'tsafe';

import { ProgrammingPlanSettingsActions } from '../ProgrammingPlanSettingsActions/ProgrammingPlanSettingsActions';
import { ProgrammingPlanSettingsBadge } from '../ProgrammingPlanSettingsBadge/ProgrammingPlanSettingsBadge';

type Props = {
  title: string;
  programmingPlans: ProgrammingPlanChecked[];
  linkProps: RegisteredLinkProps;
  withPlanCount?: boolean;
};

const isCampaignLaunched = (plan: ProgrammingPlanChecked): boolean =>
  [...plan.regionalStatus, ...plan.departmentalStatus].some(({ status }) =>
    ['Validated', 'Closed'].includes(status)
  );

export const ProgrammingPlanSettingsCard = ({
  title,
  programmingPlans,
  linkProps,
  withPlanCount,
  ..._rest
}: Props) => {
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
      className="programming-plan-settings-card"
      title={title}
      titleAs="h6"
      enlargeLink={true}
      linkProps={linkProps}
      start={
        <span className={clsx('d-flex-align-center', 'd-flex-justify-between')}>
          <ProgrammingPlanSettingsBadge
            small
            programmingPlans={programmingPlans}
          />
          <ProgrammingPlanSettingsActions size="small" />
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
              {withPlanCount && (
                <>
                  {pluralize(programmingPlans.length, { preserveCount: true })(
                    'plan'
                  )}
                  {' / '}
                </>
              )}
              {pluralize(subPlanCount, { preserveCount: true })('sous-plan')}
            </span>
          </span>
        </>
      }
    />
  );
};
