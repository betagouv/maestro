import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Analysis } from 'shared/schema/Analysis/Analysis';
import DocumentLink from 'src/components/DocumentLink/DocumentLink';

interface Props {
  analysis: Analysis;
}

const AnalysisOverview = ({ analysis }: Props) => {
  if (!analysis) {
    return <></>;
  }

  return (
    <>
      <h6>
        <span className={cx('fr-icon-file-line')}></span>
        Document du rapport d’analyse
      </h6>
      <DocumentLink documentId={analysis.reportDocumentId} />
    </>
  );
};

export default AnalysisOverview;
