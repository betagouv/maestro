import type { Insertable } from 'kysely';
import { Department } from 'maestro-shared/referential/Department';
import type { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import type { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import type { AnalysisStatus } from 'maestro-shared/schema/Analysis/AnalysisStatus';
import type { AnalysisKind } from 'maestro-shared/schema/Analysis/Residue/AnalysisKind';
import type { ResidueComplianceDAOA } from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import type { ResultKind } from 'maestro-shared/schema/Analysis/Residue/ResultKind';
import {
  type MaestroDate,
  maestroDateRefined
} from 'maestro-shared/utils/date';
import { analysisRepository } from '../../repositories/analysisRepository';
import { analysisResidueRepository } from '../../repositories/analysisResidueRepository';
import { kysely } from '../../repositories/kysely';
import type { DB } from '../../repositories/kysely.type';
import { laboratoryResidueMappingRepository } from '../../repositories/laboratoryResidueMappingRepository';
import sampleItemRepository from '../../repositories/sampleItemRepository';
import { sampleRepository } from '../../repositories/sampleRepository';
import { RaiLabError, RaiMaestroError } from './sachaErrors';
import { validateRaiDaoaFields } from './sachaRAIValidation';
import {
  referencesFromEtiquette,
  type SampleReference
} from './sachaReferences';
import type { SachaResultats } from './sachaValidator';

type DaoaResidue = Omit<Insertable<DB['analysisResidues']>, 'analysisId'>;

const QUALITATIF_RESULT_TO_COMPLIANCE: Partial<
  Record<string, ResidueComplianceDAOA>
> = {
  INF_SUSP: 'Compliant'
};

const CONCLUSION_TO_COMPLIANCE: Partial<Record<string, boolean>> = {
  CONFORM: true,
  NCONF: false
};

const getCommemoratifValue = (
  commemoratifs:
    | { Sigle: string; TexteValeur?: string; SigleValeur?: string }[]
    | undefined,
  sigle: string
): string | undefined => {
  const commemoratif = commemoratifs?.find((c) => c.Sigle === sigle);
  return commemoratif?.TexteValeur ?? commemoratif?.SigleValeur;
};

const frenchDateToMaestroDate = (
  value: string,
  xmlDocumentId: string | null
): MaestroDate => {
  const [day, month, year] = value.split('/');
  const parsed = maestroDateRefined.safeParse(`${year}-${month}-${day}`);
  if (!parsed.success) {
    throw new RaiLabError(`Date invalide (${value})`, xmlDocumentId);
  }
  return parsed.data;
};

export const buildDaoaAnalysis = (
  rai: SachaResultats,
  ssd2IdByLabel: Map<string, SSD2Id>,
  analysisMethod: AnalysisMethod,
  xmlDocumentId: string | null = null
): {
  residues: DaoaResidue[];
  compliance: boolean;
  status: AnalysisStatus;
  receiptDate: MaestroDate | null;
} => {
  const residues: DaoaResidue[] = [];
  const conclusions: string[] = [];

  for (const planAnalyse of rai.DialogueResultatType.DialoguePlanAnalyseType ??
    []) {
    for (const echantillonPlan of planAnalyse.DialogueResultatEchantillonPlan ??
      []) {
      conclusions.push(echantillonPlan.SigleConclusion);
    }

    for (const analyse of planAnalyse.DialogueAnalyseType ?? []) {
      const { SigleAnalyte } = analyse.DialogueAnalyse;

      const reference = ssd2IdByLabel.get(SigleAnalyte);
      if (!reference) {
        throw new RaiLabError(
          `Analyte non mappé vers un SSD2Id (${SigleAnalyte})`,
          xmlDocumentId
        );
      }

      const commemoratifs = analyse.DialogueCommemoratif ?? [];
      const accredited =
        getCommemoratifValue(commemoratifs, 'ACCRDTTN') === 'O';
      const preciseMethod = getCommemoratifValue(commemoratifs, 'METHD_PRCS');
      const ld = Number(getCommemoratifValue(commemoratifs, 'LIMDET'));
      const lq = Number(getCommemoratifValue(commemoratifs, 'LIMQUANT'));
      const danalys = getCommemoratifValue(commemoratifs, 'DANALYS');
      const analysisDate = danalys
        ? frenchDateToMaestroDate(danalys, xmlDocumentId)
        : null;

      for (const resultat of analyse.DialogueResultatEchantillonAnalyse ?? []) {
        const operator = resultat.OperateurResultatQuantitatif;
        const value = resultat.ValeurResultatQuantitatif;

        const resultKind: ResultKind =
          operator === '=' ? 'Q' : value === lq ? 'NQ' : 'ND';

        const qualitatif = resultat.SigleValeurResultatQualitatif;
        const compliance = qualitatif
          ? QUALITATIF_RESULT_TO_COMPLIANCE[qualitatif]
          : undefined;
        if (!compliance) {
          throw new RaiLabError(
            `Résultat qualitatif inconnu (${qualitatif}) pour ${SigleAnalyte}`,
            xmlDocumentId
          );
        }

        const analysisKind: AnalysisKind =
          resultat.IndicateurAnalyseConfirmation ? 'CONFIRMATION' : 'SCREENING';

        residues.push({
          residueNumber: residues.length + 1,
          reference,
          resultKind,
          result: resultKind === 'Q' ? value : null,
          analysisMethod,
          analysisDate,
          compliance,
          analysisKind,
          ld,
          lq,
          accredited,
          preciseMethod
        });
      }
    }
  }

  if (conclusions.length === 0) {
    throw new RaiLabError(
      `Conclusion de l'échantillon manquante (SigleConclusion)`,
      xmlDocumentId
    );
  }
  const compliance = conclusions.every((conclusion) => {
    const mapped = CONCLUSION_TO_COMPLIANCE[conclusion];
    if (mapped === undefined) {
      throw new RaiLabError(
        `Conclusion d'échantillon inconnue (${conclusion})`,
        xmlDocumentId
      );
    }
    return mapped;
  });

  const datrecprel = getCommemoratifValue(
    rai.DialogueResultatType.DialogueCommemoratif,
    'DATRECPREL'
  );
  const receiptDate = datrecprel ? maestroDateRefined.parse(datrecprel) : null;

  return {
    residues,
    compliance,
    status: compliance ? 'Completed' : 'InReview',
    receiptDate
  };
};

export const processSachaRAI = async (
  rai: SachaResultats,
  xmlDocumentId: string | null = null
): Promise<{ laboratoryId: string; department: Department }> => {
  validateRaiDaoaFields(rai, xmlDocumentId);

  const etiquette =
    rai.DialogueResultatType.DialogueEchantillonCommemoratifType?.[0]
      ?.DialogueEchantillonComplet?.NumeroEtiquette;
  if (!etiquette) {
    throw new RaiLabError('NumeroEtiquette manquant', xmlDocumentId);
  }

  let reference: SampleReference;
  let itemNumber: number;
  try {
    ({ reference, itemNumber } = referencesFromEtiquette(etiquette));
  } catch {
    throw new RaiLabError(
      `NumeroEtiquette invalide (${etiquette})`,
      xmlDocumentId
    );
  }

  const sampleItem = await kysely
    .selectFrom('samples')
    .innerJoin('sampleItems', 'sampleItems.sampleId', 'samples.id')
    .leftJoin('analysis', (join) =>
      join
        .onRef('analysis.sampleId', '=', 'sampleItems.sampleId')
        .onRef('analysis.itemNumber', '=', 'sampleItems.itemNumber')
        .onRef('analysis.copyNumber', '=', 'sampleItems.copyNumber')
    )
    .where('samples.reference', '=', reference)
    .where('sampleItems.recipientKind', '=', 'Laboratory')
    .where('sampleItems.itemNumber', '=', itemNumber)
    .select([
      'samples.id as sampleId',
      'samples.department as department',
      'sampleItems.itemNumber as itemNumber',
      'sampleItems.copyNumber as copyNumber',
      'sampleItems.laboratoryId as laboratoryId',
      'sampleItems.substanceKind as substanceKind',
      'analysis.id as analysisId'
    ])
    .executeTakeFirst();

  if (!sampleItem) {
    throw new RaiLabError(
      `Échantillon introuvable pour la référence ${reference}`,
      xmlDocumentId
    );
  }

  const { laboratoryId, department: departmentValue } = sampleItem;
  if (!laboratoryId) {
    throw new RaiMaestroError(
      `Aucun laboratoire associé à l'échantillon ${reference}`,
      xmlDocumentId
    );
  }
  const department = Department.safeParse(departmentValue);
  if (!department.success) {
    throw new RaiMaestroError(
      `Département invalide pour l'échantillon ${reference}`,
      xmlDocumentId
    );
  }

  //FIXME on va utiliser une liste en dur
  const mappings =
    await laboratoryResidueMappingRepository.findByLaboratoryId(laboratoryId);
  const ssd2IdByLabel = new Map<string, SSD2Id>();
  for (const mapping of mappings) {
    if (mapping.ssd2Id) {
      ssd2IdByLabel.set(mapping.label, mapping.ssd2Id);
    }
  }

  const analysisMethod: AnalysisMethod =
    sampleItem.substanceKind === 'Mono' ? 'Mono' : 'Multi';

  const { residues, compliance, status, receiptDate } = buildDaoaAnalysis(
    rai,
    ssd2IdByLabel,
    analysisMethod,
    xmlDocumentId
  );

  await kysely.transaction().execute(async (trx) => {
    const analysisValues = {
      sampleId: sampleItem.sampleId,
      itemNumber: sampleItem.itemNumber,
      copyNumber: sampleItem.copyNumber,
      status,
      compliance,
      notesOnCompliance: null
    };

    let analysisId: string;
    if (sampleItem.analysisId) {
      await trx
        .updateTable('analysis')
        .set(analysisValues)
        .where('id', '=', sampleItem.analysisId)
        .execute();
      await analysisResidueRepository.deleteByAnalysisId(
        sampleItem.analysisId,
        trx
      );
      analysisId = sampleItem.analysisId;
    } else {
      analysisId = await analysisRepository.insert(
        {
          ...analysisValues,
          createdBy: null,
          createdAt: new Date(),
          emailReceivedAt: null
        },
        trx
      );
    }

    await analysisResidueRepository.insert(
      residues.map((residue) => ({ ...residue, analysisId })),
      trx
    );

    if (receiptDate) {
      await sampleItemRepository.update(
        sampleItem.sampleId,
        sampleItem.itemNumber,
        sampleItem.copyNumber,
        {
          sampleId: sampleItem.sampleId,
          itemNumber: sampleItem.itemNumber,
          copyNumber: sampleItem.copyNumber,
          receiptDate
        },
        trx
      );
    }
  });

  await sampleRepository.evaluateSampleCompliance(sampleItem.sampleId);

  return { laboratoryId, department: department.data };
};
