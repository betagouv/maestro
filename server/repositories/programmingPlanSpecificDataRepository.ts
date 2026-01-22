import { ProgrammingPlanKindWithSacha } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlanSpecificDataSigleRecord } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSpecificDataSigle';
import { kysely } from './kysely';
import {
  ProgrammingPlanSpecificDataAttribute,
  ProgrammingPlanSpecificDataAttributeValue
} from './kysely.type';

const findAll = async (): Promise<ProgrammingPlanSpecificDataSigleRecord> => {
  const specificDataSigles = await kysely
    .selectFrom('programmingPlanSpecificDataAttribute')
    .selectAll()
    .execute();

  const valueSigles = await kysely
    .selectFrom('programmingPlanSpecificDataAttributeValue')
    .selectAll()
    .execute();

  return Object.fromEntries(
    ProgrammingPlanKindWithSacha.options.map((k) => [
      k,
      {
        programmingPlanKind: k,
        attributes: Object.fromEntries(
          specificDataSigles
            .filter((c) => c.programmingPlanKind === k)
            .map((c) => [
              c.attribute,
              {
                attribute: c.attribute,
                sachaCommemoratifSigle: c.sachaCommemoratifSigle,
                values: Object.fromEntries(
                  valueSigles
                    .filter(
                      (v) =>
                        v.programmingPlanKind === c.programmingPlanKind &&
                        v.attribute === c.attribute
                    )
                    .map((v) => [
                      v.attributeValue,
                      v.sachaCommemoratifValueSigle
                    ])
                )
              }
            ])
        )
      }
    ])
  ) as ProgrammingPlanSpecificDataSigleRecord;
};

const updateProgrammingPlanSpecificDataAttribute = async (
  programmingPlanSpecificDataAttribute: ProgrammingPlanSpecificDataAttribute
) => {
  await kysely
    .insertInto('programmingPlanSpecificDataAttribute')
    .values(programmingPlanSpecificDataAttribute)
    .onConflict((oc) =>
      oc.columns(['programmingPlanKind', 'attribute']).doUpdateSet({
        sachaCommemoratifSigle:
          programmingPlanSpecificDataAttribute.sachaCommemoratifSigle,
        inDAI: programmingPlanSpecificDataAttribute.inDAI
      })
    )
    .execute();
};

const updateProgrammingPlanSpecificDataAttributeValue = async (
  programmingPlanSpecificDataAttributeValue: ProgrammingPlanSpecificDataAttributeValue
) => {
  await kysely
    .insertInto('programmingPlanSpecificDataAttributeValue')
    .values(programmingPlanSpecificDataAttributeValue)
    .onConflict((oc) =>
      oc
        .columns(['programmingPlanKind', 'attribute', 'attributeValue'])
        .doUpdateSet({
          sachaCommemoratifValueSigle:
            programmingPlanSpecificDataAttributeValue.sachaCommemoratifValueSigle
        })
    )
    .execute();
};

export const programmingPlanSpecificDataRepository = {
  findAll,
  updateProgrammingPlanSpecificDataAttribute,
  updateProgrammingPlanSpecificDataAttributeValue
};
