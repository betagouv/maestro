import carbone from 'carbone';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { CultureKindLabels } from '../../../shared/referential/CultureKind';
import { DepartmentLabels } from '../../../shared/referential/Department';
import { LegalContextLabels } from '../../../shared/referential/LegalContext';
import { MatrixLabels } from '../../../shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from '../../../shared/referential/MatrixPart';
import { QuantityUnitLabels } from '../../../shared/referential/QuantityUnit';
import { Regions } from '../../../shared/referential/Region';
import { StageLabels } from '../../../shared/referential/Stage';
import { ContextLabels } from '../../../shared/schema/ProgrammingPlan/Context';
import { Sample } from '../../../shared/schema/Sample/Sample';
import { SampleItem } from '../../../shared/schema/Sample/SampleItem';
import { UserInfos } from '../../../shared/schema/User/User';
import { isDefinedAndNotNull } from '../../../shared/utils/utils';
import laboratoryRepository from '../../repositories/laboratoryRepository';
import prescriptionSubstanceRepository from '../../repositories/prescriptionSubstanceRepository';
import { templatePath } from '../../templates/templates';

const generateAnalysisRequestExcel = async (
  sample: Sample,
  sampleItem: SampleItem,
  sampler: UserInfos
) => {
  const laboratory = await laboratoryRepository.findUnique(sample.laboratoryId);

  const prescriptionSubstances = await prescriptionSubstanceRepository.findMany(
    sample.prescriptionId
  );

  const establishment = {
    name: Regions[sample.region].establishment.name,
    fullAddress: [
      Regions[sample.region].establishment.additionalAddress,
      Regions[sample.region].establishment.street,
      `${Regions[sample.region].establishment.postalCode} ${Regions[sample.region].establishment.city}`
    ]
      .filter(Boolean)
      .join('\n')
  };

  const company = {
    ...sample.company,
    fullAddress: [
      sample.company.address,
      `${sample.company.postalCode} ${sample.company.city}`
    ].join('\n')
  };

  const data = {
    ...sample,
    ...sampleItem,
    sampler,
    company,
    laboratory,
    monoSubstances: prescriptionSubstances
      ?.filter((substance) => substance.analysisKind === 'Mono')
      .map((substance) => substance.substance),
    multiSubstances: prescriptionSubstances
      ?.filter((substance) => substance.analysisKind === 'Multi')
      .map((substance) => substance.substance),
    reference: [sample.reference, sampleItem?.itemNumber]
      .filter(isDefinedAndNotNull)
      .join('-'),
    sampledAt: format(sample.sampledAt, "eeee dd MMMM yyyy à HH'h'mm", {
      locale: fr
    }),
    sampledAtDate: format(sample.sampledAt, 'dd/MM/yyyy', { locale: fr }),
    sampledAtTime: format(sample.sampledAt, 'HH:mm', { locale: fr }),
    context: ContextLabels[sample.context],
    legalContext: LegalContextLabels[sample.legalContext],
    stage: StageLabels[sample.stage],
    matrixLabel: MatrixLabels[sample.matrix],
    matrixDetails: sample.matrixDetails,
    matrixPart: MatrixPartLabels[sample.matrixPart],
    quantityUnit: sampleItem?.quantityUnit
      ? QuantityUnitLabels[sampleItem.quantityUnit]
      : '',
    cultureKind: sample.cultureKind
      ? CultureKindLabels[sample.cultureKind]
      : undefined,
    compliance200263: sampleItem
      ? sampleItem.compliance200263
        ? 'Respectée'
        : 'Non respectée'
      : '',
    isSecondSampleItem: sampleItem?.itemNumber === 2,
    establishment,
    department: DepartmentLabels[sample.department]
  };

  return new Promise((resolve, reject) => {
    carbone.render(
      templatePath('analysisRequest'),
      data,
      {
        convertTo: 'xlsx'
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

export default {
  generateAnalysisRequestExcel
};
