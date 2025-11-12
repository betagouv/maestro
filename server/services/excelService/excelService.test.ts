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
import { describe, expect, test } from 'vitest';
import XLSX from 'xlsx';
import { excelService } from './excelService';

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
      DAOAInProgressProgrammingPlanFixture,
      prescriptions,
      localPrescriptions.filter((_) => isNil(_.department)),
      undefined,
      undefined
    );

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    worksheet['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: prescriptions.length + 1, c: (RegionList.length + 1) * 3 + 1 }
    });

    const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });

    expect(csv.toString()).toMatchInlineSnapshot(`
"Matrice;Stade(s) de prélèvement;Total national Programmés;Total national Réalisés;Total national Taux de réalisation;Région ARA - Programmés;Région ARA - Réalisés;Région ARA - Taux de réalisation;Région BFC - Programmés;Région BFC - Réalisés;Région BFC - Taux de réalisation;Région BRE - Programmés;Région BRE - Réalisés;Région BRE - Taux de réalisation;Région CVL - Programmés;Région CVL - Réalisés;Région CVL - Taux de réalisation;Région COR - Programmés;Région COR - Réalisés;Région COR - Taux de réalisation;Région GES - Programmés;Région GES - Réalisés;Région GES - Taux de réalisation;Région GUA - Programmés;Région GUA - Réalisés;Région GUA - Taux de réalisation;Région GUY - Programmés;Région GUY - Réalisés;Région GUY - Taux de réalisation;Région HDF - Programmés;Région HDF - Réalisés;Région HDF - Taux de réalisation;Région IDF - Programmés;Région IDF - Réalisés;Région IDF - Taux de réalisation;Région REU - Programmés;Région REU - Réalisés;Région REU - Taux de réalisation;Région MAR - Programmés;Région MAR - Réalisés;Région MAR - Taux de réalisation;Région MYT - Programmés;Région MYT - Réalisés;Région MYT - Taux de réalisation;Région NOR - Programmés;Région NOR - Réalisés;Région NOR - Taux de réalisation;Région NAQ - Programmés;Région NAQ - Réalisés;Région NAQ - Taux de réalisation;Région OCC - Programmés;Région OCC - Réalisés;Région OCC - Taux de réalisation;Région PDL - Programmés;Région PDL - Réalisés;Région PDL - Taux de réalisation;Région PAC - Programmés;Région PAC - Réalisés;Région PAC - Taux de réalisation
Chair de volaille;Abattoir;77;0;0;2;0;0;3;0;0;8;0;0;1;0;0;9;0;0;1;0;0;11;0;0;3;0;0;2;0;0;1;0;0;1;0;0;4;0;0;6;0;0;1;0;0;5;0;0;6;0;0;3;0;0;10;0;0
Foie de bovin;Abattoir;80;0;0;3;0;0;2;0;0;5;0;0;8;0;0;10;0;0;1;0;0;2;0;0;10;0;0;3;0;0;3;0;0;2;0;0;9;0;0;4;0;0;4;0;0;2;0;0;1;0;0;5;0;0;6;0;0
Total;;157;;0;5;;0;5;;0;13;;0;9;;0;19;;0;2;;0;13;;0;13;;0;5;;0;4;;0;3;;0;13;;0;10;;0;5;;0;7;;0;7;;0;8;;0;16;;0"
     `);
  });

  test('export prescription for regional coordinator', async () => {
    const regionPDL = '52';
    const buffer = await excelService.generatePrescriptionsExportExcel(
      DAOAInProgressProgrammingPlanFixture,
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
        c: (Regions[regionPDL].departments.length + 1) * 3 + 1
      }
    });

    const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });

    expect(csv.toString()).toMatchInlineSnapshot(`
"Matrice;Stade(s) de prélèvement;Région PDL - Programmés;Région PDL - Réalisés;Région PDL - Taux de réalisation;Département 44 - Programmés;Département 44 - Réalisés;Département 44 - Taux de réalisation;Département 49 - Programmés;Département 49 - Réalisés;Département 49 - Taux de réalisation;Département 53 - Programmés;Département 53 - Réalisés;Département 53 - Taux de réalisation;Département 72 - Programmés;Département 72 - Réalisés;Département 72 - Taux de réalisation;Département 85 - Programmés;Département 85 - Réalisés;Département 85 - Taux de réalisation
Chair de volaille;Abattoir;3;0;0;8;0;0;13;0;0;8;0;0;9;0;0;13;0;0
Foie de bovin;Abattoir;5;0;0;8;0;0;13;0;0;8;0;0;9;0;0;13;0;0
Total;;8;;0;16;;0;26;;0;16;;0;18;;0;26;;0"
    `);
  });

  test('export prescription for departmental coordinator', async () => {
    const regionPDL = '52';
    const department = '85';
    const buffer = await excelService.generatePrescriptionsExportExcel(
      DAOAInProgressProgrammingPlanFixture,
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
        c: 4
      }
    });

    const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });

    expect(csv.toString()).toMatchInlineSnapshot(`
      "Matrice;Stade(s) de prélèvement;Département 85 - Programmés;Département 85 - Réalisés;Département 85 - Taux de réalisation
      Chair de volaille;Abattoir;13;0;0
      Foie de bovin;Abattoir;13;0;0
      Total;;26;;0"
    `);
  });
});
