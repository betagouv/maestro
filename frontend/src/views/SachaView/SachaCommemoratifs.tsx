import Select from '@codegouvfr/react-dsfr/Select';
import {
  MatrixSpecificDataForm,
  ProgrammingPlanKeys
} from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataForm';
import { MatrixSpecificDataFormInputs } from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataFormInputs';
import {
  ProgrammingPlanKind,
  ProgrammingPlanKindLabels,
  ProgrammingPlanKindListSorted
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { FunctionComponent, useContext, useState } from 'react';
import { ApiClientContext } from '../../services/apiClient';
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
        />
      )}
    </div>
  );
};

const CommemoratifsForAProgrammingPlanKind = <
  P extends Exclude<ProgrammingPlanKind, 'PPV'>
>({
  programmingPlanKind
}: {
  programmingPlanKind: P;
}) => {
  const schema = MatrixSpecificDataForm[programmingPlanKind];
  const attributes = Object.keys(schema) as ProgrammingPlanKeys<P>[];

  return (
    <ul>
      {attributes.map((attribute) => (
        <CommemoratifSigleForm
          key={attribute as string}
          attribute={attribute}
          programmingPlanKind={programmingPlanKind}
        ></CommemoratifSigleForm>
      ))}
    </ul>
  );
};

const CommemoratifSigleForm = <P extends Exclude<ProgrammingPlanKind, 'PPV'>>({
  attribute,
  programmingPlanKind
}: {
  attribute: ProgrammingPlanKeys<P>;
  programmingPlanKind: P;
}) => {
  const toto = MatrixSpecificDataForm[programmingPlanKind][attribute];
  return <li>{toto.label ?? MatrixSpecificDataFormInputs[attribute].label}</li>;
};
