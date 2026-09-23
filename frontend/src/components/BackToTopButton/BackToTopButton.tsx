import Button from '@codegouvfr/react-dsfr/Button';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import './BackToTopButton.scss';

const SCROLL_THRESHOLD = 400;

interface Props {
  raised?: boolean;
}

const BackToTopButton = ({ raised }: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > SCROLL_THRESHOLD);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={clsx('back-to-top', { 'back-to-top--raised': raised })}>
      <Button
        iconId="fr-icon-arrow-up-fill"
        priority="secondary"
        title="Haut de page"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        Haut de page
      </Button>
    </div>
  );
};

export default BackToTopButton;
