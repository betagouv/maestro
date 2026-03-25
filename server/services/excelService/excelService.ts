import carbone, { type RenderOptions } from 'carbone';
import { format } from 'date-fns';
import { isNil, sumBy, uniq } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import type {
  OptionalBoolean,
  OptionalBooleanLabels
} from 'maestro-shared/referential/OptionnalBoolean';
import { QuantityUnitLabels } from 'maestro-shared/referential/QuantityUnit';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
import {
  getAnalytes,
  isComplex
} from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import {
  SSD2IdLabel,
  SSD2Referential
} from 'maestro-shared/referential/Residue/SSD2Referential';
import { StageLabels } from 'maestro-shared/referential/Stage';
import { AnalysisMethodLabels } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import type { AnalysisRequestData } from 'maestro-shared/schema/Analysis/AnalysisRequestData';
import { ResidueComplianceLabels } from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import { ResidueKindLabels } from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import { ResultKindLabels } from 'maestro-shared/schema/Analysis/Residue/ResultKind';
import { LaboratoryAnalyticalCompetence } from 'maestro-shared/schema/Laboratory/LaboratoryAnalyticalCompetence';
import {
  getCompletionRate,
  type LocalPrescription,
  LocalPrescriptionSort
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  getPrescriptionTitle,
  type Prescription,
  PrescriptionSort
} from 'maestro-shared/schema/Prescription/Prescription';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import type { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  getSampleMatrixLabel,
  type PartialSample,
  SampleChecked
} from 'maestro-shared/schema/Sample/Sample';
import { SampleItemRecipientKindLabels } from 'maestro-shared/schema/Sample/SampleItemRecipientKind';
import { SampleStatusLabels } from 'maestro-shared/schema/Sample/SampleStatus';
import { getFieldValueLabel } from 'maestro-shared/schema/SpecificData/getFieldValueLabel';
import type { PlanKindFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { formatWithTz } from 'maestro-shared/utils/date';
import { isDefined, isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import { analysisRepository } from '../../repositories/analysisRepository';
import companyRepository from '../../repositories/companyRepository';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import sampleItemRepository from '../../repositories/sampleItemRepository';
import { specificDataFieldConfigRepository } from '../../repositories/specificDataFieldConfigRepository';
import { type Template, templatePath } from '../../templates/templates';

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
  statusCode: string;
  sentAt: string;
  latitude: number;
  longitude: number;
  parcel: string;
  context: string;
  contextCode?: string;
  legalContext: string;
  legalContextCode?: string;
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
    key: string;
    label: string;
    value: string | null;
    code: string | null | undefined;
  }[];
  notesOnMatrix: string;
  notesOnItems: string;
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
    receiptDate: string | null;
    notesOnAdmissibility: string | null;
    shippingDate: string | null;
    destructionDate: string | null;
    carrier: string | null;
    invoicingDate: string | null;
    paid: string | null;
    paidDate: string | null;
    invoiceNumber: string | null;
    budgetNotes: string | null;
    residues: SetAttributesNullOrUndefined<{
      sampleReference: string;
      reference: string;
      kind: string;
      referenceLabel: string;
      residueNumber: number;
      analysisMethod: string;
      analysisMethodCode: string;
      analysisDate: string;
      resultKind: string;
      resultKindCode: string;
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
      complianceCode: string;
      otherCompliance: string;
      sampleCompliance: string;
      analytes: SetAttributesNullOrUndefined<{
        sampleReference: string;
        residueNumber: number;
        analyteNumber: number;
        reference: string;
        referenceLabel: string;
        resultKind: string;
        resultKindCode: string;
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

  const fieldConfigsCache = new Map<string, PlanKindFieldConfig[]>();
  const getFieldConfigs = async (
    programmingPlanId: string,
    kind: ProgrammingPlanKind
  ): Promise<PlanKindFieldConfig[]> => {
    const cacheKey = `${programmingPlanId}:${kind}`;
    if (!fieldConfigsCache.has(cacheKey)) {
      fieldConfigsCache.set(
        cacheKey,
        await specificDataFieldConfigRepository.findByPlanKind(
          programmingPlanId,
          kind
        )
      );
    }
    return fieldConfigsCache.get(cacheKey)!;
  };

  const samplesData: SamplesExportExcelData[] = await Promise.all(
    samples.map(async (sample) => {
      const fieldConfigs = await getFieldConfigs(
        sample.programmingPlanId,
        sample.programmingPlanKind
      );

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

      const matrixPartField = fieldConfigs.find(
        (c) => c.field.key === 'matrixPart'
      )?.field;
      const data: SamplesExportExcelData = {
        reference: sample.reference,
        department: sample.department,
        sampler: `${sample.sampler.name}`,
        sampledAt: sample.sampledAt
          ? formatWithTz(sample.sampledAt, 'dd/MM/yyyy HH:mm')
          : '',
        status: SampleStatusLabels[sample.status],
        statusCode: sample.status,
        sentAt:
          SampleChecked.safeParse(sample).success &&
          (sample as SampleChecked).sentAt
            ? formatWithTz(
                (sample as SampleChecked).sentAt as Date,
                'dd/MM/yyyy HH:mm'
              )
            : '',
        latitude: sample.geolocation?.x,
        longitude: sample.geolocation?.y,
        parcel: sample.parcel,
        context: sample.context ? ContextLabels[sample.context] : undefined,
        contextCode: sample.context,
        legalContext: sample.legalContext
          ? LegalContextLabels[sample.legalContext]
          : undefined,
        legalContextCode: sample.legalContext,
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
        matrixPart: matrixPartField
          ? (getFieldValueLabel(
              matrixPartField,
              sample.specificData['matrixPart']
            ) ?? '')
          : '',
        stage: sample.stage ? StageLabels[sample.stage] : undefined,
        stageCode: sample.stage,
        specificData: fieldConfigs.map((fc) => {
          const rawValue = sample.specificData[fc.field.key];
          const value = getFieldValueLabel(fc.field, rawValue);
          return {
            key: fc.field.key,
            label: fc.field.label,
            value,
            code: rawValue !== value ? (rawValue as string) : undefined
          };
        }),
        notesOnMatrix: sample.notesOnMatrix,
        notesOnItems: sample.notesOnItems,
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
            item.recipientKind === 'Laboratory'
              ? laboratories.find((lab) => lab.id === item.laboratoryId)
                  ?.shortName
              : null,
          compliance200263: item.compliance200263 ? 'Oui' : 'Non',
          compliance: isDefinedAndNotNull(analysis?.compliance)
            ? analysis?.compliance
              ? 'Oui'
              : 'Non'
            : '',
          receiptDate: item.receiptDate
            ? format(item.receiptDate, 'dd/MM/yyyy')
            : '',
          notesOnAdmissibility: item.notesOnAdmissibility,
          shippingDate: item.shippingDate
            ? format(item.shippingDate, 'dd/MM/yyyy')
            : '',
          destructionDate: item.destructionDate
            ? format(item.destructionDate, 'dd/MM/yyyy')
            : '',
          carrier: item.carrier,
          invoicingDate: item.invoicingDate
            ? format(item.invoicingDate, 'dd/MM/yyyy')
            : '',
          paid: item.paid ? 'Oui' : 'Non',
          paidDate: item.paidDate ? format(item.paidDate, 'dd/MM/yyyy') : '',
          invoiceNumber: item.invoiceNumber,
          budgetNotes: item.budgetNotes,
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
            analysisMethodCode: r.analysisMethod,
            analysisDate: r.analysisDate,
            resultKind: r.resultKind
              ? ResultKindLabels[r.resultKind]
              : undefined,
            resultKindCode: r.resultKind,
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
            complianceCode: r.compliance,
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
              resultKindCode: a.resultKind,
              result: a.result
            }))
          }))
        }))
      };

      return data;
    })
  );

  const specificDataHeaders = samplesData
    .flatMap((sample) => sample.specificData ?? [])
    .reduce<{ key: string; label: string }[]>((acc, { key, label }) => {
      if (acc.some((h) => h.key === key)) {
        return acc;
      } else {
        acc.push({ key, label });
        return acc;
      }
    }, []);

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

  console.log('Export prescriptions', exportedRegion, exportedDepartments);

  const laboratories = await laboratoryRepository.findMany();
  const companySirets = uniq(
    localPrescriptions
      .filter((_) => !isNil(_.companySiret))
      .map((_) => _.companySiret)
  );

  const columnTitles: string[] = [];

  if (!exportedRegion) {
    columnTitles.push('Total national Programmés');
    columnTitles.push('Total national Réalisés');
    columnTitles.push('Total national Taux de réalisation');
  }
  if (!exportedDepartment) {
    columnTitles.push(
      ...exportedRegions.flatMap((region) => [
        `Région ${Regions[region].shortName}\nProgrammés`,
        `Région ${Regions[region].shortName}\nRéalisés`,
        `Région ${Regions[region].shortName}\nTaux de réalisation`,
        ...(programmingPlan.distributionKind === 'REGIONAL'
          ? programmingPlan.substanceKinds.flatMap(
              (substanceKind) =>
                `Région ${Regions[region].shortName}\nLaboratoire ${SubstanceKindLabels[substanceKind].toLowerCase()}`
            )
          : [])
      ])
    );
  }
  if (programmingPlan.distributionKind === 'SLAUGHTERHOUSE') {
    columnTitles.push(
      ...exportedDepartments.flatMap((department) => [
        `Département ${department}\nProgrammés`,
        `Département ${department}\nRéalisés`,
        `Département ${department}\nTaux de réalisation`,
        ...programmingPlan.substanceKinds.flatMap(
          (substanceKind) =>
            `Département ${department}\nLaboratoire ${SubstanceKindLabels[substanceKind].toLowerCase()}`
        )
      ])
    );

    if (exportedDepartment) {
      const companies = await companyRepository.findMany({
        region: exportedRegion,
        department: exportedDepartment,
        kinds: ['POULTRY_SLAUGHTERHOUSE', 'MEAT_SLAUGHTERHOUSE']
      });
      columnTitles.push(
        ...companySirets.flatMap((companySiret) => {
          const companyName =
            companies.find((c) => c.siret === companySiret)?.name ??
            (companySiret as string);
          return [
            `${companyName}\nProgrammés`,
            `${companyName}\nRéalisés`,
            `${companyName}\nTaux de réalisation`
          ];
        })
      );
    }
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
          ({
            sampleCount,
            realizedSampleCount,
            region,
            department,
            substanceKindsLaboratories
          }) => [
            sampleCount,
            realizedSampleCount ?? 0,
            getCompletionRate(filteredLocalPrescriptions, region),
            ...((programmingPlan.distributionKind === 'SLAUGHTERHOUSE' &&
              !isNil(department)) ||
            (programmingPlan.distributionKind === 'REGIONAL' && !isNil(region))
              ? programmingPlan.substanceKinds.flatMap(
                  (substanceKind) =>
                    laboratories.find((laboratory) =>
                      substanceKindsLaboratories?.some(
                        (skl) =>
                          skl.substanceKind === substanceKind &&
                          laboratory.id === skl.laboratoryId
                      )
                    )?.shortName ?? ''
                )
              : [])
          ]
        )
      );

      if (exportedRegion && exportedDepartment) {
        columns.push(
          ...companySirets.flatMap((companySiret) => {
            const companyPrescription = localPrescriptions.find(
              (_) =>
                _.prescriptionId === prescription.id &&
                _.companySiret === companySiret
            ) ?? {
              sampleCount: 0,
              realizedSampleCount: 0,
              region: exportedRegion
            };
            return [
              companyPrescription?.sampleCount ?? 0,
              companyPrescription?.realizedSampleCount ?? 0,
              getCompletionRate(companyPrescription, undefined, true)
            ];
          })
        );
      }

      return {
        matrix: getPrescriptionTitle(prescription),
        stages: prescription.stages
          .map((stage) => StageLabels[stage])
          .join(', '),
        columns: columns.map((v) => ({ value: v }))
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

  if (programmingPlan.distributionKind === 'SLAUGHTERHOUSE') {
    totalColums.push(
      ...exportedDepartments.flatMap((dept) => {
        const filteredLocalPrescriptions = localPrescriptions.filter(
          (_) => _.region === exportedRegion && _.department === dept
        );
        return [
          sumBy(filteredLocalPrescriptions, 'sampleCount'),
          sumBy(filteredLocalPrescriptions, 'realizedSampleCount'),
          getCompletionRate(filteredLocalPrescriptions, undefined, true),
          '',
          '',
          ''
        ];
      })
    );

    if (exportedRegion && exportedDepartment) {
      totalColums.push(
        ...companySirets.flatMap((companySiret) => {
          const filteredLocalPrescriptions = localPrescriptions.filter(
            (_) =>
              _.companySiret === companySiret &&
              _.region === exportedRegion &&
              _.department === exportedDepartment
          );
          return [
            sumBy(filteredLocalPrescriptions, 'sampleCount'),
            sumBy(filteredLocalPrescriptions, 'realizedSampleCount'),
            getCompletionRate(filteredLocalPrescriptions, undefined, true)
          ];
        })
      );
    }
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

const generateLaboratoryAnalyticCompetencesExportExcel = async (
  laboratoryAnalyticalCompetences: LaboratoryAnalyticalCompetence[]
): Promise<Buffer> => {
  const columnTitles: string[] = [];

  const getCompetence = (
    residueReference: string,
    analyteReference?: string
  ) => {
    return laboratoryAnalyticalCompetences.find(
      (competence) =>
        competence.residueReference === residueReference &&
        (analyteReference
          ? competence.analyteReference === analyteReference
          : !competence.analyteReference)
    );
  };

  return carboneRender(
    'laboratoryAnalyticCompetencesExport',
    {
      columnTitles: columnTitles
        .flat()
        .filter(isDefined)
        .map((v) => ({ value: v })),
      competences: Object.entries(SSD2Referential)
        .filter(([_, ssd2Referential]) => ssd2Referential.reportable)
        .flatMap(([ssd2Code, ssd2Referential]) => [
          {
            residueReference: ssd2Code,
            residueName: SSD2IdLabel[ssd2Code],
            analyteReference: '',
            analyteName: '',
            isResidue: 1,
            isComplexResidue: isComplex(ssd2Code) ? 1 : null,
            isCompleteDefinitionAnalysis: !isNil(
              getCompetence(ssd2Code)?.isCompleteDefinitionAnalysis
            )
              ? OptionalBooleanLabels[
                  getCompetence(ssd2Code)
                    ?.isCompleteDefinitionAnalysis as OptionalBoolean
                ]
              : undefined,
            detectionLimit: getCompetence(ssd2Code)?.detectionLimit,
            quantificationLimit: getCompetence(ssd2Code)?.quantificationLimit,
            analyticalMethod: getCompetence(ssd2Code)?.analyticalMethod,
            validationMethod: getCompetence(ssd2Code)?.validationMethod,
            analysisMethodMono:
              getCompetence(ssd2Code)?.analysisMethod === 'Mono' ? 1 : null,
            analysisMethodMulti:
              getCompetence(ssd2Code)?.analysisMethod === 'Multi' ? 1 : null
          },
          ...Array.from(getAnalytes(ssd2Referential.reference)).map(
            (analyteReference) => ({
              residueReference: ssd2Code,
              residueName: SSD2IdLabel[ssd2Code],
              analyteReference,
              analyteName: SSD2IdLabel[analyteReference],
              isAnalyte: 1,
              isCompleteDefinitionAnalysis: 'Sans objet',
              detectionLimit: getCompetence(ssd2Code, analyteReference)
                ?.detectionLimit,
              quantificationLimit: getCompetence(ssd2Code, analyteReference)
                ?.quantificationLimit,
              analyticalMethod: getCompetence(ssd2Code, analyteReference)
                ?.analyticalMethod,
              validationMethod: getCompetence(ssd2Code, analyteReference)
                ?.validationMethod,
              analysisMethodMono:
                getCompetence(ssd2Code, analyteReference)?.analysisMethod ===
                'Mono'
                  ? 1
                  : null,
              analysisMethodMulti:
                getCompetence(ssd2Code, analyteReference)?.analysisMethod ===
                'Multi'
                  ? 1
                  : null
            })
          )
        ])
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
  generatePrescriptionsExportExcel,
  generateLaboratoryAnalyticCompetencesExportExcel
};
