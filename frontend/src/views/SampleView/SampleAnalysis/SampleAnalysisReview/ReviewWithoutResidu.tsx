import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';

type Props = {
  partialAnalysis: Pick<PartialAnalysis, 'id'>;
  onValidateAnalysis: () => void;
  onCorrectAnalysis: (residues: PartialResidue[]) => void;
};
export const ReviewWithoutResidu: FunctionComponent<Props> = ({
  partialAnalysis,
  onValidateAnalysis,
  onCorrectAnalysis,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const onCorrection = () => {
    onCorrectAnalysis([
      {
        analysisId: partialAnalysis.id,
        residueNumber: 1,
        resultKind: 'Q'
      }
    ]);
  };

  return (
    <>
      <div>
        <h6 className="d-flex-align-center">
          <span
            className={clsx(cx('fr-icon-survey-line', 'fr-mr-1w'), 'icon-grey')}
          ></span>
          <div className="flex-grow-1">Conformité globale de l'échantillon</div>
        </h6>
        <div>
          <span
            className={cx(
              'fr-icon-success-fill',
              'fr-label--success',
              'fr-mr-1w'
            )}
          />
          Échantillon conforme
        </div>
      </div>
      <hr />
      <ButtonsGroup
        inlineLayoutWhen="always"
        alignment="between"
        buttons={[
          {
            children: 'Corriger',
            iconId: 'fr-icon-edit-line',
            priority: 'secondary',
            className: cx('fr-mb-0', 'fr-mt-0'),
            onClick: onCorrection
          },
          {
            children: "Valider les données et l'interprétation",
            iconId: 'fr-icon-check-line',
            priority: 'primary',
            className: cx('fr-mb-0', 'fr-mt-0'),
            onClick: onValidateAnalysis
          }
        ]}
      />
    </>
  );
};
