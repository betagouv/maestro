import Button, { type ButtonProps } from '@codegouvfr/react-dsfr/Button';
import useWindowSize from 'src/hooks/useWindowSize';

const AppResponsiveButton = ({ children, ...props }: ButtonProps) => {
  const { isMobile } = useWindowSize();

  return <Button {...props}>{!isMobile ? children : undefined}</Button>;
};

export default AppResponsiveButton;
