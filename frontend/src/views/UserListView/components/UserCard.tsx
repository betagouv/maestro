import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { User } from 'maestro-shared/schema/User/User';
import {
  hasNationalRole,
  UserRoleLabels
} from 'maestro-shared/schema/User/UserRole';
import { isNotEmpty } from 'maestro-shared/utils/typescript';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import './UserCard.scss';

import franceSvg from '../../../assets/illustrations/france.svg';

type Props = {
  user: User;
  onEdit: () => void;
};
export const UserCard: FunctionComponent<Props> = ({
  user,
  onEdit,
  ..._rest
}) => {
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
        <span className={clsx('user-card-desc')}>
          <span className={cx('fr-text--xl', 'fr-text--bold', 'fr-mb-0')}>
            {user.name ?? user.email}
          </span>
          <span className={clsx('user-card-region')}>
            <img src={franceSvg} height="100%" aria-hidden alt="" />
            {hasNationalRole(user) ? 'France' : Regions[user.region!].name}
          </span>
          {isNotEmpty(user.programmingPlanKinds) && (
            <span>
              {user.programmingPlanKinds.map((p) => (
                <Tag key={p} as={'span'}>
                  {ProgrammingPlanKindLabels[p]}
                </Tag>
              ))}
            </span>
          )}
        </span>
      }
      end={
        <div className={clsx('d-flex-align-center')}>
          <Button
            size="small"
            className={clsx('fr-mr-2w')}
            onClick={onEdit}
            priority={'secondary'}
          >
            Éditer
          </Button>
        </div>
      }
    />
  );
};
