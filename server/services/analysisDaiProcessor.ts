import type { AnalysisDai } from 'maestro-shared/schema/AnalysisDai/AnalysisDai';
import {
  type ProgrammingPlanKindWithSacha,
  ProgrammingPlanKindWithSachaList
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { analysisDaiRepository } from '../repositories/analysisDaiRepository';
import { analysisRepository } from '../repositories/analysisRepository';
import { executeTransaction } from '../repositories/kysely';
import { laboratoryRepository } from '../repositories/laboratoryRepository';
import sampleItemRepository from '../repositories/sampleItemRepository';
import { sampleRepository } from '../repositories/sampleRepository';
import {
  DaiProcessingError,
  type DaiSentResult,
  sendDAIWithoutEDI
} from './daiSendingService';
import { sendDAIWithEDI } from './ediSacha/sachaDAI';
import { mattermostService } from './mattermostService';

const processAnalysisDai = async (
  dai: Pick<AnalysisDai, 'id' | 'analysisId'>
): Promise<DaiSentResult & { edi: boolean }> => {
  const analysis = await analysisRepository.findUnique(dai.analysisId);
  if (
    !analysis?.sampleId ||
    analysis.itemNumber == null ||
    analysis.copyNumber == null
  ) {
    throw new DaiProcessingError(
      `Analysis ${dai.analysisId} introuvable ou incomplète`,
      null
    );
  }

  const sample = await sampleRepository.findUnique(analysis.sampleId);
  if (!sample) {
    throw new DaiProcessingError(
      `Prélèvement ${analysis.sampleId} introuvable`,
      null
    );
  }

  const sampleItems = await sampleItemRepository.findMany(analysis.sampleId);
  const checkedSample = SampleChecked.parse({ ...sample, items: sampleItems });

  const rawItem = sampleItems.find(
    (item) =>
      item.itemNumber === analysis.itemNumber &&
      item.copyNumber === analysis.copyNumber
  );
  if (!rawItem) {
    throw new DaiProcessingError(
      `SampleItem ${analysis.itemNumber}/${analysis.copyNumber} introuvable`,
      null
    );
  }
  const sampleItem = SampleItem.parse(rawItem);

  if (!rawItem.laboratoryId) {
    throw new DaiProcessingError(
      'Pas de laboratoire configuré pour cet item',
      null
    );
  }

  const laboratory = await laboratoryRepository.findUnique(
    rawItem.laboratoryId
  );
  const programmingPlanWithEdiSacha = ProgrammingPlanKindWithSachaList.includes(
    checkedSample.programmingPlanKind as ProgrammingPlanKindWithSacha
  );

  if (programmingPlanWithEdiSacha && laboratory.sachaSigle) {
    return {
      ...(await sendDAIWithEDI(checkedSample, sampleItem, laboratory)),
      edi: true
    };
  }
  return {
    ...(await sendDAIWithoutEDI(checkedSample, sampleItem, laboratory)),
    edi: false
  };
};

const triggerProcessing = () => {
  setImmediate(() => {
    console.info('[analysisDaiProcessor] cycle started.');
    processPending()
      .then(() => console.info('[analysisDaiProcessor] cycle done.'))
      .catch((err) =>
        console.error('[analysisDaiProcessor] cycle failed:', err)
      );
  });
};

const processPending = async (): Promise<void> => {
  let processedOne: boolean = false;

  try {
    processedOne = await executeTransaction(async (trx) => {
      const dais = await analysisDaiRepository.claimPending(1, trx);
      if (dais.length === 0) return false;

      const dai = dais[0];

      try {
        const result = await processAnalysisDai(dai);
        await analysisDaiRepository.update(
          {
            id: dai.id,
            sentMethod: result.sentMethod,
            edi: result.edi,
            state: 'SENT'
          },
          trx
        );
        await analysisDaiRepository.linkDocuments(
          dai.id,
          result.documentIds,
          trx
        );
        console.info(`[analysisDaiProcessor] DAI ${dai.id} sent.`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const edi = err instanceof DaiProcessingError ? err.edi : null;
        const sentMethod =
          err instanceof DaiProcessingError ? err.sentMethod : null;
        await mattermostService.send(
          `[Maestro] Erreur lors de l'envoi de la DAI ${dai.id}: ${message}`
        );

        console.error(`[analysisDaiProcessor] DAI ${dai.id} error.`, message);
        await analysisDaiRepository.update(
          {
            id: dai.id,
            state: 'ERROR',
            message,
            edi,
            sentMethod
          },
          trx
        );
      }
      return true;
    });
  } catch (err) {
    console.error('[analysisDaiProcessor] Transaction error:', err);
    return;
  }

  if (processedOne) {
    await processPending();
  }
};

export const analysisDaiProcessor = {
  triggerProcessing,
  processPending
};
