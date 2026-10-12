import type { createModal } from '@codegouvfr/react-dsfr/Modal';

export const focusFirstInputWhenVisible = (
  modal: Pick<ReturnType<typeof createModal>, 'id'>
) => {
  const focus = () => {
    const dialog = document.getElementById(modal.id);
    const input = dialog?.querySelector('input');

    if (!dialog?.hasAttribute('open') || !input) {
      return;
    }

    input.focus();

    if (document.activeElement !== input) {
      requestAnimationFrame(focus);
    }
  };

  requestAnimationFrame(focus);
};
