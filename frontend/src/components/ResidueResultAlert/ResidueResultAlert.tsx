import Alert from '@codegouvfr/react-dsfr/Alert';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';

interface Props {
  result?: number | null;
  lmr?: number | null;
}

const ResidueResultAlert = ({ result, lmr }: Props) => {
  if (!isDefinedAndNotNull(result) || !isDefinedAndNotNull(lmr)) {
    return <></>;
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
              <>
                Merci de contacter la référente nationale résidus de pesticides
                pour pouvoir finaliser l'interprétation :{' '}
                <a href="mailto:florence.gerault@agriculture.gouv.fr">
                  florence.gerault@agriculture.gouv.fr
                </a>
              </>
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
