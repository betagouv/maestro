import carbone, { RenderOptions } from 'carbone';
import { format } from 'date-fns';
import highland from 'highland';
import { getCultureKindLabel } from 'maestro-shared/referential/CultureKind';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { getMatrixPartLabel } from 'maestro-shared/referential/Matrix/MatrixPart';
import { QuantityUnitLabels } from 'maestro-shared/referential/QuantityUnit';
import { StageLabels } from 'maestro-shared/referential/Stage';
import { AnalysisRequestData } from 'maestro-shared/schema/Analysis/AnalysisRequestData';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { PartialSample } from 'maestro-shared/schema/Sample/Sample';
import { SampleItemRecipientKindLabels } from 'maestro-shared/schema/Sample/SampleItemRecipientKind';
import { SampleStatusLabels } from 'maestro-shared/schema/Sample/SampleStatus';
import { formatWithTz, isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import { analysisRepository } from '../../repositories/analysisRepository';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import sampleItemRepository from '../../repositories/sampleItemRepository';
import { Template, templatePath } from '../../templates/templates';

const generateAnalysisRequestExcel = async (data: AnalysisRequestData) => {
  return carboneRender('analysisRequest', data, { convertTo: 'xlsx' });
};

const generateSamplesExportExcel = async (
  samples: PartialSample[]
): Promise<Buffer> => {
  const laboratories = await laboratoryRepository.findMany();

  return highland(samples)
    .flatMap((sample) =>
      highland(
        Promise.all([
          sampleItemRepository.findMany(sample.id),
          analysisRepository.findUnique({ sampleId: sample.id })
        ]).then(([items, analysis]) => ({ sample, items, analysis }))
      )
    )
    .map(({ sample, items, analysis }) => {
      return {
        reference: sample.reference,
        department: sample.department,
        sampler: `${sample.sampler.firstName} ${sample.sampler.lastName}`,
        sampledAt: sample.sampledAt
          ? formatWithTz(sample.sampledAt, 'dd/MM/yyyy HH:mm')
          : '',
        status: SampleStatusLabels[sample.status],
        sentAt: sample.sentAt
          ? formatWithTz(sample.sentAt, 'dd/MM/yyyy HH:mm')
          : '',
        receivedAt: sample.receivedAt
          ? format(sample.receivedAt, 'dd/MM/yyyy')
          : '',
        latitude: sample.geolocation?.x,
        longitude: sample.geolocation?.y,
        parcel: sample.parcel,
        context: sample.context ? ContextLabels[sample.context] : undefined,
        legalContext: sample.legalContext
          ? LegalContextLabels[sample.legalContext]
          : undefined,
        company: sample.company?.name,
        companyAddress: [
          sample.company?.address,
          [sample.company?.postalCode, sample.company?.city].join(' ')
        ].join('\n'),
        companySiret: sample.company?.siret,
        resytalId: sample.resytalId,
        notesOnCreation: sample.notesOnCreation,
        matrix: sample.matrix ? MatrixLabels[sample.matrix] : undefined,
        matrixDetails:
          sample.specificData?.programmingPlanKind === 'PPV'
            ? sample.specificData?.matrixDetails
            : undefined,
        matrixPart: getMatrixPartLabel(sample),
        stage: sample.stage ? StageLabels[sample.stage] : undefined,
        cultureKind: getCultureKindLabel(sample),
        releaseControl:
          sample.specificData?.programmingPlanKind === 'PPV'
            ? sample.specificData.releaseControl
              ? 'Oui'
              : 'Non'
            : undefined,
        notesOnMatrix: sample.notesOnMatrix,
        ...items.reduce(
          (acc, item, index) => ({
            ...acc,
            [`quantity${index + 1}`]: item.quantity,
            [`quantityUnit${index + 1}`]: item.quantityUnit
              ? QuantityUnitLabels[item.quantityUnit]
              : undefined,
            [`sealId${index + 1}`]: item.sealId,
            [`recipient${index + 1}`]:
              item.recipientKind &&
              (item.recipientKind === 'Laboratory'
                ? 'Laboratoire ' +
                  laboratories.find((lab) => lab.id === sample.laboratoryId)
                    ?.name
                : SampleItemRecipientKindLabels[item.recipientKind]),
            [`compliance200263${index + 1}`]: item.compliance200263
              ? 'Oui'
              : 'Non'
          }),
          {}
        ),
        notesOnItems: sample.notesOnItems,
        notesOnAdmissibility: sample.notesOnAdmissibility,
        compliance: isDefinedAndNotNull(analysis?.compliance)
          ? analysis?.compliance
            ? 'Oui'
            : 'Non'
          : ''
      };
    })
    .collect()
    .map((s) => carboneRender('samplesExport', { samples: s }, {}))
    .toPromise(Promise);
};

const carboneRender = (
  template: Template,
  data: object,
  options: RenderOptions
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    carbone.render(templatePath(template), data, options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result as Buffer);
      }
    });
  });

export const excelService = {
  generateAnalysisRequestExcel,
  generateSamplesExportExcel
};
