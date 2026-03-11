import Alert from '@codegouvfr/react-dsfr/Alert';
import type { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';

interface Props {
  programmingPlanKind?: ProgrammingPlanKind;
  result?: number | null;
  lmr?: number | null;
}

const ResidueResultAlert = ({ programmingPlanKind, result, lmr }: Props) => {
  if (!isDefinedAndNotNull(result) || !isDefinedAndNotNull(lmr)) {
    return null;
  }

  return (
    <>
      {result < lmr ? (
        <Alert
          severity="success"
          small
          description="Résultat conforme à la LMR"
        />
      ) : (
        <>
          <Alert
            severity="error"
            small
            title={'Résultat brut supérieur à la LMR.'}
            description={
              programmingPlanKind === 'PPV' ? (
                <>
                  Merci de contacter la référente nationale résidus de
                  pesticides pour pouvoir finaliser l'interprétation :{' '}
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
      )}
    </>
  );
};

export default ResidueResultAlert;
