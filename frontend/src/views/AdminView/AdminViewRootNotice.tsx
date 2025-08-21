import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Notice } from 'maestro-shared/schema/Notice/Notice';
import { FunctionComponent, useContext, useState } from 'react';
import { ApiClientContext } from 'src/services/apiClient';
import { assert, type Equals } from 'tsafe';
import AppTextAreaInput from '../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../components/_app/AppTextInput/AppTextInput';
import { RootNoticeComponent } from '../../components/RootNotice/RootNotice';
import { useForm } from '../../hooks/useForm';

type Props = Record<never, never>;
export const AdminViewRootNotice: FunctionComponent<Props> = ({ ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { useGetRootNoticeQuery, useUpdateRootNoticeMutation } =
    useContext(ApiClientContext);

  const { data } = useGetRootNoticeQuery();
  const [updateRootNotice] = useUpdateRootNoticeMutation();

  const [rootNotice, setRootNotice] = useState<Notice>(
    data ?? { type: 'root', title: null, description: null }
  );

  const form = useForm(Notice, rootNotice);

  const save = () => {
    form.validate(async (n) => {
      updateRootNotice(n);
    });
  };
  const deleteNotice = () => {
    setRootNotice({ type: 'root', title: null, description: null });
    updateRootNotice({ type: 'root', title: null, description: null });
  };

  return (
    <form className={clsx('bg-white', cx('fr-p-2w'))}>
      <h3>Configuration de l'alerte générale</h3>
      <AppTextInput
        value={rootNotice.title ?? ''}
        onChange={(e) =>
          setRootNotice((n) => ({ ...n, title: e.target.value }))
        }
        inputForm={form}
        inputKey="title"
        label="Titre de l'alerte"
        required
      />
      <AppTextAreaInput
        value={rootNotice.description ?? ''}
        onChange={(e) =>
          setRootNotice((n) => ({ ...n, description: e.target.value }))
        }
        inputForm={form}
        inputKey="description"
        label="Description de l'alerte"
        required
      />

      {rootNotice.title && (
        <div className={cx('fr-mb-2w')}>
          <RootNoticeComponent notice={rootNotice} />
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
