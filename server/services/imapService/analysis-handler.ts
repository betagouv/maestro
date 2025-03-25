import { analysisRepository } from '../../repositories/analysisRepository';
import { analysisResidueRepository } from '../../repositories/analysisResidueRepository';
import {  kysely } from '../../repositories/kysely';
import { residueAnalyteRepository } from '../../repositories/residueAnalyteRepository';
import { sampleRepository } from '../../repositories/sampleRepository';
import { documentService } from '../documentService';
import {
  ExportAnalysis,  ExportDataSubstanceWithSSD2Id,
  ExtractError
} from './index';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { isComplex, getAnalytes } from 'maestro-shared/referential/Residue/SSD2Hierarchy';

export type AnalysisWithResidueWithSSD2Id =  Omit<ExportAnalysis, 'residues'> & { residues: ExportDataSubstanceWithSSD2Id[]}
export const analysisHandler = async (
  analyse: AnalysisWithResidueWithSSD2Id
): Promise<{samplerId: string, analysisId: string, programmingPlansYear: number, samplerEmail: string}> => {

  const { sampleId, samplerId, analyseId, programmingPlansYear, samplerEmail} = await kysely
    .selectFrom('samples')
    .innerJoin('programmingPlans', 'samples.programmingPlanId', 'programmingPlans.id')
    .innerJoin('users', 'samples.sampledBy', 'users.id')
    .leftJoin('analysis', 'samples.id', 'analysis.sampleId')
    .where('reference', '=', analyse.sampleReference)
    .select(['samples.id as sampleId', 'analysis.id as analyseId', 'programmingPlans.year as programmingPlansYear', 'users.email as samplerEmail', 'users.id as samplerId'])
    .executeTakeFirstOrThrow(() => new Error(`Impossible de trouver le prélèvement avec la référence ${analyse.sampleReference}`));

  if (analyseId !== null) {
    throw new ExtractError(
      `Une analyse est déjà présente pour cet échantillon : ${analyse.sampleReference}`
    );
  }

  const complexResidues = analyse.residues.filter(({ssd2Id}) => isComplex(ssd2Id))
  const simpleResidues =  analyse.residues.filter(({ssd2Id}) => !isComplex(ssd2Id))


      const residuesIndex: Record<SSD2Id, ExportDataSubstanceWithSSD2Id & {analytes: ExportDataSubstanceWithSSD2Id[]}> = complexResidues.reduce((acc, r) => {
    acc[r.ssd2Id] = {...r, analytes: []}
    return acc
  }, {} as Record<SSD2Id, ExportDataSubstanceWithSSD2Id & {analytes: ExportDataSubstanceWithSSD2Id[]}>)
  for (const residue of simpleResidues) {
      const complexResidue = complexResidues.find(({ ssd2Id }) => {
        const referenceAnalytes = getAnalytes(ssd2Id)
        if (referenceAnalytes.size > 0) {
          return referenceAnalytes.has(residue.ssd2Id)
        }
        return false
      });


    if (complexResidue !== undefined) {
      residuesIndex[complexResidue.ssd2Id].analytes.push(residue)
    }else{
      residuesIndex[residue.ssd2Id] = {...residue, analytes: []}
    }
  }

  const residues = Object.values(residuesIndex)
  residues
    .filter(({ssd2Id}) => isComplex(ssd2Id))
    .forEach(({analytes, ssd2Id}) => {
    if (analytes.length === 0) {
      throw new ExtractError(`Le résidue complexe ${ssd2Id} est présent, mais n'a aucune analyte`)
    }
  })

  return await documentService.createDocument(
        analyse.pdfFile,
        'AnalysisReportDocument',
        null,
        async (documentId, trx) => {



      const analysisId = await analysisRepository.insert(
        {
          sampleId,
          reportDocumentId: documentId,
          status: 'InReview',
          createdBy: null,
          createdAt: new Date(),
          // Pour le moment on passe par une validation manuelle pour déterminer la conformité
          // compliance: true,
          notesOnCompliance: analyse.notes
        },
        trx
      );

      await sampleRepository.updateStatus(sampleId, 'Analysis', trx);

      for (let i = 0; i < residues.length; i++){
        const residue = residues[i];
        const residueNumber = i + 1
        await analysisResidueRepository.insert(
          [{
            result: 'result' in residue ? residue.result : null,
            resultKind: residue.result_kind,
            lmr: 'lmr' in residue ? residue.lmr : null,
            analysisId,
            analysisMethod: residue.analysisMethod,
            residueNumber,
            reference: residue.ssd2Id
          }]
          ,
          trx
        );

        if ('analytes' in residue && residue.analytes.length > 0) {
          await residueAnalyteRepository.insert(
            residue.analytes.map((analyte, j) => ({   reference: analyte.ssd2Id,
              residueNumber,
              analyteNumber: j + 1,
              resultKind: analyte.result_kind,
              result: 'result' in analyte ?  analyte.result : null,
            analysisId})),
            trx
          );

        }
      }

      return { samplerId, analysisId, programmingPlansYear, samplerEmail };
    }
  );
};
