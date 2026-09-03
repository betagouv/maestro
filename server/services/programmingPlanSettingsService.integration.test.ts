import type { Stage } from 'maestro-shared/referential/Stage';
import { ProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type {
  ProgrammingPlanFieldSetting,
  ProgrammingSubPlanFieldSetting
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import type {
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import {
  DAOABovinInProgressSubPlanFixture,
  DAOAInProgressProgrammingPlanFixture,
  DAOAVolailleInProgressSubPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  DAOABovinFieldConfigs,
  DAOAVolailleFieldConfigs
} from 'maestro-shared/test/specificDataFixtures';
import { SamplerDaoaFixture } from 'maestro-shared/test/userFixtures';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { kysely } from '../repositories/kysely';
import { programmingSubPlanRepository } from '../repositories/programmingSubPlanRepository';
import { specificDataFieldConfigRepository } from '../repositories/specificDataFieldConfigRepository';
import { userRepository } from '../repositories/userRepository';
import { programmingPlanSettingsService } from './programmingPlanSettingsService';

const findOwnSettings = async (
  id: ProgrammingSubPlanId
): Promise<ProgrammingPlanSettings | undefined> => {
  const ownSettings = await kysely
    .selectFrom('programmingSubPlansRaw')
    .select(['stages', 'stagesManaged'])
    .where('id', '=', id)
    .executeTakeFirst();

  return ownSettings ? ProgrammingPlanSettings.parse(ownSettings) : undefined;
};

describe('ProgrammingPlan settings inheritance', () => {
  const programmingPlanId = DAOAInProgressProgrammingPlanFixture.id;
  const subPlanFixtures = [
    DAOAVolailleInProgressSubPlanFixture,
    DAOABovinInProgressSubPlanFixture
  ];

  afterEach(async () => {
    await programmingPlanSettingsService.savePlanSettings(programmingPlanId, {
      stages: null,
      stagesManaged: false,
      fields: []
    });
    for (const subPlan of subPlanFixtures) {
      await programmingSubPlanRepository.updateSettings(subPlan.id, {
        stages: subPlan.stages,
        stagesManaged: true
      });
    }
  });

  const managePlanStages = (stages: Stage[] | null) =>
    programmingPlanSettingsService.savePlanSettings(programmingPlanId, {
      stages,
      stagesManaged: true,
      fields: []
    });

  describe('when the plan starts managing a setting', () => {
    test('should hand its value down to every sub-plan without touching their own value', async () => {
      await managePlanStages(['TRANSFORMATION']);

      for (const subPlan of subPlanFixtures) {
        await expect(
          programmingSubPlanRepository.findUnique(subPlan.id)
        ).resolves.toMatchObject({
          stages: ['TRANSFORMATION'],
          stagesManaged: false
        });
        await expect(findOwnSettings(subPlan.id)).resolves.toStrictEqual({
          stages: subPlan.stages,
          stagesManaged: false
        });
      }
    });

    test('should hand an empty value down as is', async () => {
      await managePlanStages(null);

      for (const subPlan of subPlanFixtures) {
        await expect(
          programmingSubPlanRepository.findUnique(subPlan.id)
        ).resolves.toMatchObject({ stages: null, stagesManaged: false });
      }
    });
  });

  describe('when the plan keeps managing a setting', () => {
    test('should update the inherited sub-plans and leave the detached ones alone', async () => {
      await managePlanStages(['TRANSFORMATION']);
      await programmingSubPlanRepository.updateSettings(
        DAOAVolailleInProgressSubPlanFixture.id,
        { stages: ['ELEVAGE'], stagesManaged: true }
      );

      await managePlanStages(['ABATTAGE']);

      await expect(
        programmingSubPlanRepository.findUnique(
          DAOAVolailleInProgressSubPlanFixture.id
        )
      ).resolves.toMatchObject({ stages: ['ELEVAGE'], stagesManaged: true });
      await expect(
        programmingSubPlanRepository.findUnique(
          DAOABovinInProgressSubPlanFixture.id
        )
      ).resolves.toMatchObject({ stages: ['ABATTAGE'], stagesManaged: false });
    });
  });

  describe('when the plan stops managing a setting', () => {
    test('should freeze the inherited value on every sub-plan', async () => {
      await managePlanStages(['TRANSFORMATION']);

      await programmingPlanSettingsService.savePlanSettings(programmingPlanId, {
        stages: ['TRANSFORMATION'],
        stagesManaged: false,
        fields: []
      });

      for (const subPlan of subPlanFixtures) {
        await expect(findOwnSettings(subPlan.id)).resolves.toStrictEqual({
          stages: ['TRANSFORMATION'],
          stagesManaged: true
        });
      }
    });
  });

  describe('when a sub-plan detaches or reattaches', () => {
    test('should resolve on its own value, leaving its siblings inherited', async () => {
      await managePlanStages(['TRANSFORMATION']);

      await programmingSubPlanRepository.updateSettings(
        DAOAVolailleInProgressSubPlanFixture.id,
        { stages: ['ELEVAGE'], stagesManaged: true }
      );

      await expect(
        programmingSubPlanRepository.findUnique(
          DAOAVolailleInProgressSubPlanFixture.id
        )
      ).resolves.toMatchObject({ stages: ['ELEVAGE'], stagesManaged: true });
      await expect(
        programmingSubPlanRepository.findUnique(
          DAOABovinInProgressSubPlanFixture.id
        )
      ).resolves.toMatchObject({
        stages: ['TRANSFORMATION'],
        stagesManaged: false
      });
    });

    test('should resolve on the plan value again once reattached', async () => {
      await managePlanStages(['TRANSFORMATION']);
      await programmingSubPlanRepository.updateSettings(
        DAOAVolailleInProgressSubPlanFixture.id,
        { stages: ['ELEVAGE'], stagesManaged: true }
      );

      await programmingSubPlanRepository.updateSettings(
        DAOAVolailleInProgressSubPlanFixture.id,
        { stages: ['ELEVAGE'], stagesManaged: false }
      );

      await expect(
        programmingSubPlanRepository.findUnique(
          DAOAVolailleInProgressSubPlanFixture.id
        )
      ).resolves.toMatchObject({
        stages: ['TRANSFORMATION'],
        stagesManaged: false
      });
    });
  });

  test('should keep targeting the same users through the resolution view', async () => {
    const targetedSubPlanIds = async () =>
      (
        await userRepository.findUnique(SamplerDaoaFixture.id)
      )?.programmingSubPlans.map((subPlan) => subPlan.id) ?? [];

    const subPlanIds = subPlanFixtures.map((subPlan) => subPlan.id);

    for (const subPlan of subPlanFixtures) {
      await programmingSubPlanRepository.updateSettings(subPlan.id, {
        stages: null,
        stagesManaged: true
      });
    }

    await expect(targetedSubPlanIds()).resolves.toEqual(
      expect.not.arrayContaining(subPlanIds)
    );

    await managePlanStages(['ABATTAGE']);

    await expect(targetedSubPlanIds()).resolves.toEqual(
      expect.arrayContaining(subPlanIds)
    );
  });
});

describe('ProgrammingPlan sampler form inheritance', () => {
  const programmingPlanId = DAOAInProgressProgrammingPlanFixture.id;
  const volailleSubPlanId = DAOAVolailleInProgressSubPlanFixture.id;
  const bovinSubPlanId = DAOABovinInProgressSubPlanFixture.id;
  const subPlanIds = [volailleSubPlanId, bovinSubPlanId];

  const managedFieldKeys = ['testManagedFieldA', 'testManagedFieldB'];
  let fieldIdByKey: Record<string, SpecificDataFieldId>;
  let optionIds: SpecificDataFieldOptionId[];
  let planSettings: ProgrammingPlanSettings;

  beforeAll(async () => {
    const fields = await kysely
      .insertInto('specificDataFields')
      .values(
        managedFieldKeys.map((key) => ({
          key,
          inputType: 'select',
          label: `Descripteur ${key}`
        }))
      )
      .returning(['id', 'key'])
      .execute();

    fieldIdByKey = Object.fromEntries(fields.map((_) => [_.key, _.id]));

    const options = await kysely
      .insertInto('specificDataFieldOptions')
      .values(
        ['OPT1', 'OPT2'].map((value, index) => ({
          fieldKey: managedFieldKeys[0],
          value,
          label: value,
          order: index + 1,
          sachaCommemoratifValueSigle: null
        }))
      )
      .returning('id')
      .execute();

    optionIds = options.map((_) => _.id);

    planSettings = ProgrammingPlanSettings.parse(
      await kysely
        .selectFrom('programmingPlans')
        .select(['stages', 'stagesManaged'])
        .where('id', '=', programmingPlanId)
        .executeTakeFirstOrThrow()
    );
  });

  afterEach(async () => {
    const fieldIds = Object.values(fieldIdByKey);
    await kysely
      .deleteFrom('programmingSubPlanFieldsRaw')
      .where('fieldId', 'in', fieldIds)
      .execute();
    await kysely
      .deleteFrom('programmingPlanFields')
      .where('fieldId', 'in', fieldIds)
      .execute();
  });

  afterAll(async () => {
    await kysely
      .deleteFrom('specificDataFields')
      .where('key', 'in', managedFieldKeys)
      .execute();
  });

  const planField = (
    key: string,
    field: Partial<ProgrammingPlanFieldSetting> = {}
  ): ProgrammingPlanFieldSetting => ({
    fieldId: fieldIdByKey[key],
    required: true,
    optionIds: [],
    ...field
  });

  const savePlanForm = (fields: ProgrammingPlanFieldSetting[]) =>
    programmingPlanSettingsService.savePlanSettings(programmingPlanId, {
      ...planSettings,
      fields
    });

  const subPlanForm = (programmingSubPlanId: ProgrammingSubPlanId) =>
    specificDataFieldConfigRepository.findSubPlanFieldSettings(
      programmingSubPlanId
    );

  const saveSubPlanForm = async (
    programmingSubPlanId: ProgrammingSubPlanId,
    fields: ProgrammingSubPlanFieldSetting[]
  ) => {
    const settings = await findOwnSettings(programmingSubPlanId);
    await programmingPlanSettingsService.saveSubPlanSettings(
      programmingPlanId,
      programmingSubPlanId,
      { ...settings!, fields }
    );
  };

  const editSubPlanField = async (
    programmingSubPlanId: ProgrammingSubPlanId,
    key: string,
    change: Partial<ProgrammingSubPlanFieldSetting>
  ) => {
    const fields = await subPlanForm(programmingSubPlanId);
    await saveSubPlanForm(
      programmingSubPlanId,
      fields.map((field) =>
        field.fieldId === fieldIdByKey[key] ? { ...field, ...change } : field
      )
    );
  };

  const appendOwnSubPlanField = async (
    programmingSubPlanId: ProgrammingSubPlanId,
    key: string,
    required = false
  ) => {
    const fields = await subPlanForm(programmingSubPlanId);
    await saveSubPlanForm(programmingSubPlanId, [
      ...fields,
      {
        fieldId: fieldIdByKey[key],
        required,
        optionIds: [],
        inheritance: 'Own',
        managedAtPlanLevel: false
      }
    ]);
  };

  const subPlanFormField = async (
    programmingSubPlanId: ProgrammingSubPlanId,
    key: string
  ) =>
    (
      await specificDataFieldConfigRepository.findByPlanSubPlan(
        programmingSubPlanId
      )
    ).find((config) => config.field.key === key);

  const subPlanFormKeys = async (programmingSubPlanId: ProgrammingSubPlanId) =>
    (
      await specificDataFieldConfigRepository.findByPlanSubPlan(
        programmingSubPlanId
      )
    ).map((config) => config.field.key);

  const rawOrders = async (programmingSubPlanId: ProgrammingSubPlanId) =>
    kysely
      .selectFrom('programmingSubPlanFieldsRaw')
      .select(['fieldId', 'order'])
      .where('programmingSubPlanId', '=', programmingSubPlanId)
      .where('fieldId', 'in', Object.values(fieldIdByKey))
      .orderBy('fieldId')
      .execute();

  describe('when the plan starts managing a descriptor', () => {
    test('should hand it down to every sub-plan, at the head of the form', async () => {
      await savePlanForm([planField(managedFieldKeys[0], { optionIds })]);

      for (const programmingSubPlanId of subPlanIds) {
        const config = await subPlanFormField(
          programmingSubPlanId,
          managedFieldKeys[0]
        );

        expect(config).toMatchObject({
          order: 1,
          required: true,
          inheritance: 'Inherited'
        });
        expect(config?.field.options.map((_) => _.value)).toEqual([
          'OPT1',
          'OPT2'
        ]);
      }
    });

    test('should make a descriptor the sub-plan already carried join the plan block', async () => {
      await appendOwnSubPlanField(volailleSubPlanId, managedFieldKeys[0]);

      expect(
        await subPlanFormField(volailleSubPlanId, managedFieldKeys[0])
      ).toMatchObject({
        order: DAOAVolailleFieldConfigs.length + 1,
        inheritance: 'Own'
      });

      await savePlanForm([planField(managedFieldKeys[0])]);

      expect(
        await subPlanFormField(volailleSubPlanId, managedFieldKeys[0])
      ).toMatchObject({
        order: 1,
        inheritance: 'Inherited',
        required: true
      });
    });
  });

  describe('when a sub-plan detaches a descriptor', () => {
    test('should copy the plan value and keep the plan position, leaving its siblings inherited', async () => {
      await savePlanForm([planField(managedFieldKeys[0], { optionIds })]);

      await editSubPlanField(volailleSubPlanId, managedFieldKeys[0], {
        inheritance: 'Own'
      });

      const detached = await subPlanFormField(
        volailleSubPlanId,
        managedFieldKeys[0]
      );
      expect(detached).toMatchObject({
        order: 1,
        required: true,
        inheritance: 'Own'
      });
      expect(detached?.field.options.map((_) => _.value)).toEqual([
        'OPT1',
        'OPT2'
      ]);
      expect(
        await subPlanFormField(bovinSubPlanId, managedFieldKeys[0])
      ).toMatchObject({ inheritance: 'Inherited' });
    });
  });

  describe('when a sub-plan excludes a descriptor', () => {
    test('should drop it from its form only, and keep showing it in the settings form', async () => {
      await savePlanForm([planField(managedFieldKeys[0])]);

      await editSubPlanField(volailleSubPlanId, managedFieldKeys[0], {
        inheritance: 'Excluded'
      });

      expect(
        await subPlanFormField(volailleSubPlanId, managedFieldKeys[0])
      ).toBeUndefined();
      expect(
        await subPlanFormField(bovinSubPlanId, managedFieldKeys[0])
      ).toBeDefined();

      expect(await subPlanForm(volailleSubPlanId)).toContainEqual(
        expect.objectContaining({
          fieldId: fieldIdByKey[managedFieldKeys[0]],
          inheritance: 'Excluded',
          managedAtPlanLevel: true
        })
      );
    });
  });

  describe('when the plan reorders its block', () => {
    test('should reorder every sub-plan form without touching their rows', async () => {
      await savePlanForm([
        planField(managedFieldKeys[0]),
        planField(managedFieldKeys[1])
      ]);

      expect((await subPlanFormKeys(volailleSubPlanId)).slice(0, 2)).toEqual(
        managedFieldKeys
      );
      const ordersBefore = await rawOrders(volailleSubPlanId);

      await savePlanForm([
        planField(managedFieldKeys[1]),
        planField(managedFieldKeys[0])
      ]);

      expect((await subPlanFormKeys(bovinSubPlanId)).slice(0, 2)).toEqual([
        managedFieldKeys[1],
        managedFieldKeys[0]
      ]);
      await expect(rawOrders(volailleSubPlanId)).resolves.toEqual(ordersBefore);
    });
  });

  describe('when the plan stops managing a descriptor', () => {
    test('should freeze the inherited ones, drop the excluded ones and restore the fallback positions', async () => {
      await savePlanForm([planField(managedFieldKeys[0], { optionIds })]);
      await editSubPlanField(volailleSubPlanId, managedFieldKeys[0], {
        inheritance: 'Excluded'
      });

      await savePlanForm([]);

      expect(
        await subPlanFormField(volailleSubPlanId, managedFieldKeys[0])
      ).toBeUndefined();

      const frozen = await subPlanFormField(
        bovinSubPlanId,
        managedFieldKeys[0]
      );
      expect(frozen).toMatchObject({
        required: true,
        inheritance: 'Own',
        order: DAOABovinFieldConfigs.length + 1
      });
      expect(frozen?.field.options.map((_) => _.value)).toEqual([
        'OPT1',
        'OPT2'
      ]);
    });
  });

  test('should normalise an inheritance the plan does not back', async () => {
    await appendOwnSubPlanField(volailleSubPlanId, managedFieldKeys[0]);

    await editSubPlanField(volailleSubPlanId, managedFieldKeys[0], {
      inheritance: 'Inherited'
    });

    expect(
      await subPlanFormField(volailleSubPlanId, managedFieldKeys[0])
    ).toMatchObject({ inheritance: 'Own' });
  });

  test('should give back a descriptor the sub-plan form left out', async () => {
    await savePlanForm([planField(managedFieldKeys[0])]);

    await saveSubPlanForm(
      volailleSubPlanId,
      (await subPlanForm(volailleSubPlanId)).filter(
        ({ fieldId }) => fieldId !== fieldIdByKey[managedFieldKeys[0]]
      )
    );

    expect(
      await subPlanFormField(volailleSubPlanId, managedFieldKeys[0])
    ).toMatchObject({ inheritance: 'Inherited' });
  });

  test('should leave the sub-plan untouched when its form is written back unchanged', async () => {
    await savePlanForm([
      planField(managedFieldKeys[0], { optionIds }),
      planField(managedFieldKeys[1])
    ]);
    await editSubPlanField(volailleSubPlanId, managedFieldKeys[1], {
      inheritance: 'Excluded'
    });

    const before = await subPlanForm(volailleSubPlanId);
    await saveSubPlanForm(volailleSubPlanId, before);

    await expect(subPlanForm(volailleSubPlanId)).resolves.toEqual(before);
  });
});
