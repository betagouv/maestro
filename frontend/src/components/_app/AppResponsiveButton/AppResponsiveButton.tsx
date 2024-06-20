import Button, { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import useWindowSize from 'src/hooks/useWindowSize';

const AppResponsiveButton = ({ children, ...props }: ButtonProps) => {
  const { isMobile } = useWindowSize();

  return (
    <Button {...props} children={!isMobile ? children : undefined}></Button>
  );
};

export default AppResponsiveButton;
