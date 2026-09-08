import XLSX from '@e965/xlsx';
import { isNil, sumBy } from 'lodash-es';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import { SlaughterhouseCompanyFixture1 } from 'maestro-shared/test/companyFixtures';
import {
  FoieDeBovinLocalPrescriptionFixture,
  FoieDeBovinPrescriptionFixture,
  VolailleLocalPrescriptionFixture,
  VolaillePrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import { DAOAInProgressProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import { describe, expect, test, vi } from 'vitest';
import { excelService } from './excelService';

vi.mock('../../repositories/laboratoryRepository', () => ({
  laboratoryRepository: {
    findMany: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('../../repositories/companyRepository', () => ({
  default: {
    findMany: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('../../repositories/programmingPlanDomainRepository', () => ({
  programmingPlanDomainRepository: {
    findMany: vi.fn().mockResolvedValue([])
  }
}));

const prescriptions = [
  FoieDeBovinPrescriptionFixture,
  VolaillePrescriptionFixture
];

const localPrescriptions = [
  ...FoieDeBovinLocalPrescriptionFixture,
  ...VolailleLocalPrescriptionFixture
].map((_) => ({
  ..._,
  sampleCount: _.department
    ? sumBy(_.department.split(''), (s) => Number(s))
    : _.sampleCount //to avoid zeros for test snapshot
}));

describe('generatePrescriptionsExportExcel', async () => {
  test('export prescription for national coordinator', async () => {
    const buffer = await excelService.generatePrescriptionsExportExcel(
      [DAOAInProgressProgrammingPlanFixture],
      prescriptions,
      localPrescriptions.filter((_) => isNil(_.department)),
      undefined,
      undefined
    );

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    worksheet['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: prescriptions.length + 1, c: RegionList.length + 7 }
    });

    const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });

    expect(csv.toString()).toMatchInlineSnapshot(`
      "N°;Domaine;Plan;Contexte;Matrice;Stade(s) de prélèvement;Consignes de répartition;Notes;Total national Programmés;"Région ARA
      Programmés";"Région BFC
      Programmés";"Région BRE
      Programmés";"Région COR
      Programmés";"Région CVL
      Programmés";"Région GES
      Programmés";"Région GUA
      Programmés";"Région GUY
      Programmés";"Région HDF
      Programmés";"Région IDF
      Programmés";"Région MAR
      Programmés";"Région MYT
      Programmés";"Région NAQ
      Programmés";"Région NOR
      Programmés";"Région OCC
      Programmés";"Région PAC
      Programmés";"Région PDL
      Programmés"
      M02;;Produit carné à l'abattoir;Plan de surveillance;Foie de bovin non transformé;Abattoir;Instructions pour le foie de bovin;Prescription pour le foie de bovin;80;3;2;5;8;10;1;2;10;3;3;2;9;4;4;2;1;5
      M01;;Produit carné à l'abattoir;Plan de surveillance;Viande de volaille;Abattoir;;;77;2;3;8;1;9;1;11;3;2;1;1;4;6;1;5;6;3
      ;;;;Total;;;;157;5;5;13;9;19;2;13;13;5;4;3;13;10;5;7;7;8"
    `);
  });

  test('export prescription for regional coordinator', async () => {
    const regionPDL = '52';
    const buffer = await excelService.generatePrescriptionsExportExcel(
      [DAOAInProgressProgrammingPlanFixture],
      prescriptions,
      localPrescriptions.filter((_) => _.region === regionPDL),
      regionPDL,
      undefined
    );

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    worksheet['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: {
        r: prescriptions.length + 1,
        c: Regions[regionPDL].departments.length * 4 + 7
      }
    });

    const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });

    expect(csv.toString()).toMatchInlineSnapshot(`
      "N°;Domaine;Plan;Contexte;Matrice;Stade(s) de prélèvement;Consignes de répartition;Notes;"Région PDL
      Programmés";"Département 44
      Programmés";"Département 44
      Laboratoire mono-résidu";"Département 44
      Laboratoire multi-résidus";"Département 44
      Laboratoire cuivre";"Département 49
      Programmés";"Département 49
      Laboratoire mono-résidu";"Département 49
      Laboratoire multi-résidus";"Département 49
      Laboratoire cuivre";"Département 53
      Programmés";"Département 53
      Laboratoire mono-résidu";"Département 53
      Laboratoire multi-résidus";"Département 53
      Laboratoire cuivre";"Département 72
      Programmés";"Département 72
      Laboratoire mono-résidu";"Département 72
      Laboratoire multi-résidus";"Département 72
      Laboratoire cuivre";"Département 85
      Programmés";"Département 85
      Laboratoire mono-résidu";"Département 85
      Laboratoire multi-résidus"
      M02;;Produit carné à l'abattoir;Plan de surveillance;Foie de bovin non transformé;Abattoir;Instructions pour le foie de bovin;Prescription pour le foie de bovin;5;8;;;;13;;;;8;;;;9;;;;13;;
      M01;;Produit carné à l'abattoir;Plan de surveillance;Viande de volaille;Abattoir;;;3;8;;;;13;;;;8;;;;9;;;;13;;
      ;;;;Total;;;;8;16;;;;26;;;;16;;;;18;;;;26;;"
    `);
  });

  test('export prescription for departmental coordinator', async () => {
    const regionPDL = '52';
    const department = '85';
    const buffer = await excelService.generatePrescriptionsExportExcel(
      [DAOAInProgressProgrammingPlanFixture],
      prescriptions,
      localPrescriptions
        .filter((_) => _.region === regionPDL && _.department === department)
        .flatMap((localPrescription) => [
          localPrescription,
          {
            ...localPrescription,
            sampleCount: Math.ceil(localPrescription.sampleCount / 2),
            companySiret: SlaughterhouseCompanyFixture1.siret
          }
        ]),
      regionPDL,
      department
    );

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    worksheet['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: {
        r: prescriptions.length + 1,
        c: 8
      }
    });

    const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });

    expect(csv.toString()).toMatchInlineSnapshot(`
      "N°;Domaine;Plan;Contexte;Matrice;Stade(s) de prélèvement;Consignes de répartition;Notes;"Département 85
      Programmés"
      M02;;Produit carné à l'abattoir;Plan de surveillance;Foie de bovin non transformé;Abattoir;Instructions pour le foie de bovin;Prescription pour le foie de bovin;13
      M01;;Produit carné à l'abattoir;Plan de surveillance;Viande de volaille;Abattoir;;;13
      ;;;;Total;;;;40"
    `);
  });
});
