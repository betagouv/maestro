import Button from '@codegouvfr/react-dsfr/Button';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { User } from 'maestro-shared/schema/User/User';
import {
  canHaveDepartment,
  isRegionalRole,
  UserRoleLabels
} from 'maestro-shared/schema/User/UserRole';
import { isNotEmpty } from 'maestro-shared/utils/typescript';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import './UserCard.scss';

import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { useMascarade } from '../../../components/Mascarade/useMascarade';

type Props = {
  user: User;
  onEdit: () => void;
  onDisable: () => void;
  onEnable: () => void;
};
export const UserCard: FunctionComponent<Props> = ({
  user,
  onEdit,
  onDisable,
  onEnable,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { setMascaradeUserId } = useMascarade();

  return (
    <Card
      className={'user-list-item-card'}
      title={
        <div className={clsx('user-card-title')}>
          <div style={{ flexBasis: 'min-content' }}>
            {user.roles.map((role) => (
              <Tag as={'span'} small key={role}>
                {UserRoleLabels[role]}
              </Tag>
            ))}
          </div>
          <div className="d-flex-align-center">
            <Button
              size="small"
              className={clsx('fr-mr-1w')}
              onClick={onEdit}
              priority={'tertiary'}
              iconId={'fr-icon-edit-line'}
              title={'éditer'}
              data-testid={`user-edit-button-${user.id}`}
            />
            {!user.disabled ? (
              <>
                <Button
                  size="small"
                  onClick={onDisable}
                  priority={'tertiary'}
                  title={'désactiver'}
                  iconId={'fr-icon-logout-box-r-line'}
                  data-testid={`user-disable-button-${user.id}`}
                />
                <Button
                  size="small"
                  onClick={() => setMascaradeUserId(user.id)}
                  priority={'tertiary'}
                  iconId={'fr-icon-group-line'}
                  className={'fr-ml-1w'}
                  title={`Usurper l'identité`}
                />
              </>
            ) : (
              <Button
                size="small"
                onClick={onEnable}
                priority={'tertiary'}
                title={'activer'}
                iconId={'fr-icon-user-add-line'}
              />
            )}
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
            <span
              className={cx('fr-icon-france-line', 'fr-icon--sm')}
              aria-hidden="true"
            />
            {canHaveDepartment(user)
              ? `${Regions[user.region].name}${user.department ? ` - ${DepartmentLabels[user.department]}` : ''}`
              : user.roles.some((role) => isRegionalRole(role)) && user.region
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
