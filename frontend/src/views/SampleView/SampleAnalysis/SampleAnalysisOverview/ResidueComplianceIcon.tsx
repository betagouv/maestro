import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type {
  FrClassName,
  FrIconClassName
} from '@codegouvfr/react-dsfr/fr/generatedFromCss/classNames';
import clsx from 'clsx';
import { ClassValue } from 'clsx/clsx';
import { ResidueCompliance } from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';

export const ResidueComplianceColor: Record<ResidueCompliance, FrClassName> = {
  Compliant: 'fr-label--success',
  NonCompliant: 'fr-label--error',
  Other: 'fr-message'
};

const ComplianceFrIcon: Record<ResidueCompliance, FrIconClassName> = {
  Compliant: 'fr-icon-success-line',
  NonCompliant: 'fr-icon-close-line',
  Other: 'fr-icon-alert-line'
};

type Props = {
  compliance: ResidueCompliance;
  className?: ClassValue[];
};
export const ResidueComplianceIcon: FunctionComponent<Props> = ({
  compliance,
  className,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <span
      className={clsx(
        cx(
          ComplianceFrIcon[compliance],
          ResidueComplianceColor[compliance],
          'fr-icon--sm'
        ),
        className
      )}
    ></span>
  );
};
