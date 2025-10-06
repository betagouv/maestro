import carbone, { RenderOptions } from 'carbone';
import { format } from 'date-fns';
import highland from 'highland';
import { isNil, sumBy } from 'lodash-es';
import { getCultureKindLabel } from 'maestro-shared/referential/CultureKind';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { getMatrixPartLabel } from 'maestro-shared/referential/Matrix/MatrixPart';
import { OptionalBoolean } from 'maestro-shared/referential/OptionnalBoolean';
import { QuantityUnitLabels } from 'maestro-shared/referential/QuantityUnit';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import { isComplex } from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { StageLabels } from 'maestro-shared/referential/Stage';
import { AnalysisMethodLabels } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { AnalysisRequestData } from 'maestro-shared/schema/Analysis/AnalysisRequestData';
import { ResidueComplianceLabels } from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import { ResidueKindLabels } from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import { ResultKindLabels } from 'maestro-shared/schema/Analysis/Residue/ResultKind';
import {
  getCompletionRate,
  LocalPrescription,
  LocalPrescriptionSort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  Prescription,
  PrescriptionSort
} from 'maestro-shared/schema/Prescription/Prescription';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  getSampleMatrixLabel,
  PartialSample
} from 'maestro-shared/schema/Sample/Sample';
import { SampleItemRecipientKindLabels } from 'maestro-shared/schema/Sample/SampleItemRecipientKind';
import { SampleStatusLabels } from 'maestro-shared/schema/Sample/SampleStatus';
import {
  formatWithTz,
  isDefined,
  isDefinedAndNotNull
} from 'maestro-shared/utils/utils';
import { analysisRepository } from '../../repositories/analysisRepository';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import sampleItemRepository from '../../repositories/sampleItemRepository';
import { Template, templatePath } from '../../templates/templates';

const generateAnalysisRequestExcel = async (data: AnalysisRequestData) => {
  return carboneRender('analysisRequest', data, { convertTo: 'xlsx' });
};

type SetAttributesNullOrUndefined<T> = {
  [key in keyof T]: T[key] | null | undefined;
};

type SamplesExportExcelData = SetAttributesNullOrUndefined<{
  reference: string;
  department: string;
  sampler: string;
  sampledAt: string;
  status: string;
  sentAt: string;
  receivedAt: string;
  latitude: number;
  longitude: number;
  parcel: string;
  context: string;
  legalContext: string;
  company: string;
  companyAddress: string;
  companySiret: string;
  resytalId: string;
  notesOnCreation: string;
  matrix: string;
  matrixDetails: string;
  matrixPart: string;
  stage: string;
  cultureKind: string;
  releaseControl: string;
  notesOnMatrix: string;
  quantity1: string;
  quantityUnit1: string;
  sealId1: string;
  recipient1: string;
  compliance2002631: string;
  quantity2: string;
  quantityUnit2: string;
  sealId2: string;
  recipient2: string;
  compliance2002632: string;
  quantity3: string;
  quantityUnit3: string;
  sealId3: string;
  recipient3: string;
  compliance2002633: string;
  notesOnItems: string;
  notesOnAdmissibility: string;
  compliance: string;
  residues: SetAttributesNullOrUndefined<{
    sampleReference: string;
    reference: string;
    kind: string;
    referenceLabel: string;
    residueNumber: number;
    analysisMethod: string;
    analysisDate: string;
    resultKind: string;
    result: number;
    resultUnit: string;
    lmr: number;
    resultHigherThanArfd: string;
    notesOnResult: string;
    substanceApproved: string;
    substanceAuthorised: string;
    pollutionRisk: string;
    notesOnPollutionRisk: string;
    compliance: string;
    otherCompliance: string;
    sampleCompliance: string;
    analytes: SetAttributesNullOrUndefined<{
      sampleReference: string;
      residueNumber: number;
      analyteNumber: number;
      reference: string;
      referenceLabel: string;
      resultKind: string;
      result: number;
    }>[];
  }>[];
}>;

