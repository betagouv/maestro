import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import TagsGroup from '@codegouvfr/react-dsfr/TagsGroup';
import clsx from 'clsx';
import { Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { hasNationalRole, User } from 'maestro-shared/schema/User/User';
import { UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import { isNotEmpty, mapNonEmptyArray } from 'maestro-shared/utils/typescript';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import './UserCard.scss';

import franceSvg from '../../../assets/illustrations/france.svg';

type Props = {
  user: User;
};
export const UserCard: FunctionComponent<Props> = ({ user, ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <Card
      title={
        <Tag as={'span'} small>
          {UserRoleLabels[user.role]}
        </Tag>
      }
      titleAs={'h6'}
      desc={
        <div className={clsx('user-card-desc')}>
          <span className={cx('fr-text--xl', 'fr-text--bold', 'fr-mb-0')}>
            {user.name === '-' ? user.email : user.name}
          </span>
          <span className={clsx('user-card-region')}>
            <img src={franceSvg} height="100%" aria-hidden alt="" />
            {hasNationalRole(user) ? 'France' : Regions[user.region!].name}
          </span>
          {isNotEmpty(user.programmingPlanKinds) && (
            <TagsGroup
              className={clsx(cx('fr-mb-0'))}
              smallTags
              tags={mapNonEmptyArray(user.programmingPlanKinds, (plan) => ({
                children: ProgrammingPlanKindLabels[plan]
              }))}
            />
          )}
        </div>
      }
      end={
        <div className={clsx('d-flex-align-center')}>
          <Button
            size="small"
            className={clsx('fr-mr-2w')}
            linkProps={{
              to: ''
            }}
            priority={'secondary'}
          >
            Éditer
          </Button>
        </div>
      }
    />
  );
};
