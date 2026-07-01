import type { ReactNode } from 'react';
import { AnalysisDaiAdminView } from './AnalysisDaiAdminView/AnalysisDaiAdminView';
import { AnalysisRaiAdminView } from './AnalysisRaiAdminView/AnalysisRaiAdminView';
import { LaboratoriesAdminView } from './LaboratoriesAdminView/LaboratoriesAdminView';
import { LaboratoryResidueMappingsView } from './LaboratoryResidueMappingsView/LaboratoryResidueMappingsView';
import { AdminViewDashboardNotice } from './Notice/AdminViewDashboardNotice';
import { AdminViewRootNotice } from './Notice/AdminViewRootNotice';
import { ProgrammingSubPlanSpecificDataView } from './ProgrammingSubPlanSpecificData/ProgrammingSubPlanSpecificDataView';
import { SpecificDataFieldsView } from './SpecificDataFields/SpecificDataFieldsView';

export const adminSections = [
  {
    slug: 'alertes',
    label: 'Alerte et message',
    content: (
      <>
        <AdminViewRootNotice />
        <AdminViewDashboardNotice />
      </>
    )
  },
  {
    slug: 'descripteurs',
    label: 'Dictionnaire des descripteurs',
    content: <SpecificDataFieldsView />
  },
  {
    slug: 'plans',
    label: 'Configuration des plans',
    content: <ProgrammingSubPlanSpecificDataView />
  },
  {
    slug: 'dai',
    label: 'DAI',
    content: <AnalysisDaiAdminView />
  },
  {
    slug: 'rai',
    label: 'RAI',
    content: <AnalysisRaiAdminView />
  },
  {
    slug: 'laboratoires',
    label: 'Laboratoires',
    content: <LaboratoriesAdminView />
  },
  {
    slug: 'analytes',
    label: "Dictionnaire d'analytes",
    content: <LaboratoryResidueMappingsView />
  }
] as const satisfies {
  slug: string;
  label: string;
  content: ReactNode;
}[];
