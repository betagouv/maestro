import { AnalysisRequestData } from 'maestro-shared/schema/Analysis/AnalysisRequestData';

const escapeCsvValue = (value: any) => {
  if (value === undefined || value === null) return '';
  const str = String(value).replace(/"/g, '""');
  if (str.includes('\n') || str.includes(',') || str.includes(';')) {
    return `"${str}"`;
  }
  return str;
};

const generateAnalysisRequestCsv = async (data: AnalysisRequestData) => {
  const rows = [
    `Donneur d'ordre;${escapeCsvValue(data.establishment.name)}`,
    `Adresse;${escapeCsvValue(data.establishment.fullAddress)}`,
    `Préleveur;${escapeCsvValue(data.sampler.firstName)} ${escapeCsvValue(data.sampler.lastName)}`,
    `Email;${escapeCsvValue(data.sampler.email)}`,
    `Date de prélèvement;${escapeCsvValue(data.sampledAtDate)}`,
    `Heure de prélèvement;${escapeCsvValue(data.sampledAtTime)}`,
    `Numéro de prélèvement;${escapeCsvValue(data.reference)}`,
    `Contexte du prélèvement;${escapeCsvValue(data.context)}`,
    `Cadre juridique;${escapeCsvValue(data.legalContext)}`,
    `Entité contrôlée;${escapeCsvValue(data.company.name)}`,
    `Siret;${escapeCsvValue(data.company.siret)}`,
    `Identifiant Resytal;${escapeCsvValue(data.resytalId)}`,
    `Département;${escapeCsvValue(data.department)}`,
    `Adresse;${escapeCsvValue(data.company.fullAddress)}`,
    `N° ou appellation de la parcelle;${escapeCsvValue(data.parcel)}`,
    `Note additionnelle;${escapeCsvValue(data.notesOnCreation)}`,
    `Catégorie de matrice programmée;${escapeCsvValue(data.matrixKindLabel)};${escapeCsvValue(data.matrixKind)}`,
    `Matrice;${escapeCsvValue(data.matrixLabel)};${escapeCsvValue(data.matrix)}`,
    `LMR/ Partie du végétal concernée;${escapeCsvValue(data.matrixPart)}`,
    `Détails de la matrice;${escapeCsvValue(
      data.specificData?.programmingPlanKind === 'PPV'
        ? data.specificData?.matrixDetails
        : undefined
    )}`,
    `Type de culture;${escapeCsvValue(data.cultureKind)}`,
    `Stade de prélèvement;${escapeCsvValue(data.stage)}`,
    `${data.specificData?.programmingPlanKind === 'PPV' && data.specificData?.releaseControl ? 'Type de contrôle;Contrôle libératoire' : ''}`,
    `Laboratoire destinataire;${escapeCsvValue(data.laboratory?.name)}`,
    `Analyses mono-résidu;${data.monoSubstances?.map((substance) => `${substance.label}`).join(';')}`,
    `Analyses multi-résidus dont;${data.multiSubstances?.map((substance) => `${substance.label}`).join(';')}`,
    `Note additionnelle;${escapeCsvValue(data.notesOnMatrix)}`,
    `Échantillon n°;${escapeCsvValue(data.itemNumber)}`,
    `Nombre;${escapeCsvValue(data.quantity)}`,
    `Unité de mesure;${escapeCsvValue(data.quantityUnit)}`,
    `Numéro de scellé;${escapeCsvValue(data.sealId)}`,
    `Directive 2002/63;${data.compliance200263 ? 'Respectée' : 'Non respectée'}`,
    `Note;${escapeCsvValue(data.notesOnItems)}`
  ];

  const csvContent = rows.join('\n');
  return Buffer.from(csvContent, 'utf-8');
};

export default {
  generateAnalysisRequestCsv
};
