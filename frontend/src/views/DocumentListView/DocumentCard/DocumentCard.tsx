import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { Document } from 'maestro-shared/schema/Document/Document';
import { DocumentKindLabels } from 'maestro-shared/schema/Document/DocumentKind';
import { formatDate } from 'maestro-shared/utils/date';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocument } from 'src/hooks/useDocument';
import DocumentLink from '../../../components/DocumentLink/DocumentLink';
import './DocumentCard.scss';

type Props = {
  document: Document;
  onViewNotes: (document: Document) => void;
  onRemove: (document: Document) => void;
};

const DocumentCard = ({ document, onViewNotes, onRemove }: Props) => {
  const { hasUserPermission } = useAuthentication();
  const { downloadDocument } = useDocument();

  return (
    <>
      <Card
        start={
          <div className={clsx('d-flex-align-start')}>
            <div className="flex-grow-1">
              <Tag>{DocumentKindLabels[document.kind]}</Tag>
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
          </div>
        }
        title={document.name}
        border
        desc={
          <>
            <span className={cx('fr-hint-text', 'fr-pb-2w', 'fr-pt-1w')}>
              Version du {formatDate(document.createdAt)}
            </span>
            <div className={cx('fr-text--regular')}>
              <DocumentLink
                documentId={document.id}
                iconId="fr-icon-eye-line"
              />
            </div>
            <hr className={cx('fr-my-3v')} />
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
              },
              {
                children: 'Télécharger',
                iconId: 'fr-icon-download-line',
                priority: 'tertiary no outline',
                className: cx('fr-m-0'),
                onClick: async () => {
                  await downloadDocument(document.id, document.filename);
                }
              }
            ]}
          />
        }
        classes={{
          end: 'd-none',
          footer: cx('fr-pb-2w'),
          content: cx('fr-pb-0')
        }}
      />
    </>
  );
};

export default DocumentCard;
