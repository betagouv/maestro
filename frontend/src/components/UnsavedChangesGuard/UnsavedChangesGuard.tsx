import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { useCallback, useEffect, useRef } from 'react';
import { useBlocker } from 'react-router';

const unsavedChangesModal = createModal({
  id: 'unsaved-changes-modal',
  isOpenedByDefault: false
});

interface Options {
  when: boolean;
  onDiscard?: () => void;
}

interface UnsavedChangesGuardHandle {
  run: (action: () => void) => void;
  confirm: () => void;
  cancel: () => void;
}

export const useUnsavedChangesGuard = ({
  when,
  onDiscard
}: Options): UnsavedChangesGuardHandle => {
  const pendingActionRef = useRef<(() => void) | null>(null);

  const blocker = useBlocker(
    useCallback(
      ({
        currentLocation,
        nextLocation
      }: {
        currentLocation: { pathname: string };
        nextLocation: { pathname: string };
      }) => when && currentLocation.pathname !== nextLocation.pathname,
      [when]
    )
  );

  const isModalOpen = useIsModalOpen(unsavedChangesModal);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      unsavedChangesModal.open();
    }
  }, [blocker.state]);

  useEffect(() => {
    if (!isModalOpen && blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [isModalOpen, blocker]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (when) {
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [when]);

  const run = useCallback(
    (action: () => void) => {
      if (!when) {
        action();
        return;
      }
      pendingActionRef.current = action;
      unsavedChangesModal.open();
    },
    [when]
  );

  const confirm = useCallback(() => {
    onDiscard?.();
    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;
    pendingAction?.();
    blocker.proceed?.();
  }, [onDiscard, blocker]);

  const cancel = useCallback(() => {
    pendingActionRef.current = null;
    blocker.reset?.();
  }, [blocker]);

  return { run, confirm, cancel };
};

interface Props {
  guard: UnsavedChangesGuardHandle;
}

const UnsavedChangesGuard = ({ guard }: Props) => (
  <unsavedChangesModal.Component
    title="Vous n'avez pas enregistré vos modifications."
    buttons={[
      {
        children: 'Revenir à la page',
        priority: 'secondary',
        onClick: guard.cancel
      },
      {
        children: 'Continuer quand même',
        onClick: guard.confirm
      }
    ]}
  >
    Si vous continuez, elles seront perdues.
  </unsavedChangesModal.Component>
);

export default UnsavedChangesGuard;
