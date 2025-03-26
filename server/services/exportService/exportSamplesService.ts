import { format } from 'date-fns';
import exceljs from 'exceljs';
import highland from 'highland';
import { CultureKindLabels } from 'maestro-shared/referential/CultureKind';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from 'maestro-shared/referential/Matrix/MatrixPart';
import { QuantityUnitLabels } from 'maestro-shared/referential/QuantityUnit';
import { StageLabels } from 'maestro-shared/referential/Stage';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { PartialSample } from 'maestro-shared/schema/Sample/Sample';
import { SampleItemRecipientKindLabels } from 'maestro-shared/schema/Sample/SampleItemRecipientKind';
import { SampleStatusLabels } from 'maestro-shared/schema/Sample/SampleStatus';
import { formatWithTz, isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import { analysisRepository } from '../../repositories/analysisRepository';
import laboratoryRepository from '../../repositories/laboratoryRepository';
import sampleItemRepository from '../../repositories/sampleItemRepository';
import workbookUtils from '../../utils/workbookUtils';
import WorkbookWriter = exceljs.stream.xlsx.WorkbookWriter;

const writeToWorkbook = async (
  samples: PartialSample[],
  workbook: WorkbookWriter
) => {
  const laboratories = await laboratoryRepository.findMany();

  const worksheet = workbook.addWorksheet('Prélèvements');
  worksheet.columns = [
    { header: 'Référence', key: 'reference' },
    { header: 'Département', key: 'department' },
    { header: 'Préleveur', key: 'sampler' },
    { header: 'Date de prélèvement', key: 'sampledAt' },
    { header: 'Statut', key: 'status' },
    { header: "Date d'envoi", key: 'sentAt' },
    { header: 'Date de réception', key: 'receivedAt' },
    { header: 'Latitude', key: 'latitude' },
    { header: 'Longitude', key: 'longitude' },
    { header: 'Parcelle', key: 'parcel' },
    { header: 'Contexte', key: 'context' },
    { header: 'Cadre juridique', key: 'legalContext' },
    { header: 'Entité contrôlée', key: 'companyName' },
    { header: 'Adresse', key: 'companyAddress' },
    { header: 'SIRET', key: 'companySiret' },
    { header: 'Identifiant Resytal', key: 'resytalId' },
    { header: 'Notes sur le contexte', key: 'notesOnCreation' },
    { header: 'Matrice', key: 'matrix' },
    { header: 'Détails matrice', key: 'matrixDetails' },
    { header: 'LMR / Partie du végétal concernée', key: 'matrixPart' },
    { header: 'Stade de prélèvement', key: 'stage' },
    { header: 'Type de culture', key: 'cultureKind' },
    { header: 'Contrôle libératoire', key: 'releaseControl' },
    { header: 'Notes sur la matrice', key: 'notesOnMatrix' },
    ...[1, 2, 3]
      .map((itemNumber) => [
        {
          header: `Echantillon ${itemNumber} \n Quantité`,
          key: `quantity_${itemNumber}`
        },
        {
          header: `Echantillon ${itemNumber} \n Unité de mesure`,
          key: `quantityUnit_${itemNumber}`
        },
        {
          header: `Echantillon ${itemNumber} \n Numéro de scellé`,
          key: `sealId_${itemNumber}`
        },
        {
          header: `Echantillon ${itemNumber} \n Destinataire`,
          key: `recipient_${itemNumber}`
        },
        {
          header: `Echantillon ${itemNumber} \n Respect directive 2002/63`,
          key: `compliance200263_${itemNumber}`
        }
      ])
      .flat(),
    { header: 'Notes sur les échantillons', key: 'notesOnItems' },
    { header: 'Notes sur la recevabilité', key: 'notesOnAdmissibility' },
    { header: "Conformité globale de l'échantillon", key: 'compliance' }
  ];

  highland(samples)
    .flatMap((sample) =>
      highland(
        Promise.all([
          sampleItemRepository.findMany(sample.id),
          analysisRepository.findUnique({ sampleId: sample.id })
        ]).then(([items, analysis]) => ({ sample, items, analysis }))
      )
    )
    .tap(({ sample, items, analysis }) => {
      workbookUtils
        .addRowToWorksheet(worksheet, {
          reference: sample.reference,
          department: sample.department,
          sampler: `${sample.sampler.firstName} ${sample.sampler.lastName}`,
          sampledAt: formatWithTz(sample.sampledAt, 'dd/MM/yyyy HH:mm'),
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
          context: ContextLabels[sample.context],
          legalContext: LegalContextLabels[sample.legalContext],
          company: sample.company?.name,
          companyAddress: [
            sample.company?.address,
            [sample.company?.postalCode, sample.company?.city].join(' ')
          ].join('\n'),
          companySiret: sample.company?.siret,
          resytalId: sample.resytalId,
          notesOnCreation: sample.notesOnCreation,
          matrix: sample.matrix ? MatrixLabels[sample.matrix] : undefined,
          matrixDetails: sample.matrixDetails,
          matrixPart: sample.matrixPart
            ? MatrixPartLabels[sample.matrixPart]
            : undefined,
          stage: sample.stage ? StageLabels[sample.stage] : undefined,
          cultureKind: sample.cultureKind
            ? CultureKindLabels[sample.cultureKind]
            : undefined,
          releaseControl: sample.releaseControl ? 'Oui' : 'Non',
          notesOnMatrix: sample.notesOnMatrix,
          ...items.reduce(
            (acc, item, index) => ({
              ...acc,
              [`quantity_${index + 1}`]: item.quantity,
              [`quantityUnit_${index + 1}`]: item.quantityUnit
                ? QuantityUnitLabels[item.quantityUnit]
                : undefined,
              [`sealId_${index + 1}`]: item.sealId,
              [`recipient_${index + 1}`]:
                item.recipientKind &&
                (item.recipientKind === 'Laboratory'
                  ? 'Laboratoire ' +
                    laboratories.find((lab) => lab.id === sample.laboratoryId)
                      ?.name
                  : SampleItemRecipientKindLabels[item.recipientKind]),
              [`compliance200263_${index + 1}`]: item.compliance200263
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
        })
        .commit();
    })
    .done(() => {
      workbook.commit();
    });
};

export default {
  writeToWorkbook
};
