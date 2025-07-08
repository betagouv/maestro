import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { RootNotice } from 'maestro-shared/schema/RootNotice/RootNotice';
import { useState } from 'react';
import warningImg from 'src/assets/illustrations/warning.svg';
import AppTextAreaInput from '../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../components/_app/AppTextInput/AppTextInput';
import { RootNoticeComponent } from '../../components/RootNotice/RootNotice';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useForm } from '../../hooks/useForm';

export const AdminView = () => {
  useDocumentTitle('Administration');

  const [rootNotice, setRootNotice] = useState<RootNotice>({
    title: 'TITLE',
    description: 'DESCR'
  });

  const form = useForm(RootNotice, rootNotice);

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title="Administrations"
        subtitle={`Réservé aux administrateurs Maestro`}
        illustration={warningImg}
      />

      <form>
        <AppTextInput
          defaultValue={''}
          onChange={(e) =>
            setRootNotice((n) => ({ ...n, title: e.target.value }))
          }
          inputForm={form}
          inputKey="title"
          label="Titre de l'alerte"
          required
        />
        <AppTextAreaInput
          defaultValue={''}
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
              priority: 'tertiary',
              onClick: () => ({}),
              iconId: 'fr-icon-delete-line'
            },
            {
              children: 'Enregistrer',
              onClick: () => ({}),
              iconId: 'fr-icon-save-line',
              iconPosition: 'right'
            }
          ]}
        />
      </form>
    </section>
  );
};
