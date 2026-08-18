import type { UserPermission } from 'maestro-shared/schema/User/UserPermission';
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
    permission: 'manageNotices',
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
    permission: 'manageSpecificDataFields',
    content: <SpecificDataFieldsView />
  },
  {
    slug: 'plans',
    label: 'Configuration des plans',
    permission: 'administrationMaestro',
    content: <ProgrammingSubPlanSpecificDataView />
  },
  {
    slug: 'dai',
    label: 'DAI',
    permission: 'administrationMaestro',
    content: <AnalysisDaiAdminView />
  },
  {
    slug: 'rai',
    label: 'RAI',
    permission: 'administrationMaestro',
    content: <AnalysisRaiAdminView />
  },
  {
    slug: 'laboratoires',
    label: 'Laboratoires',
    permission: 'manageLaboratoryConfig',
    content: <LaboratoriesAdminView />
  },
  {
    slug: 'analytes',
    label: "Dictionnaire d'analytes",
    permission: 'administrationMaestro',
    content: <LaboratoryResidueMappingsView />
  }
] as const satisfies {
  slug: string;
  label: string;
  permission: UserPermission;
  content: ReactNode;
}[];
