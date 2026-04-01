import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import warningImg from 'src/assets/illustrations/warning.svg';
import { AppPage } from 'src/components/_app/AppPage/AppPage';
import { AdminViewDashboardNotice } from './AdminViewDashboardNotice';
import { AdminViewRootNotice } from './AdminViewRootNotice';
import { AdminViewDashboardNotice } from './Notice/AdminViewDashboardNotice';
import { AdminViewRootNotice } from './Notice/AdminViewRootNotice';
import { PlanKindSpecificDataView } from './PlanKindSpecificData/PlanKindSpecificDataView';
import { ProgrammingPlanAdmin } from './ProgrammingPlanAdmin/ProgrammingPlanAdmin';
import { SpecificDataFieldsView } from './SpecificDataFields/SpecificDataFieldsView';

export const AdminView = () => {
  return (
    <AppPage
      title="Administrations"
      subtitle={`Réservé aux administrateurs Maestro`}
      illustration={warningImg}
      documentTitle="Administration"
    >
      <Tabs
        tabs={[
          {
            label: 'Alerte et message',
            content: (
              <>
                <AdminViewRootNotice />
                <AdminViewDashboardNotice />
              </>
            )
          },
          {
            label: 'Configuration des descripteurs',
            content: <SpecificDataFieldsView />
          },
          {
            label: 'Configuration des plans',
            content: <PlanKindSpecificDataView />
          },
          {
            label: 'Plans de programmation',
            content: <ProgrammingPlanAdmin />
          }
        ]}
        className={clsx({
          'full-width': true
        })}
      ></Tabs>
    </AppPage>
  );
};
