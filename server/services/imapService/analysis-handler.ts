import {
  getAnalytes,
  isComplex
} from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { SSD2Referential } from 'maestro-shared/referential/Residue/SSD2Referential';
import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { LmrIsValid } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { OmitDistributive } from 'maestro-shared/utils/typescript';
import { analysisReportDocumentsRepository } from '../../repositories/analysisReportDocumentsRepository';
import { analysisRepository } from '../../repositories/analysisRepository';
import { analysisResidueRepository } from '../../repositories/analysisResidueRepository';
import { kysely } from '../../repositories/kysely';
import { residueAnalyteRepository } from '../../repositories/residueAnalyteRepository';
import { sampleRepository } from '../../repositories/sampleRepository';
import { documentService } from '../documentService';
import { ExtractError } from './extractError';
import { ExportAnalysis, ExportDataSubstanceWithSSD2Id } from './index';

export type AnalysisWithResidueWithSSD2Id = Omit<ExportAnalysis, 'residues'> & {
  residues: ExportDataSubstanceWithSSD2Id[];
};
export const analysisHandler = async (
  analyse: AnalysisWithResidueWithSSD2Id
): Promise<{
  samplerId: string;
  sampleId: string;
  analysisId: string;
  samplerEmail: string;
}> => {
  const {
    sampleId,
    sampleStage,
    sampleSpecificData,
    analyseId: oldAnalyseId,
    samplerId,
    samplerEmail
  } = await kysely
    .selectFrom('samples')
    .innerJoin('users', 'samples.sampledBy', 'users.id')
    .leftJoin('analysis', 'samples.id', 'analysis.sampleId')
    .where('reference', '=', analyse.sampleReference)
    .select([
      'samples.id as sampleId',
      'samples.stage as sampleStage',
      'samples.specificData as sampleSpecificData',
      'analysis.id as analyseId',
      'users.email as samplerEmail',
      'users.id as samplerId'
    ])
    .executeTakeFirstOrThrow(
      () =>
        new Error(
          `Impossible de trouver le prélèvement avec la référence ${analyse.sampleReference}`
        )
    );

  if (sampleStage === null) {
    throw new ExtractError(`Pas de stade de prélèvement`);
  }
  const complexResidues = analyse.residues.filter(
    (
      r
    ): r is OmitDistributive<ExportDataSubstanceWithSSD2Id, 'ssd2Id'> & {
      ssd2Id: SSD2Id;
    } => r.ssd2Id !== null && isComplex(r.ssd2Id)
  );
  const simpleResidues = analyse.residues.filter(
    ({ ssd2Id }) => ssd2Id === null || !isComplex(ssd2Id)
  );

  const residues: (ExportDataSubstanceWithSSD2Id & {
    analytes?: ExportDataSubstanceWithSSD2Id[];
  })[] = [];

  const complexeResiduesIndex: Record<
    SSD2Id,
    ExportDataSubstanceWithSSD2Id & {
      analytes: ExportDataSubstanceWithSSD2Id[];
    }
  > = complexResidues.reduce(
    (acc, r) => {
      acc[r.ssd2Id] = { ...r, analytes: [] };
      return acc;
    },
    {} as Record<
      SSD2Id,
      ExportDataSubstanceWithSSD2Id & {
        analytes: ExportDataSubstanceWithSSD2Id[];
      }
    >
  );
  for (const residue of simpleResidues) {
    const residueSSD2Id = residue.ssd2Id;
    const complexResidue =
      residueSSD2Id !== null
        ? complexResidues.find(({ ssd2Id }) => {
            const referenceAnalytes = getAnalytes(ssd2Id);
            if (referenceAnalytes.size > 0) {
              return referenceAnalytes.has(residueSSD2Id);
            }
            return false;
          })
        : undefined;

    if (complexResidue !== undefined) {
      complexeResiduesIndex[complexResidue.ssd2Id].analytes.push(residue);
    } else {
      residues.push(residue);
    }
  }

  Object.values(complexeResiduesIndex).forEach(
    ({ analytes, ssd2Id, result_kind }) => {
      if (analytes.length === 0 && ssd2Id && result_kind !== 'ND') {
        //@ts-expect-error TS7053
        const name: string = SSD2Referential[ssd2Id].name;
        throw new ExtractError(
          `Le résidu complexe ${ssd2Id} ${name} est présent, mais n'a aucune analyte`
        );
      }
    }
  );

  residues.push(...Object.values(complexeResiduesIndex));

  //Vérifie si la LMR est obligatoire
  residues.forEach((r) => {
    if (
      r.result_kind !== 'ND' &&
      !!r.ssd2Id &&
      !LmrIsValid({
        stage: sampleStage,
        specificData: sampleSpecificData,
        resultKind: r.result_kind,
        reference: r.ssd2Id ?? '',
        lmr: r.result_kind === 'Q' ? r.lmr : null
      })
    ) {
      throw new ExtractError(
        //@ts-expect-error TS7053
        `Le résidu ${SSD2Referential[r.ssd2Id].name} ${r.ssd2Id} n'a pas de LMR`
      );
    }
  });

  return await documentService.createDocument(
    analyse.pdfFile,
    'AnalysisReportDocument',
    null,
    async (documentId, trx) => {
      const newAnalysis: Omit<PartialAnalysis, 'id'> = {
        sampleId,
        status: 'Compliance',
        createdBy: null,
        createdAt: new Date(),

        // Pour le moment on passe par une validation manuelle pour déterminer la conformité
        // compliance: true,
        notesOnCompliance: analyse.notes
      };

      let analysisId;
      if (oldAnalyseId) {
        await analysisRepository.update({ ...newAnalysis, id: oldAnalyseId });
        await analysisResidueRepository.deleteByAnalysisId(oldAnalyseId, trx);
        analysisId = oldAnalyseId;
      } else {
        analysisId = await analysisRepository.insert(newAnalysis, trx);
      }

      await analysisReportDocumentsRepository.insert(
        analysisId,
        documentId,
        trx
      );

      await sampleRepository.updateStatus(sampleId, 'InReview', trx);

      for (let i = 0; i < residues.length; i++) {
        const residue = residues[i];
        const residueNumber = i + 1;

        let resultKind = residue.result_kind;
        // Si c'est un résidu complexe NQ et que toutes ses analytes sont ND alors le résidu complexe est aussi ND
        if (
          resultKind === 'NQ' &&
          'analytes' in residue &&
          residue.analytes?.every((a) => a.result_kind === 'ND')
        ) {
          resultKind = 'ND';
        }

        await analysisResidueRepository.insert(
          [
            {
              result: 'result' in residue ? residue.result : null,
              resultKind,
              lmr: 'lmr' in residue ? residue.lmr : null,
              analysisId,
              analysisMethod: residue.analysisMethod,
              residueNumber,
              reference: residue.ssd2Id,
              analysisDate: residue.analysisDate,
              unknownLabel:
                residue.ssd2Id === null ? residue.unknownLabel : null
            }
          ],
          trx
        );

        if (
          'analytes' in residue &&
          residue.analytes !== undefined &&
          residue.analytes.length > 0
        ) {
          await residueAnalyteRepository.insert(
            residue.analytes.map((analyte, j) => ({
              reference: analyte.ssd2Id,
              residueNumber,
              analyteNumber: j + 1,
              resultKind: analyte.result_kind,
              result: 'result' in analyte ? analyte.result : null,
              analysisId
            })),
            trx
          );
        }
      }

      return {
        samplerId,
        sampleId,
        analysisId,
        samplerEmail
      };
    }
  );
};
