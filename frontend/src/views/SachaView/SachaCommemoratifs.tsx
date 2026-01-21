import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import {
  MatrixSpecificDataForm,
  ProgrammingPlanKeys
} from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataForm';
import {
  ProgrammingPlanKind,
  ProgrammingPlanKindLabels,
  ProgrammingPlanKindListSorted
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SachaCommemoratifRecord } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { FunctionComponent, useContext, useState } from 'react';
import { ApiClientContext } from '../../services/apiClient';
import { CommemoratifSigleForm } from './CommemoratifSigleForm';
import { SachaCommemoratifsUpload } from './SachaCommemoratifsUpload';

export const SachaCommemoratifs: FunctionComponent = () => {
  const { useGetSachaCommemoratifsQuery } = useContext(ApiClientContext);

  const { data: sachaCommemoratifs } = useGetSachaCommemoratifsQuery();

  const [programmingPlanSelected, setProgrammingPlanSelected] =
    useState<Exclude<ProgrammingPlanKind, 'PPV'> | null>(null);
  const onSelect = (value: Exclude<ProgrammingPlanKind, 'PPV'>) => {
    setProgrammingPlanSelected(value);
  };

  return (
    <div>
      <SachaCommemoratifsUpload />

      <Select
        label="Type de plan"
        nativeSelectProps={{
          value: programmingPlanSelected ?? '',
          onChange: (e) =>
            onSelect(e.target.value as Exclude<ProgrammingPlanKind, 'PPV'>)
        }}
      >
        <option value="" disabled>
          Sélectionner un type de plan
        </option>
        {ProgrammingPlanKindListSorted.filter((value) => value !== 'PPV').map(
          (v) => (
            <option key={v} value={v}>
              {ProgrammingPlanKindLabels[v]}
            </option>
          )
        )}
      </Select>
      {programmingPlanSelected && sachaCommemoratifs && (
        <CommemoratifsForAProgrammingPlanKind
          programmingPlanKind={programmingPlanSelected}
          sachaCommemoratifs={sachaCommemoratifs}
        />
      )}
    </div>
  );
};

const CommemoratifsForAProgrammingPlanKind = <
  P extends Exclude<ProgrammingPlanKind, 'PPV'>
>({
  programmingPlanKind,
  sachaCommemoratifs
}: {
  programmingPlanKind: P;
  sachaCommemoratifs: SachaCommemoratifRecord;
}) => {
  const schema = MatrixSpecificDataForm[programmingPlanKind];
  const attributes = Object.keys(schema) as ProgrammingPlanKeys<P>[];

  return (
    <div>
      {attributes.map((attribute) => (
        <>
          <CommemoratifSigleForm
            key={attribute as string}
            attribute={attribute}
            programmingPlanKind={programmingPlanKind}
            sachaCommemoratifs={sachaCommemoratifs}
          ></CommemoratifSigleForm>
          <hr className={cx('fr-mb-2w')} />
        </>
      ))}
    </div>
  );
};
