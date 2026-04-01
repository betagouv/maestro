import Tabs from '@codegouvfr/react-dsfr/Tabs';
import warningImg from 'src/assets/illustrations/warning.svg';
import { AppPage } from 'src/components/_app/AppPage/AppPage';
import { AdminViewDashboardNotice } from './Notice/AdminViewDashboardNotice';
import { AdminViewRootNotice } from './Notice/AdminViewRootNotice';
import { PlanKindSpecificDataView } from './PlanKindSpecificData/PlanKindSpecificDataView';
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
          }
        ]}
      ></Tabs>
    </AppPage>
  );
};
