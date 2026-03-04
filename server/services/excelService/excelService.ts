import carbone, { RenderOptions } from 'carbone';
import { format } from 'date-fns';
import { isNil, sumBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
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
  MatrixSpecificDataForm,
  MatrixSpecificDataFormInputProps
} from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataForm';
import {
  getSpecificDataValue,
  MatrixSpecificDataFormInputs,
  SampleMatrixSpecificDataKeys
} from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataFormInputs';
import {
  getPrescriptionTitle,
  Prescription,
  PrescriptionSort
} from 'maestro-shared/schema/Prescription/Prescription';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  getSampleMatrixLabel,
  PartialSample
} from 'maestro-shared/schema/Sample/Sample';
import { SampleItemRecipientKindLabels } from 'maestro-shared/schema/Sample/SampleItemRecipientKind';
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
import { SampleStatusLabels } from 'maestro-shared/schema/Sample/SampleStatus';
import { formatWithTz } from 'maestro-shared/utils/date';
import { isDefined, isDefinedAndNotNull } from 'maestro-shared/utils/utils';
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
  matrixCode?: string;
  matrixPart: string;
  stage: string;
  stageCode: string;
  specificData: {
    key: SampleMatrixSpecificDataKeys;
    label: string;
    value: string | null;
    code: string | null | undefined;
  }[];
  notesOnMatrix: string;
  notesOnItems: string;
  notesOnAdmissibility: string;
  items: SetAttributesNullOrUndefined<{
    sampleReference: string;
    itemNumber: number;
    copyNumber: number;
    quantity: number;
    quantityUnit: string;
    quantityUnitCode: string;
    sealId: string;
    recipient: string;
    laboratoryCode: string | null;
    compliance200263: string;
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
  samples: PartialSample[],
  withCodes = false
): Promise<Buffer> => {
  const laboratories = await laboratoryRepository.findMany();

  const samplesData: SamplesExportExcelData[] = await Promise.all(
    samples.map(async (sample) => {
      const items = await sampleItemRepository.findMany(sample.id);
      const itemsWithAnalysis = await Promise.all(
        items.map(async (item) => {
          const analysis = await analysisRepository.findUnique({
            sampleId: sample.id,
            itemNumber: item.itemNumber,
            copyNumber: item.copyNumber
          });
          return { ...item, analysis };
        })
      );

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
        matrixCode: sample.matrix,
        matrixPart: getMatrixPartLabel(sample),
        stage: sample.stage ? StageLabels[sample.stage] : undefined,
        stageCode: sample.stage,
        specificData: (
          Object.entries(
            MatrixSpecificDataForm[sample.specificData.programmingPlanKind]
          ) as [
            SampleMatrixSpecificDataKeys,
            MatrixSpecificDataFormInputProps
          ][]
        ).map(([inputKey, inputProps]) => ({
          key: inputKey,
          label:
            inputProps.label ?? MatrixSpecificDataFormInputs[inputKey].label,
          value: getSpecificDataValue(
            inputKey,
            sample.specificData as SampleMatrixSpecificData
          ),
          code:
            sample.specificData[inputKey as keyof SampleMatrixSpecificData] !==
            getSpecificDataValue(
              inputKey,
              sample.specificData as SampleMatrixSpecificData
            )
              ? sample.specificData[inputKey as keyof SampleMatrixSpecificData]
              : undefined
        })),
        notesOnMatrix: sample.notesOnMatrix,
        notesOnItems: sample.notesOnItems,
        notesOnAdmissibility: sample.notesOnAdmissibility,
        items: itemsWithAnalysis.map(({ analysis, ...item }) => ({
          sampleReference: sample.reference,
          itemNumber: item.itemNumber,
          copyNumber: item.copyNumber,
          quantity: item.quantity,
          quantityUnit: item.quantityUnit
            ? QuantityUnitLabels[item.quantityUnit]
            : undefined,
          quantityUnitCode: item.quantityUnit,
          sealId: item.sealId,
          recipient:
            item.recipientKind &&
            (item.recipientKind === 'Laboratory'
              ? 'Laboratoire ' +
                laboratories.find((lab) => lab.id === item.laboratoryId)?.name
              : SampleItemRecipientKindLabels[item.recipientKind]),
          laboratoryCode:
            withCodes && item.recipientKind === 'Laboratory'
              ? laboratories.find((lab) => lab.id === item.laboratoryId)
                  ?.shortName
              : null,
          compliance200263: item.compliance200263 ? 'Oui' : 'Non',
          compliance: isDefinedAndNotNull(analysis?.compliance)
            ? analysis?.compliance
              ? 'Oui'
              : 'Non'
            : '',
          residues: (analysis?.residues ?? []).map((r) => ({
            sampleReference: sample.reference,
            itemNumber: item.itemNumber,
            copyNumber: item.copyNumber,
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
            resultKind: r.resultKind
              ? ResultKindLabels[r.resultKind]
              : undefined,
            result: r.result,
            resultUnit: 'mg/kg',
            lmr: r.lmr,
            resultHigherThanArfd: optionalBooleanToString(
              r.resultHigherThanArfd
            ),
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
              itemNumber: item.itemNumber,
              copyNumber: item.copyNumber,
              residueNumber: a.residueNumber,
              analyteNumber: a.analyteNumber,
              reference: a.reference,
              referenceLabel: a.reference
                ? SSD2IdLabel[a.reference]
                : undefined,
              resultKind: a.resultKind
                ? ResultKindLabels[a.resultKind]
                : undefined,
              result: a.result
            }))
          }))
        }))
      };

      if (withCodes) {
        data['matrixCode'] = sample.matrix;
      }

      return data;
    })
  );

  const specificDataHeaders = samplesData
    .flatMap((sample) => sample.specificData ?? [])
    .reduce<
      { key: SampleMatrixSpecificDataKeys; label: string }[]
    >((acc, { key, label }) => (acc.some((h) => h.key === key) ? acc : [...acc, { key, label }]), []);

  const completedSamples = samplesData.map((sample) => ({
    ...sample,
    specificData: specificDataHeaders.map(({ key, label }) => ({
      ...sample.specificData?.find((d) => d.key === key),
      key,
      label
    }))
  }));

  const items = completedSamples
    .flatMap((sample) => sample.items)
    .filter((i) => !isNil(i));
  const residues = items.flatMap((i) => i?.residues).filter((r) => !isNil(r));
  const analytes = residues.flatMap((r) => r.analytes).filter((a) => !isNil(a));

  return carboneRender(
    withCodes ? 'samplesExportWithCodes' : 'samplesExport',
    {
      specificDataHeaders,
      samples: completedSamples,
      items,
      residues,
      analytes
    },
    {}
  );
};

