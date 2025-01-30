import { isEmpty } from 'lodash-es';
import { ComplexResidueAnalytes } from 'maestro-shared/referential/Residue/ComplexResidueAnalytes';
import { OmitDistributive } from 'maestro-shared/utils/typescript';
import { analysisRepository } from '../../repositories/analysisRepository';
import { analysisResidueRepository } from '../../repositories/analysisResidueRepository';
import { documentRepository } from '../../repositories/documentRepository';
import { executeTransaction, kysely } from '../../repositories/kysely';
import {
  AnalysisResidues,
  ResidueAnalytes
} from '../../repositories/kysely.type';
import { residueAnalyteRepository } from '../../repositories/residueAnalyteRepository';
import { sampleRepository } from '../../repositories/sampleRepository';
import { s3Service } from '../s3Service';
import {
  ExportAnalysis,
  ExportDataSubstance,
  ExportResidueAnalyte,
  ExtractError
} from './index';

export const analysisHandler = async (
  analyse: ExportAnalysis
): Promise<string> => {
  const analyseResidue: (Pick<
    AnalysisResidues,
    'result' | 'lmr' | 'resultKind' | 'residueNumber'
  > & { residue: ExportDataSubstance['residue'] })[] = [];

  analyse.residues
    .filter(
      (s) =>
        s.residue.kind === 'SimpleResidue' ||
        s.residue.kind === 'ComplexResidue'
    )
    .forEach((s, index) => {
      analyseResidue.push({
        residue: s.residue,
        result: s.result,
        resultKind: s.result_kind,
        lmr: s.lmr,
        residueNumber: index + 1
      });
    });

  const residueAnalytes: Pick<
    ResidueAnalytes,
    'residueNumber' | 'result' | 'resultKind' | 'analyteNumber' | 'reference'
  >[] = [];
  const analytes = analyse.residues.filter(
    (
      s
    ): s is OmitDistributive<ExportDataSubstance, 'residue'> & {
      residue: ExportResidueAnalyte;
    } => s.residue.kind === 'Analyte'
  );

  for (let i = 0; i < analytes.length; i++) {
    const analyte = analytes[i];
    const complexResidue = analyseResidue.find(
      (aR) =>
        aR.residue.kind === 'ComplexResidue' &&
        ComplexResidueAnalytes[aR.residue.reference].includes(
          analyte.residue.reference
        )
    );
    if (complexResidue === undefined) {
      throw new ExtractError(
        `Impossible de trouver le résidu complexe pour l'analyte ${analyte.residue.reference}`
      );
    }

    residueAnalytes.push({
      reference: analyte.residue.reference,
      residueNumber: complexResidue.residueNumber,
      analyteNumber: i + 1,
      resultKind: analyte.result_kind,
      result: analyte.result
    });
  }

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

      if (!isEmpty(analyseResidue)) {
        await analysisResidueRepository.insert(
          analyseResidue.map((a) => {
            const reference = a.residue.reference;
            const { residue, ...rest } = a;
            return {
              ...rest,
              reference,
              analysisId,
              //TODO AUTO_LABO je ne sais pas comment récupérer cette info
              analysisMethod: 'Mono'
            };
          }),
          trx
        );
      }

      if (!isEmpty(residueAnalytes)) {
        await residueAnalyteRepository.insert(
          residueAnalytes.map((r) => ({ ...r, analysisId })),
          trx
        );
      }

      return analysisId;
    });
  } catch (e) {
    //Supprime le document du S3 si la transaction a échouée
    await s3Service.deleteDocument(documentId, analyse.pdfFile.name);
    throw e;
  }
};
