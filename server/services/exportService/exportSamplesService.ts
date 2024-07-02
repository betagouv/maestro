import { format } from 'date-fns';
import exceljs from 'exceljs';
import highland from 'highland';
import { CultureKindLabels } from '../../../shared/referential/CultureKind';
import { LegalContextLabels } from '../../../shared/referential/LegalContext';
import { MatrixLabels } from '../../../shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from '../../../shared/referential/MatrixPart';
import { StageLabels } from '../../../shared/referential/Stage';
import { PartialSample } from '../../../shared/schema/Sample/Sample';
import { SampleItemRecipientKindLabels } from '../../../shared/schema/Sample/SampleItemRecipientKind';
import laboratoryRepository from '../../repositories/laboratoryRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';
import sampleItemRepository from '../../repositories/sampleItemRepository';
import WorkbookWriter = exceljs.stream.xlsx.WorkbookWriter;

const writeToWorkbook = async (
  samples: PartialSample[],
  workbook: WorkbookWriter
) => {
  const programmingPlans = await programmingPlanRepository.findMany({});

  const laboratories = await laboratoryRepository.findMany();

  const worksheet = workbook.addWorksheet('Prélèvements');
  worksheet.columns = [
    { header: 'Référence', key: 'reference' },
    { header: 'Département', key: 'department' },
    { header: 'Préleveur', key: 'sampler' },
    { header: 'Date et heure', key: 'sampledAt' },
    { header: 'Latitude', key: 'latitude' },
    { header: 'Longitude', key: 'longitude' },
    { header: 'Parcelle', key: 'parcel' },
    { header: 'Contexte', key: 'programmingPlan' },
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
          key: `quantity_${itemNumber}`,
        },
        {
          header: `Echantillon ${itemNumber} \n Numéro de scellé`,
          key: `sealId_${itemNumber}`,
        },
        {
          header: `Echantillon ${itemNumber} \n Destinataire`,
          key: `recipient_${itemNumber}`,
        },
        {
          header: `Echantillon ${itemNumber} \n Respect directive 2002/63`,
          key: `compliance200263_${itemNumber}`,
        },
      ])
      .flat(),
    { header: 'Notes sur les échantillons', key: 'notesOnItems' },
  ];

  highland(samples)
    .flatMap((sample) =>
      highland(
        sampleItemRepository
          .findMany(sample.id)
          .then((items) => ({ sample, items }))
      )
    )
    .tap(({ sample, items }) => {
      worksheet
        .addRow({
          reference: sample.reference,
          department: sample.department,
          sampler: `${sample.sampler.firstName} ${sample.sampler.lastName}`,
          sampledAt: format(sample.sampledAt, 'dd/MM/yyyy HH:mm'),
          latitude: sample.geolocation.x,
          longitude: sample.geolocation.y,
          parcel: sample.parcel,
          programmingPlan: programmingPlans.find(
            (plan) => plan.id === sample.programmingPlanId
          )?.title,
          legalContext: LegalContextLabels[sample.legalContext],
          company: sample.company.name,
          companyAddress: [
            sample.company.address,
            [sample.company.postalCode, sample.company.city].join(' '),
          ].join('\n'),
          companySiret: sample.company.siret,
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
          quantity_1: 'toto',
          ...items.reduce(
            (acc, item, index) => ({
              ...acc,
              [`quantity_${
                index + 1
              }`]: `${item.quantity} ${item.quantityUnit}`,
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
                : 'Non',
            }),
            {}
          ),
        })
        .commit();
    })
    .done(() => {
      workbook.commit();
    });
};

export default {
  writeToWorkbook,
};