const optionalBooleanToString = (
  booleanValue: OptionalBoolean | null | undefined
): string =>
  booleanValue === 'true'
    ? 'Oui'
    : booleanValue === 'false'
      ? 'Non'
      : (booleanValue ?? '');

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
      const data: SamplesExportExcelData = {
        reference: sample.reference,
        department: sample.department,
        sampler: `${sample.sampler.name}`,
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
        matrix: sample.matrix ? getSampleMatrixLabel(sample) : undefined,
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
          {} as Pick<
            SamplesExportExcelData,
            | 'quantity1'
            | 'quantityUnit1'
            | 'sealId1'
            | 'recipient1'
            | 'compliance2002631'
            | 'quantity2'
            | 'quantityUnit2'
            | 'sealId2'
            | 'recipient2'
            | 'compliance2002632'
            | 'quantity3'
            | 'quantityUnit3'
            | 'sealId3'
            | 'recipient3'
            | 'compliance2002633'
          >
        ),
        notesOnItems: sample.notesOnItems,
        notesOnAdmissibility: sample.notesOnAdmissibility,
        compliance: isDefinedAndNotNull(analysis?.compliance)
          ? analysis?.compliance
            ? 'Oui'
            : 'Non'
          : '',
        residues: (analysis?.residues ?? []).map((r) => ({
          sampleReference: sample.reference,
          referenceLabel: r.reference ? SSD2IdLabel[r.reference] : undefined,
          kind: r.reference
            ? isComplex(r.reference)
              ? ResidueKindLabels['Complex']
              : ResidueKindLabels['Simple']
            : undefined,
          reference: r.reference,
          residueNumber: r.residueNumber,
          analysisMethod: r.analysisMethod
            ? AnalysisMethodLabels[r.analysisMethod]
            : undefined,
          analysisDate: r.analysisDate,
          resultKind: r.resultKind ? ResultKindLabels[r.resultKind] : undefined,
          result: r.result,
          resultUnit: 'mg/kg',
          lmr: r.lmr,
          resultHigherThanArfd: optionalBooleanToString(r.resultHigherThanArfd),
          notesOnResult: r.notesOnResult,
          substanceApproved: optionalBooleanToString(r.substanceApproved),
          substanceAuthorised: optionalBooleanToString(r.substanceAuthorised),
          pollutionRisk: optionalBooleanToString(r.pollutionRisk),
          notesOnPollutionRisk: r.notesOnPollutionRisk,
          compliance: r.compliance
            ? ResidueComplianceLabels[r.compliance]
            : undefined,
          otherCompliance: r.otherCompliance,
          sampleCompliance: isDefinedAndNotNull(analysis?.compliance)
            ? analysis?.compliance
              ? 'Oui'
              : 'Non'
            : '',
          analytes: (r.analytes ?? []).map((a) => ({
            sampleReference: sample.reference,
            residueNumber: a.residueNumber,
            analyteNumber: a.analyteNumber,
            reference: a.reference,
            referenceLabel: a.reference ? SSD2IdLabel[a.reference] : undefined,
            resultKind: a.resultKind
              ? ResultKindLabels[a.resultKind]
              : undefined,
            result: a.result
          }))
        }))
      };

      return data;
    })
    .collect()
    .map((s) => {
      const residues = s.flatMap((r) => r.residues).filter((r) => !isNil(r));
      const analytes = residues
        .flatMap((r) => r.analytes)
        .filter((a) => !isNil(a));
      return carboneRender(
        'samplesExport',
        {
          samples: s,
          residues,
          analytes
        },
        {}
      );
    })
    .toPromise(Promise);
};

const generatePrescriptionsExportExcel = async (
  prescriptions: Prescription[],
  regionalPrescriptions: LocalPrescription[],
  exportedRegion: Region | undefined
): Promise<Buffer> => {
  const exportedRegions = exportedRegion ? [exportedRegion] : RegionList;

  const laboratories = exportedRegion
    ? await laboratoryRepository.findMany()
    : [];

  const columnTitles = [
    !exportedRegion ? 'Total national Programmés' : undefined,
    !exportedRegion ? 'Total national Réalisés' : undefined,
    !exportedRegion ? 'Total national Taux de réalisation' : undefined,
    ...exportedRegions.map((region) => [
      `${Regions[region].shortName} Programmés`,
      `${Regions[region].shortName} Réalisés`,
      `${Regions[region].shortName} Taux de réalisation`
    ]),
    exportedRegion ? 'Laboratoire' : undefined
  ]
    .flat()
    .filter(isDefined)
    .map((v) => ({ value: v }));

  return highland(prescriptions.toSorted(PrescriptionSort))
    .map((prescription) => ({
      prescription,
      filteredLocalPrescriptions: [
        ...regionalPrescriptions.filter(
          (r) => r.prescriptionId === prescription.id
        )
      ].toSorted(LocalPrescriptionSort)
    }))
    .map(({ prescription, filteredLocalPrescriptions }) => {
      return {
        matrix: MatrixKindLabels[prescription.matrixKind],
        stages: prescription.stages
          .map((stage) => StageLabels[stage])
          .join(', '),
        columns: [
          !exportedRegion
            ? sumBy(filteredLocalPrescriptions, 'sampleCount')
            : undefined,
          !exportedRegion
            ? sumBy(filteredLocalPrescriptions, 'realizedSampleCount')
            : undefined,
          !exportedRegion
            ? getCompletionRate(filteredLocalPrescriptions)
            : undefined,
          ...filteredLocalPrescriptions.reduce(
            (acc, { sampleCount, realizedSampleCount, region }) => [
              ...acc,
              sampleCount,
              realizedSampleCount ?? 0,
              getCompletionRate(filteredLocalPrescriptions, region)
            ],
            [] as number[]
          ),
          laboratories.find(
            (laboratory) =>
              laboratory.id === filteredLocalPrescriptions[0]?.laboratoryId
          )?.name
        ]
          .filter(isDefined)
          .map((v) => ({ value: v }))
      };
    })
    .collect()
    .map((prescriptions) => {
      return carboneRender(
        'prescriptionsExport',
        {
          columnTitles,
          prescriptions: [
            ...prescriptions,
            {
              matrix: 'Total',
              columns: [
                !exportedRegion
                  ? sumBy(regionalPrescriptions, 'sampleCount')
                  : undefined,
                !exportedRegion
                  ? sumBy(regionalPrescriptions, 'realizedSampleCount')
                  : undefined,
                !exportedRegion
                  ? getCompletionRate(regionalPrescriptions)
                  : undefined,
                ...exportedRegions.reduce(
                  (acc, region) => [
                    ...acc,
                    sumBy(
                      regionalPrescriptions.filter((r) => r.region === region),
                      'sampleCount'
                    ),
                    sumBy(
                      regionalPrescriptions.filter((r) => r.region === region),
                      'realizedSampleCount'
                    ),
                    getCompletionRate(
                      regionalPrescriptions.filter((r) => r.region === region),
                      region
                    )
                  ],
                  [] as number[]
                )
              ]
                .filter(isDefined)
                .map((v) => ({ value: v }))
            }
          ]
        },
        {}
      );
    })
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
  generateSamplesExportExcel,
  generatePrescriptionsExportExcel
};
