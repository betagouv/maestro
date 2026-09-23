import type { UserPermission } from 'maestro-shared/schema/User/UserPermission';
import type { ReactNode } from 'react';
import { AnalysisDaiAdminView } from './AnalysisDaiAdminView/AnalysisDaiAdminView';
import { AnalysisRaiAdminView } from './AnalysisRaiAdminView/AnalysisRaiAdminView';
import { LaboratoriesAdminView } from './LaboratoriesAdminView/LaboratoriesAdminView';
import { LaboratoryResidueMappingsView } from './LaboratoryResidueMappingsView/LaboratoryResidueMappingsView';
import { AdminViewDashboardNotice } from './Notice/AdminViewDashboardNotice';
import { AdminViewRootNotice } from './Notice/AdminViewRootNotice';
import { SpecificDataFieldsView } from './SpecificDataFields/SpecificDataFieldsView';

export const adminSections = [
  {
    slug: 'alertes',
    label: 'Alerte et message',
    accountPermission: 'manageNotices',
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
    accountPermission: 'readSpecificDataFields',
    content: <SpecificDataFieldsView />
  },
  {
    slug: 'dai',
    label: 'DAI',
    accountPermission: 'administrationMaestro',
    content: <AnalysisDaiAdminView />
  },
  {
    slug: 'rai',
    label: 'RAI',
    accountPermission: 'administrationMaestro',
    content: <AnalysisRaiAdminView />
  },
  {
    slug: 'laboratoires',
    label: 'Laboratoires',
    accountPermission: 'manageLaboratoryConfig',
    content: <LaboratoriesAdminView />
  },
  {
    slug: 'analytes',
    label: "Dictionnaire d'analytes",
    accountPermission: 'administrationMaestro',
    content: <LaboratoryResidueMappingsView />
  }
] as const satisfies {
  slug: string;
  label: string;
  accountPermission: UserPermission;
  content: ReactNode;
}[];
