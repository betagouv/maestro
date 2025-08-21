import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Notice } from 'maestro-shared/schema/Notice/Notice';
import { FunctionComponent, useContext, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import AppTextAreaInput from '../../components/_app/AppTextAreaInput/AppTextAreaInput';
import { DashboardNotice } from '../../components/DashboardNotice/DashboardNotice';
import { useForm } from '../../hooks/useForm';
import { ApiClientContext } from '../../services/apiClient';

type Props = Record<never, never>;
export const AdminViewDashboardNotice: FunctionComponent<Props> = ({
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { useGetDashboardNoticeQuery, useUpdateDashboardNoticeMutation } =
    useContext(ApiClientContext);

  const { data } = useGetDashboardNoticeQuery();
  const [updateDashboardNotice] = useUpdateDashboardNoticeMutation();

  const [dashboardNotice, setDashboardNotice] = useState<Notice>(
    data ?? { type: 'dashboard', title: null, description: null }
  );

  const form = useForm(Notice, dashboardNotice);

  const save = () => {
    form.validate(async (n) => {
      updateDashboardNotice(n);
    });
  };
  const deleteNotice = () => {
    setDashboardNotice({ type: 'dashboard', title: null, description: null });
    updateDashboardNotice({
      type: 'dashboard',
      title: null,
      description: null
    });
  };
  return (
    <form className={clsx('bg-white', cx('fr-p-2w'))}>
      <h3>Configuration du message du Tableau de bord</h3>
      <AppTextAreaInput
        value={dashboardNotice.description ?? ''}
        onChange={(e) =>
          setDashboardNotice((n) => ({ ...n, description: e.target.value }))
        }
        inputForm={form}
        inputKey="description"
        label="Description du message du tableau de bord"
        required
      />

      {dashboardNotice.description && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DashboardNotice
            description={dashboardNotice.description}
            className={cx('fr-col-6', 'fr-mb-2w')}
          />
        </div>
      )}

      <ButtonsGroup
        alignment="between"
        inlineLayoutWhen="md and up"
        buttons={[
          {
            children: 'Supprimer',
            type: 'button',
            priority: 'tertiary',
            onClick: () => deleteNotice(),
            iconId: 'fr-icon-delete-line'
          },
          {
            children: 'Enregistrer',
            type: 'button',
            onClick: () => save(),
            iconId: 'fr-icon-save-line',
            iconPosition: 'right'
          }
        ]}
      />
    </form>
  );
};
