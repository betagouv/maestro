import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import { Document } from 'maestro-shared/schema/Document/Document';
import { DocumentKind } from 'maestro-shared/schema/Document/DocumentKind';
import { useMemo, useState } from 'react';
import { pluralize } from '../../../utils/stringUtils';
import DocumentCard from '../DocumentCard/DocumentCard';
import DocumentTable from '../DocumentTable';

interface Props {
  resources: Document[];
  documentKind?: DocumentKind;
  onViewDocumentNotes: (document: Document) => void;
  onRemoveDocument: (document: Document) => void;
}

const DocumentListTabContent = ({
  resources,
  documentKind,
  onViewDocumentNotes,
  onRemoveDocument
}: Props) => {
  const [documentListDisplay, setDocumentListDisplay] = useState<
    'cards' | 'table'
  >('cards');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = useMemo(
    () =>
      resources?.filter(
        (resource) =>
          (isNil(documentKind) || resource.kind === documentKind) &&
          resource.name?.toLowerCase().includes(searchQuery)
      ),
    [resources, searchQuery, documentKind]
  );

  return (
    <>
      <div className={clsx(cx('fr-mb-2w', 'fr-mb-md-5w'), 'table-header')}>
        <div className="d-flex-align-center" style={{ gap: '1rem' }}>
          <h4 className={clsx(cx('fr-mb-0'), 'flex-grow-1')}>
            {pluralize(filteredResources?.length || 0, {
              preserveCount: true
            })('ressource')}
          </h4>
          <Input
            iconId="fr-icon-search-line"
            hideLabel
            label="Rechercher"
            nativeInputProps={{
              type: 'search',
              placeholder: 'Rechercher',
              value: searchQuery ?? '',
              onChange: (e) => setSearchQuery(e.target.value)
            }}
            className={cx('fr-my-0', 'fr-hidden', 'fr-unhidden-md')}
            classes={{
              wrap: cx('fr-mt-0')
            }}
          />
          <SegmentedControl
            hideLegend
            legend="Légende"
            segments={[
              {
                label: 'Grille',
                iconId: 'fr-icon-layout-grid-line',
                nativeInputProps: {
                  checked: documentListDisplay === 'cards',
                  onChange: () => setDocumentListDisplay('cards')
                }
              },
              {
                label: 'Tableau',
                iconId: 'fr-icon-table-line',
                nativeInputProps: {
                  checked: documentListDisplay === 'table',
                  onChange: () => setDocumentListDisplay('table')
                } as any
              }
            ]}
          />
        </div>
      </div>
      {documentListDisplay === 'cards' && (
        <>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            {filteredResources?.map((resource) => (
              <div className={cx('fr-col-12', 'fr-col-md-4')} key={resource.id}>
                <DocumentCard
                  document={resource}
                  onViewNotes={onViewDocumentNotes}
                  onRemove={onRemoveDocument}
                />
              </div>
            ))}
          </div>
        </>
      )}
      {documentListDisplay === 'table' && (
        <DocumentTable
          documents={filteredResources ?? []}
          onViewDocumentNotes={onViewDocumentNotes}
          onRemoveDocument={onRemoveDocument}
        />
      )}
    </>
  );
};

export default DocumentListTabContent;
