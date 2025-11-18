import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { User } from 'maestro-shared/schema/User/User';
import {
  canHaveDepartement,
  hasRegionalRole,
  UserRoleLabels
} from 'maestro-shared/schema/User/UserRole';
import { isNotEmpty } from 'maestro-shared/utils/typescript';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import './UserCard.scss';

import { DepartmentLabels } from 'maestro-shared/referential/Department';
import franceSvg from '../../../assets/illustrations/france.svg';

type Props = {
  user: User;
  onEdit: () => void;
  onDisable: () => void;
};
export const UserCard: FunctionComponent<Props> = ({
  user,
  onEdit,
  onDisable,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <Card
      className={'user-list-item-card'}
      title={
        <div className={clsx('user-card-title')}>
          <Tag as={'span'} small>
            {UserRoleLabels[user.role]}
          </Tag>
          <div>
            <Button
              size="small"
              className={clsx('fr-mr-1w')}
              onClick={onEdit}
              priority={'tertiary'}
              iconId={'fr-icon-edit-line'}
              title={'éditer'}
              data-testid={`user-edit-button-${user.id}`}
            >
              {undefined}
            </Button>
            <Button
              size="small"
              className={clsx('')}
              onClick={onDisable}
              priority={'tertiary'}
              title={'désactiver'}
              iconId={'fr-icon-logout-box-r-line'}
              data-testid={`user-disable-button-${user.id}`}
            >
              {undefined}
            </Button>
          </div>
        </div>
      }
      titleAs={'h6'}
      desc={
        <span className={clsx('user-card-desc')}>
          <span className={cx('fr-text--xl', 'fr-text--bold', 'fr-mb-0')}>
            {user.name ?? user.email}
          </span>
          <span className={clsx('user-card-region')}>
            <img src={franceSvg} height="100%" aria-hidden alt="" />
            {canHaveDepartement(user)
              ? `${Regions[user.region].name}${user.department ? ` - ${DepartmentLabels[user.department]}` : ''}`
              : hasRegionalRole(user)
                ? Regions[user.region].name
                : 'France'}
          </span>
          {isNotEmpty(user.programmingPlanKinds) && (
            <span>
              {user.programmingPlanKinds.map((p) => (
                <Tag
                  key={p}
                  as={'span'}
                  small={true}
                  className={clsx('fr-mb-1w')}
                >
                  {ProgrammingPlanKindLabels[p]}
                </Tag>
              ))}
            </span>
          )}
        </span>
      }
    />
  );
};
