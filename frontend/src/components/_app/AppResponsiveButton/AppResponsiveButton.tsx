import Button, { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import useWindowWidth from 'src/hooks/useWindowWidth';

const AppResponsiveButton = ({ children, ...props }: ButtonProps) => {
  const { isMobile } = useWindowWidth();

  return (
    <Button {...props} children={!isMobile ? children : undefined}></Button>
  );
};

export default AppResponsiveButton;
