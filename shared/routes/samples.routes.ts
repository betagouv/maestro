import z from 'zod';
import {
  DocumentChecked,
  SampleDocumentToCreate,
  SampleDocumentUpdate
} from '../schema/Document/Document';
import { FindSampleOptions } from '../schema/Sample/FindSampleOptions';
import {
  PartialSample,
  PartialSampleToCreate,
  SampleComplianceData
} from '../schema/Sample/Sample';
import { SampleItemUpdate } from '../schema/Sample/SampleItem';
import type { SubRoutes } from './routes';

export const samplesRoutes = {
  '/samples': {
    get: {
      query: FindSampleOptions,
      permissions: ['readSamples'],
      response: z.array(PartialSample)
    },
    post: {
      body: PartialSampleToCreate,
      permissions: ['createSample'],
      response: PartialSample
    }
  },
  '/samples/count': {
    get: {
      query: FindSampleOptions,
      permissions: ['readSamples'],
      response: z.object({ count: z.number() })
    }
  },
  '/samples/export': {
    get: {
      query: FindSampleOptions,
      permissions: ['readSamples'],
      response: z.custom<Buffer>()
    }
  },
  '/samples/:sampleId/document': {
    params: {
      sampleId: z.guid()
    },
    get: {
      permissions: ['downloadSupportDocument'],
      response: z.custom<Buffer>()
    }
  },
  '/samples/:sampleId/documents': {
    params: {
      sampleId: z.guid()
    },
    post: {
      body: SampleDocumentToCreate,
      permissions: ['createSample'],
      response: DocumentChecked
    }
  },
  '/samples/:sampleId/documents/:documentId': {
    params: {
      sampleId: z.guid(),
      documentId: z.guid()
    },
    get: {
      permissions: ['readDocuments'],
      response: DocumentChecked
    },
    put: {
      body: SampleDocumentUpdate,
      permissions: ['updateSample'],
      response: DocumentChecked
    },
    delete: {
      permissions: ['deleteSampleDocument'],
      response: z.undefined()
    }
  },
  '/samples/:sampleId/documents/:documentId/download-signed-url': {
    params: {
      sampleId: z.guid(),
      documentId: z.guid()
    },
    get: {
      permissions: ['readDocuments'],
      response: z.object({
        url: z.string()
      })
    }
  },
  '/samples/:sampleId/items/:itemNumber/copy/:copyNumber/document': {
    params: {
      sampleId: z.guid(),
      itemNumber: z.number().min(1),
      copyNumber: z.number().min(1)
    },
    get: {
      permissions: ['downloadSupportDocument'],
      response: z.custom<Buffer>()
    }
  },
  '/samples/:sampleId/items/:itemNumber/copy/:copyNumber': {
    params: {
      sampleId: z.guid(),
      itemNumber: z.number().min(1),
      copyNumber: z.number().min(1)
    },
    put: {
      body: SampleItemUpdate,
      permissions: ['performAnalysis', 'updateSample'],
      response: z.undefined()
    }
  },
  '/samples/:sampleId': {
    params: {
      sampleId: z.guid()
    },
    get: {
      permissions: ['readSamples'],
      response: PartialSample
    },
    put: {
      body: PartialSample,
      permissions: ['updateSample'],
      response: PartialSample
    },
    delete: {
      permissions: ['deleteSample'],
      response: z.undefined()
    }
  },
  '/samples/:sampleId/compliance': {
    params: {
      sampleId: z.guid()
    },
    put: {
      body: SampleComplianceData,
      permissions: ['performAnalysis'],
      response: SampleComplianceData
    }
  },
  '/samples/:sampleId/emptyForm': {
    params: {
      sampleId: z.guid()
    },
    get: {
      permissions: ['downloadSupportDocument'],
      response: z.custom<Buffer>()
    }
  }
} as const satisfies SubRoutes<'/samples'>;
