import Alert from '@codegouvfr/react-dsfr/Alert';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';

interface Props {
  programmingSubPlanCodeNat?: string;
  result?: number | null;
  lmr?: number | null;
  lmrIsOptional?: boolean;
}

const ResidueResultAlert = ({
  programmingSubPlanCodeNat,
  result,
  lmr,
  lmrIsOptional
}: Props) => {
  if (!isDefinedAndNotNull(result) || !isDefinedAndNotNull(lmr)) {
    return null;
  }

  if (lmrIsOptional) {
    return null;
  }

  if (result < lmr) {
    return (
      <Alert
        severity="success"
        small
        description="Résultat conforme à la LMR"
      />
    );
  }

  return (
    <>
      <Alert
        severity="error"
        small
        title={'Résultat brut supérieur à la LMR.'}
        description={
          programmingSubPlanCodeNat === 'PPV' ? (
            <>
              Merci de contacter la référente nationale résidus de pesticides
              pour pouvoir finaliser l'interprétation :{' '}
              <a href="mailto:florence.gerault@agriculture.gouv.fr">
                florence.gerault@agriculture.gouv.fr
              </a>
            </>
          ) : (
            <>
              Merci de contacter le BAMRA :{' '}
              <a href="mailto:bamra.sdssa.dgal@agriculture.gouv.fr">
                bamra.sdssa.dgal@agriculture.gouv.fr
              </a>
            </>
          )
        }
      />
      {result * 0.5 >= lmr && (
        <Alert
          severity="warning"
          small
          description="Résultat corrigé supérieur à la LMR"
        />
      )}
    </>
  );
};

export default ResidueResultAlert;
