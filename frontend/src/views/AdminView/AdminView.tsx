import Tabs from '@codegouvfr/react-dsfr/Tabs';
import warningImg from 'src/assets/illustrations/warning.svg';
import { AppPage } from 'src/components/_app/AppPage/AppPage';
import { SachaCommemoratifs } from '../SachaView/SachaCommemoratifs';
import { AdminViewDashboardNotice } from './AdminViewDashboardNotice';
import { AdminViewRootNotice } from './AdminViewRootNotice';

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
            label: 'Configuration Sacha',
            content: <SachaCommemoratifs />
          }
        ]}
      ></Tabs>
    </AppPage>
  );
};
