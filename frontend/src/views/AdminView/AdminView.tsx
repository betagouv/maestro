import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Notice } from 'maestro-shared/schema/Notice/Notice';
import { useContext, useState } from 'react';
import warningImg from 'src/assets/illustrations/warning.svg';
import AppTextAreaInput from '../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../components/_app/AppTextInput/AppTextInput';
import { RootNoticeComponent } from '../../components/RootNotice/RootNotice';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useForm } from '../../hooks/useForm';
import { ApiClientContext } from '../../services/apiClient';

export const AdminView = () => {
  useDocumentTitle('Administration');

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
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title="Administrations"
        subtitle={`Réservé aux administrateurs Maestro`}
        illustration={warningImg}
      />

      <form>
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
    </section>
  );
};
