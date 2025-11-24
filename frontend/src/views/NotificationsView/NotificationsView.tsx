import { FrIconClassName } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx, FrCxArg } from '@codegouvfr/react-dsfr/fr/cx';
import Tile from '@codegouvfr/react-dsfr/Tile';
import { Badge as MuiBadge } from '@mui/material';
import clsx from 'clsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { capitalize } from 'lodash-es';
import { Brand } from 'maestro-shared/constants';
import { Regions } from 'maestro-shared/referential/Region';
import { Notification } from 'maestro-shared/schema/Notification/Notification';
import {
  NotificationCategory,
  NotificationCategoryTitles
} from 'maestro-shared/schema/Notification/NotificationCategory';
import { UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import { useContext, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router';
import notificationsImg from 'src/assets/illustrations/notifications.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ApiClientContext } from '../../services/apiClient';
import './NotificationsView.scss';

const NotificationsView = () => {
  useDocumentTitle('Centre de notifications');
  const apiClient = useContext(ApiClientContext);
  const navigate = useNavigate();
  const { user } = useAuthentication();

  const { data: notifications } = apiClient.useFindNotificationsQuery(
    {
      recipientId: user?.id as string
    },
    {
      skip: !user
    }
  );
  const [updateNotification] = apiClient.useUpdateNotificationMutation();
  const [updateNotifications] = apiClient.useUpdateNotificationsMutation();

  const [visibleDays, setVisibleDays] = useState<number>(3);

  const notificationsByDay = useMemo(
    () =>
      notifications?.reduce(
        (acc, notification) => {
          const notificationDate = format(
            notification.createdAt,
            'eeee dd MMMM yyyy',
            {
              locale: fr
            }
          );
          if (!acc[notificationDate]) {
            acc[notificationDate] = [];
          }
          acc[notificationDate].push(notification);
          return acc;
        },
        {} as Record<string, Notification[]>
      ),
    [notifications]
  );

  const onNotificationClick = async (notification: Notification) => {
    await updateNotification({
      notificationId: notification.id,
      notificationUpdate: {
        read: true
      }
    });
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const Icon: Record<NotificationCategory, FrIconClassName> = {
    Surveillance: 'fr-icon-line-chart-fill',
    Control: 'fr-icon-line-chart-fill',
    ProgrammingPlanSubmittedToRegion: 'fr-icon-line-chart-fill',
    ProgrammingPlanApprovedByRegion: 'fr-icon-line-chart-fill',
    ProgrammingPlanSubmittedToDepartments: 'fr-icon-line-chart-fill',
    ProgrammingPlanValidated: 'fr-icon-line-chart-fill',
    AnalysisReviewTodo: 'fr-icon-edit-box-line',
    ResourceDocumentUploaded: 'fr-icon-article-line'
  };

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title="Notifications"
        subtitle={`Votre centre de notifications suite aux activités sur ${Brand}`}
        illustration={notificationsImg}
        action={
          <Button
            iconId="fr-icon-check-line"
            priority="secondary"
            onClick={() =>
              updateNotifications({
                recipientId: user?.id as string,
                notificationUpdate: {
                  read: true
                }
              })
            }
          >
            Tout marquer comme lu
          </Button>
        }
      />

      {notificationsByDay &&
        Object.entries(notificationsByDay)
          .slice(0, visibleDays)
          .map(([day, notifications]) => (
            <div
              key={day}
              className={clsx('white-container', cx('fr-px-5w', 'fr-py-3w'))}
            >
              <div className={clsx('notifications-day-container')}>
                <h4 className={cx('fr-mb-0')}>{capitalize(day)}</h4>
                {notifications.map((notification) => (
                  <Tile
                    key={notification.id}
                    buttonProps={{
                      onClick: () => onNotificationClick(notification)
                    }}
                    orientation="horizontal"
                    start={
                      <Badge
                        noIcon
                        severity="new"
                        small
                        className="d-flex-align-center"
                      >
                        <span
                          className={cx(
                            'fr-icon--xs',
                            'fr-mr-1v',
                            Icon[notification.category] as FrCxArg
                          )}
                        />
                        {NotificationCategoryTitles[notification.category]}
                      </Badge>
                    }
                    desc={
                      <MuiBadge
                        variant="dot"
                        color="error"
                        overlap="circular"
                        invisible={notification.read}
                        sx={{
                          width: '100%',
                          '& .MuiBadge-dot': {
                            right: 10,
                            top: 10
                          }
                        }}
                      >
                        <div>
                          <div className={cx('fr-text--md', 'fr-mr-8w')}>
                            <ReactMarkdown components={{ p: 'div' }}>
                              {notification.message}
                            </ReactMarkdown>
                          </div>
                          {notification.author && (
                            <div
                              className={clsx(
                                cx('fr-mt-2w'),
                                'd-flex-align-center'
                              )}
                            >
                              <div className="avatar">
                                <span
                                  className={clsx(
                                    cx('fr-icon-user-line'),
                                    'icon-grey'
                                  )}
                                />
                              </div>
                              <div>
                                <div className={cx('fr-text--bold')}>
                                  {notification.author.name}
                                </div>
                                <div
                                  className={clsx(
                                    cx('fr-text--sm'),
                                    'd-flex-align-center',
                                    'text-grey'
                                  )}
                                >
                                  <span
                                    className={cx(
                                      'fr-icon-briefcase-fill',
                                      'fr-icon--sm',
                                      'fr-mr-1w'
                                    )}
                                  />
                                  {UserRoleLabels[notification.author.role]}
                                  {notification.author.region && (
                                    <>
                                      <span
                                        className={cx(
                                          'fr-icon-map-pin-2-fill',
                                          'fr-icon--sm',
                                          'fr-ml-3w',
                                          'fr-mr-1w'
                                        )}
                                      />
                                      {Regions[notification.author.region].name}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </MuiBadge>
                    }
                    detail={
                      <span className={clsx(cx('fr-text--sm'), 'text-grey')}>
                        {format(notification.createdAt, "HH'h'mm", {
                          locale: fr
                        })}
                      </span>
                    }
                    title=""
                  />
                ))}
              </div>
            </div>
          ))}
      {Object.keys(notificationsByDay || {}).length > visibleDays && (
        <div className="d-flex-justify-center">
          <Button
            iconId="fr-icon-arrow-down-line"
            priority="secondary"
            iconPosition="right"
            onClick={() => setVisibleDays(visibleDays + 3)}
          >
            Notifications précédentes
          </Button>
        </div>
      )}
    </section>
  );
};

export default NotificationsView;
