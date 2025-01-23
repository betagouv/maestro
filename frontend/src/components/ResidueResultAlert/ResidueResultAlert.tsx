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
        <Alert severity="success" small description="Résultat conforme" />
      ) : (
        <>
          <Alert
            severity="error"
            small
            description="Résultat brut supérieur à la LMR"
          />
          {result * 0.5 >= lmr && (
            <Alert
              severity="warning"
              small
              description="Résultat  corrigé  supérieur à la LMR"
            />
          )}
        </>
      )}
    </>
  );
};

export default ResidueResultAlert;
