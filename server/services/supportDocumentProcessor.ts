import { Regions } from 'maestro-shared/referential/Region';
import { getSupportDocumentFilename } from 'maestro-shared/schema/Document/DocumentKind';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import type { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { analysisDaiRepository } from '../repositories/analysisDaiRepository';
import sampleItemRepository from '../repositories/sampleItemRepository';
import { analysisDaiProcessor } from './analysisDaiProcessor';
import { documentService } from './documentService';
import { mailService } from './mailService';
import { pdfService } from './pdfService/pdfService';

interface SupportDocumentItem {
  analysisId: string;
  sampleItem: SampleItem;
}

const generateAndStoreSampleSupportDocument = async (
  sample: SampleChecked,
  sampleItems: SampleItem[],
  itemNumber: number,
  copyNumber: number
): Promise<{ buffer: Buffer | null; documentId: string | null }> => {
  const pdfBuffer = await pdfService.generateSampleSupportPDF(
    sample,
    sampleItems,
    itemNumber,
    copyNumber,
    true
  );

  const sampleItem = sampleItems.find(
    (item) => item.itemNumber === itemNumber && item.copyNumber === copyNumber
  );

  if (!sampleItem) {
    throw new Error(`Sample item ${itemNumber}/${copyNumber} not found`);
  }

  if (sampleItem.supportDocumentId) {
    console.info('Delete previous document', sampleItem.supportDocumentId);
    await sampleItemRepository.update(
      sample.id,
      sampleItem.itemNumber,
      sampleItem.copyNumber,
      {
        ...sampleItem,
        supportDocumentId: null
      }
    );
    await documentService.deleteDocument(sampleItem.supportDocumentId);
  }

  const file = new File(
    [pdfBuffer],
    getSupportDocumentFilename(
      sample,
      sampleItem.itemNumber,
      sampleItem.copyNumber
    ),
    { type: 'application/pdf' }
  );

  const documentId = await documentService.createDocument<string>(
    file,
    'SupportDocument',
    sample.sampler.id,
    async (documentId, trx) => {
      await sampleItemRepository.update(
        sample.id,
        sampleItem.itemNumber,
        sampleItem.copyNumber,
        {
          ...sampleItem,
          supportDocumentId: documentId
        },
        trx
      );
      return documentId;
    }
  );

  return { buffer: pdfBuffer, documentId };
};

const processItems = async (
  checkedSample: SampleChecked,
  allSampleItems: SampleItem[],
  items: SupportDocumentItem[]
): Promise<void> => {
  const supportAttachments: { name: string; content: string }[] = [];

  for (const { analysisId, sampleItem } of items) {
    const { buffer } = await generateAndStoreSampleSupportDocument(
      checkedSample,
      allSampleItems,
      sampleItem.itemNumber,
      sampleItem.copyNumber
    );

    if (buffer) {
      supportAttachments.push({
        name: getSupportDocumentFilename(
          checkedSample,
          sampleItem.itemNumber,
          sampleItem.copyNumber
        ),
        content: buffer.toString('base64')
      });
    }

    await analysisDaiRepository.insert(analysisId);
  }

  if (checkedSample.ownerEmail && supportAttachments.length > 0) {
    await mailService.send({
      templateName: 'SupportDocumentCopyToOwnerTemplate',
      recipients: [checkedSample.ownerEmail],
      params: {
        region: checkedSample.region
          ? Regions[checkedSample.region].name
          : undefined,
        sampledAt: checkedSample.sampledDate.split('-').reverse().join('/')
      },
      attachment: supportAttachments
    });
  }

  analysisDaiProcessor.triggerProcessing();
};

const triggerProcessing = (
  checkedSample: SampleChecked,
  allSampleItems: SampleItem[],
  items: SupportDocumentItem[]
): void => {
  setImmediate(() => {
    processItems(checkedSample, allSampleItems, items).catch((err) =>
      console.error('[supportDocumentProcessor] failed:', err)
    );
  });
};

export const supportDocumentProcessor = {
  triggerProcessing
};
