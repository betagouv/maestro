import Button, { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import { useBreakpointsValuesPx } from '@codegouvfr/react-dsfr/useBreakpointsValuesPx';
import useWindowWidth from 'src/hooks/useWindowWidth';

const AppResponsiveButton = ({ children, ...props }: ButtonProps) => {
  const { breakpointsValues } = useBreakpointsValuesPx();
  const width = useWindowWidth();

  return (
    <Button
      {...props}
      children={width > breakpointsValues.sm ? children : undefined}
    ></Button>
  );
};

export default AppResponsiveButton;
