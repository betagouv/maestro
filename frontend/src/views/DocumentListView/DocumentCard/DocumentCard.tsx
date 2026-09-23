import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { uniq } from 'lodash-es';
import type { DocumentChecked } from 'maestro-shared/schema/Document/Document';
import { DocumentKindLabels } from 'maestro-shared/schema/Document/DocumentKind';
import { NotificationCategoryTitles } from 'maestro-shared/schema/Notification/NotificationCategory';
import { formatDate } from 'maestro-shared/utils/date';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import { useContext, useMemo } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import DocumentLink from '../../../components/DocumentLink/DocumentLink';
import { ApiClientContext } from '../../../services/apiClient';
import './DocumentCard.scss';

type Props = {
  document: DocumentChecked;
  onViewNotes: (document: DocumentChecked) => void;
  onRemove: (document: DocumentChecked) => void;
  isNew?: boolean;
};

const DocumentCard = ({ document, onViewNotes, onRemove, isNew }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPermission } = useAuthentication();
  const { data: programmingPlans } = apiClient.useFindProgrammingPlansQuery({});

  const years = useMemo(
    () =>
      document.programmingPlanIds?.length
        ? uniq(
            (programmingPlans ?? [])
              .filter((plan) => document.programmingPlanIds?.includes(plan.id))
              .map((plan) => plan.year)
          ).sort()
        : [document.year].filter(isDefinedAndNotNull),
    [document, programmingPlans]
  );

  return (
    <Card
      start={
        <div className={clsx('d-flex-align-center')}>
          <div className={clsx('d-flex-align-center', 'flex-grow-1')}>
            <Tag>{DocumentKindLabels[document.kind]}</Tag>
            {years.map((year) => (
              <Tag key={year}>{year}</Tag>
            ))}
          </div>
          {hasUserPermission('createResource') && (
            <Button
              iconId="fr-icon-edit-line"
              title="Modifier le document"
              linkProps={{
                to: `/documents/${document.id}`
              }}
              priority="tertiary"
              size="small"
            />
          )}
          {hasUserPermission('deleteDocument') && (
            <Button
              iconId="fr-icon-delete-line"
              title="Supprimer le document"
              priority="tertiary"
              size="small"
              onClick={() => onRemove(document)}
              className={'fr-ml-1w'}
            />
          )}
          {isNew && (
            <Badge
              noIcon
              severity="success"
              small
              className="d-flex-align-center"
            >
              {NotificationCategoryTitles['ResourceDocumentUploaded']}
            </Badge>
          )}
        </div>
      }
      title={document.name}
      border
      desc={
        <>
          <span className={cx('fr-hint-text', 'fr-pb-2w')}>
            Version du {formatDate(document.createdAt)}
          </span>
          <span className={cx('fr-text--regular')}>
            <DocumentLink
              documentId={document.id}
              scope={{ type: 'resource' }}
            />
          </span>
        </>
      }
      size="small"
      titleAs="h6"
      footer={
        <ButtonsGroup
          buttonsEquisized={false}
          buttonsSize="small"
          alignment="center"
          inlineLayoutWhen="always"
          className={clsx(cx('fr-m-0'), 'document-card-buttons')}
          buttons={[
            {
              children: document.notes ? 'Notes' : 'Aucune note',
              iconId: 'fr-icon-chat-3-line',
              priority: 'tertiary no outline',
              className: cx('fr-m-0'),
              disabled: !document.notes,
              onClick: () => onViewNotes(document)
            }
          ]}
        />
      }
      classes={{
        end: 'd-none',
        footer: clsx(cx('fr-py-2w'), 'border-top'),
        content: cx('fr-pb-0'),
        desc: cx('fr-pb-3v')
      }}
    />
  );
};

export default DocumentCard;
