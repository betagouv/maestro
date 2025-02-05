import { analysisRepository } from '../../repositories/analysisRepository';
import { analysisResidueRepository } from '../../repositories/analysisResidueRepository';
import { documentRepository } from '../../repositories/documentRepository';
import { executeTransaction, kysely } from '../../repositories/kysely';
import { residueAnalyteRepository } from '../../repositories/residueAnalyteRepository';
import { sampleRepository } from '../../repositories/sampleRepository';
import { s3Service } from '../s3Service';
import {
  ExportAnalysis,
  ExtractError
} from './index';

export const analysisHandler = async (
  analyse: ExportAnalysis
): Promise<string> => {

  const { sampleId, analyseId } = await kysely
    .selectFrom('samples')
    .leftJoin('analysis', 'samples.id', 'analysis.sampleId')
    .where('reference', '=', analyse.sampleReference)
    .select(['samples.id as sampleId', 'analysis.id as analyseId'])
    .executeTakeFirstOrThrow();

  if (analyseId !== null) {
    throw new ExtractError(
      `Une analyse est déjà présente pour cet échantillon : ${analyse.sampleReference}`
    );
  }

  const { documentId, valid, error } = await s3Service.uploadDocument(
    analyse.pdfFile
  );

  if (!valid) {
    throw new ExtractError(
      `Impossible d'uploader le PDF sur le S3: HTTP ${error}`
    );
  }
  try {
    return await executeTransaction(async (trx) => {
      await documentRepository.insert(
        {
          id: documentId,
          filename: analyse.pdfFile.name,
          kind: 'AnalysisReportDocument',
          createdAt: new Date(),
          createdBy: null
        },
        trx
      );

      const analysisId = await analysisRepository.insert(
        {
          sampleId,
          reportDocumentId: documentId,
          //TODO AUTO_LABO Peut-être un nouveau statut « À vérifier » si on a un doute
          status: 'Completed',
          createdBy: null,
          createdAt: new Date(),
          //TODO AUTO_LABO  conforme / non conforme
          compliance: true,
          notesOnCompliance: analyse.notes
        },
        trx
      );

      await sampleRepository.updateStatus(sampleId, 'Analysis', trx);

      for (let i = 0; i < analyse.residues.length; i++){
        const residue = analyse.residues[i];
        const residueNumber = i + 1
        await analysisResidueRepository.insert(
          [{
            result: residue.result,
            resultKind: residue.result_kind,
            lmr: residue.lmr,
            analysisId,
            //TODO AUTO_LABO je ne sais pas comment récupérer cette info
            analysisMethod: 'Mono',
            residueNumber,
            reference: residue.reference
          }]
          ,
          trx
        );

        if (residue.kind === 'ComplexResidue') {
          await residueAnalyteRepository.insert(
            residue.analytes.map((analyte, j) => ({   reference: analyte.reference,
              residueNumber,
              analyteNumber: j + 1,
              resultKind: analyte.result_kind,
              result: analyte.result ,
            analysisId})),
            trx
          );

        }
      }

      return analysisId;
    });
  } catch (e) {
    //Supprime le document du S3 si la transaction a échouée
    await s3Service.deleteDocument(documentId, analyse.pdfFile.name);
    throw e;
  }
};