const generatePrescriptionsExportExcel = async (
  programmingPlan: ProgrammingPlanChecked,
  prescriptions: Prescription[],
  localPrescriptions: LocalPrescription[],
  exportedRegion: Region | undefined,
  exportedDepartment: Department | undefined
): Promise<Buffer> => {
  const exportedRegions = exportedRegion ? [exportedRegion] : RegionList;
  const exportedDepartments = exportedDepartment
    ? [exportedDepartment]
    : exportedRegion
      ? Regions[exportedRegion].departments
      : [];

  // const laboratories = exportedRegion
  //   ? await laboratoryRepository.findMany()
  //   : [];

  console.log('Export prescriptions', exportedRegion, exportedDepartments);

  const columnTitles: string[] = [];

  if (!exportedRegion) {
    columnTitles.push('Total national Programmés');
    columnTitles.push('Total national Réalisés');
    columnTitles.push('Total national Taux de réalisation');
  }
  if (!exportedDepartment) {
    columnTitles.push(
      ...exportedRegions.flatMap((region) => [
        `Région ${Regions[region].shortName} - Programmés`,
        `Région ${Regions[region].shortName} - Réalisés`,
        `Région ${Regions[region].shortName} - Taux de réalisation`
      ])
    );
  }
  if (programmingPlan.distributionKind !== 'REGIONAL') {
    columnTitles.push(
      ...exportedDepartments.flatMap((department) => [
        `Département ${department} - Programmés`,
        `Département ${department} - Réalisés`,
        `Département ${department} - Taux de réalisation`
      ])
    );
  }

  const prescriptionsWithColumns = prescriptions
    .toSorted(PrescriptionSort)
    .map((prescription) => {
      const filteredLocalPrescriptions = [
        ...localPrescriptions.filter(
          (_) => _.prescriptionId === prescription.id && isNil(_.companySiret)
        )
      ].toSorted(LocalPrescriptionSort);

      const columns = [];
      if (!exportedRegion) {
        columns.push(
          sumBy(filteredLocalPrescriptions, 'sampleCount'),
          sumBy(filteredLocalPrescriptions, 'realizedSampleCount') ?? 0,
          getCompletionRate(filteredLocalPrescriptions)
        );
      }
      columns.push(
        ...filteredLocalPrescriptions.flatMap(
          ({ sampleCount, realizedSampleCount, region }) => [
            sampleCount,
            realizedSampleCount ?? 0,
            getCompletionRate(filteredLocalPrescriptions, region)
          ]
        )
      );
      return {
        matrix: getPrescriptionTitle(prescription),
        stages: prescription.stages
          .map((stage) => StageLabels[stage])
          .join(', '),
        columns: columns.map((v) => ({ value: v }))
        // laboratories.find(
        //   (laboratory) =>
        //     laboratory.id ===
        //     filteredLocalPrescriptions[0]?.substanceKindsLaboratories?.[0]
        //       ?.laboratoryId
        // )?.name
        //.map((v) => ({ value: v }))
      };
    });

  const totalColums = [];
  if (!exportedRegion) {
    totalColums.push(
      sumBy(localPrescriptions, 'sampleCount'),
      sumBy(localPrescriptions, 'realizedSampleCount'),
      getCompletionRate(localPrescriptions)
    );
  }
  if (!exportedDepartment) {
    totalColums.push(
      ...exportedRegions.flatMap((region) => [
        sumBy(
          localPrescriptions.filter(
            (_) => _.region === region && isNil(_.department)
          ),
          'sampleCount'
        ),
        sumBy(
          localPrescriptions.filter(
            (_) => _.region === region && isNil(_.department)
          ),
          'realizedSampleCount'
        ),
        getCompletionRate(
          localPrescriptions.filter(
            (_) => _.region === region && isNil(_.department)
          ),
          region
        )
      ])
    );
  }
  if (programmingPlan.distributionKind !== 'REGIONAL') {
    totalColums.push(
      ...exportedDepartments.flatMap((dept) => [
        sumBy(
          localPrescriptions.filter(
            (_) => _.department === dept && isNil(_.companySiret)
          ),
          'sampleCount'
        ),
        sumBy(
          localPrescriptions.filter(
            (_) => _.department === dept && isNil(_.companySiret)
          ),
          'realizedSampleCount'
        ),
        getCompletionRate(
          localPrescriptions.filter(
            (_) => _.department === dept && isNil(_.companySiret)
          ),
          undefined,
          true
        )
      ])
    );
  }

  return carboneRender(
    'prescriptionsExport',
    {
      columnTitles: columnTitles
        .flat()
        .filter(isDefined)
        .map((v) => ({ value: v })),
      prescriptions: [
        ...prescriptionsWithColumns,
        {
          matrix: 'Total',
          stages: '',
          columns: totalColums.map((v) => ({ value: v }))
        }
      ]
    },
    {}
  );
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
