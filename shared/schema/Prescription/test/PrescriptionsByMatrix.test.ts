import { RegionList } from '../../../referential/Region';
import { genCreatedPartialSample } from '../../../test/sampleFixtures';
import { genUser } from '../../../test/userFixtures';
import { PartialSample } from '../../Sample/Sample';
import { Prescription } from '../Prescription';
import {
  genPrescriptionByMatrix,
  matrixCompletionRate,
  PrescriptionByMatrix,
} from '../PrescriptionsByMatrix';

describe('PrescriptionsByMatrix', () => {
  describe('genPrescriptionByMatrix', () => {
    it('should generate the prescription by matrix', () => {
      const prescriptions: Prescription[] = [
        {
          id: '1',
          programmingPlanId: '1',
          context: 'Control',
          matrix: 'A000L',
          stages: ['STADE2'],
          region: '44',
          sampleCount: 1,
        },
        {
          id: '2',
          programmingPlanId: '1',
          context: 'Control',
          matrix: 'A000L',
          stages: ['STADE2'],
          region: '53',
          sampleCount: 2,
        },
        ...RegionList.filter(
          (region) => region !== '44' && region !== '53'
        ).map(
          (region, index) =>
            ({
              id: String(3 + index),
              programmingPlanId: '1',
              context: 'Control',
              matrix: 'A000L',
              stages: ['STADE2'],
              region,
              sampleCount: 0,
            } as Prescription)
        ),
        {
          id: '100',
          programmingPlanId: '1',
          context: 'Control',
          matrix: 'A001X',
          stages: ['STADE2'],
          region: '01',
          sampleCount: 3,
        },
        ...RegionList.filter((region) => region !== '01').map(
          (region, index) =>
            ({
              id: String(101 + index),
              programmingPlanId: '1',
              context: 'Control',
              matrix: 'A001X',
              stages: ['STADE2'],
              region,
              sampleCount: 0,
            } as Prescription)
        ),
        {
          id: '200',
          programmingPlanId: '1',
          context: 'Control',
          matrix: 'A000L',
          stages: ['STADE3'],
          region: '94',
          sampleCount: 4,
        },
        ...RegionList.filter((region) => region !== '94').map(
          (region, index) =>
            ({
              id: String(201 + index),
              programmingPlanId: '1',
              context: 'Control',
              matrix: 'A000L',
              stages: ['STADE3'],
              region,
              sampleCount: 0,
            } as Prescription)
        ),
        {
          id: '300',
          programmingPlanId: '2',
          context: 'Control',
          matrix: 'A000L',
          stages: ['STADE2'],
          region: '27',
          sampleCount: 5,
        },
        ...RegionList.filter((region) => region !== '27').map(
          (region, index) =>
            ({
              id: String(301 + index),
              programmingPlanId: '2',
              context: 'Control',
              matrix: 'A000L',
              stages: ['STADE2'],
              region,
              sampleCount: 0,
            } as Prescription)
        ),
      ];

      const samples: PartialSample[] = [
        genCreatedPartialSample({
          sampler: genUser(),
          programmingPlanId: '1',
          context: 'Control',
          matrix: 'A000L',
          stage: 'STADE2',
          department: '52',
        }),
      ];

      const result = genPrescriptionByMatrix(prescriptions, samples);

      expect(result).toEqual([
        {
          programmingPlanId: '1',
          context: 'Control',
          matrix: 'A000L',
          stages: ['STADE3'],
          regionalData: [
            {
              prescriptionId: '201',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '84',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '202',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '27',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '203',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '53',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '204',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '24',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '200',
              sampleCount: 4,
              sentSampleCount: 0,
              region: '94',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '205',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '44',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '206',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '32',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '207',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '11',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '208',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '28',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '209',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '75',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '210',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '76',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '211',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '52',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '212',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '93',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '213',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '01',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '214',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '02',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '215',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '03',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '216',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '04',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '217',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '06',
              laboratoryId: undefined,
            },
          ],
        },
        {
          programmingPlanId: '1',
          context: 'Control',
          matrix: 'A000L',
          stages: ['STADE2'],
          regionalData: [
            {
              prescriptionId: '3',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '84',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '4',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '27',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '2',
              sampleCount: 2,
              sentSampleCount: 0,
              region: '53',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '5',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '24',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '6',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '94',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '1',
              sampleCount: 1,
              sentSampleCount: 1,
              region: '44',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '7',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '32',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '8',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '11',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '9',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '28',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '10',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '75',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '11',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '76',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '12',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '52',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '13',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '93',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '14',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '01',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '15',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '02',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '16',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '03',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '17',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '04',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '18',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '06',
              laboratoryId: undefined,
            },
          ],
        },
        {
          programmingPlanId: '1',
          context: 'Control',
          matrix: 'A001X',
          stages: ['STADE2'],
          regionalData: [
            {
              prescriptionId: '101',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '84',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '102',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '27',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '103',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '53',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '104',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '24',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '105',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '94',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '106',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '44',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '107',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '32',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '108',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '11',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '109',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '28',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '110',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '75',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '111',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '76',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '112',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '52',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '113',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '93',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '100',
              sampleCount: 3,
              sentSampleCount: 0,
              region: '01',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '114',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '02',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '115',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '03',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '116',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '04',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '117',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '06',
              laboratoryId: undefined,
            },
          ],
        },
        {
          programmingPlanId: '2',
          context: 'Control',
          matrix: 'A000L',
          stages: ['STADE2'],
          regionalData: [
            {
              prescriptionId: '301',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '84',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '300',
              sampleCount: 5,
              sentSampleCount: 0,
              region: '27',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '302',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '53',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '303',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '24',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '304',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '94',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '305',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '44',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '306',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '32',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '307',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '11',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '308',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '28',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '309',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '75',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '310',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '76',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '311',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '52',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '312',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '93',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '313',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '01',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '314',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '02',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '315',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '03',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '316',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '04',
              laboratoryId: undefined,
            },
            {
              prescriptionId: '317',
              sampleCount: 0,
              sentSampleCount: 0,
              region: '06',
              laboratoryId: undefined,
            },
          ],
        },
      ]);
    });
  });

  describe('completionRate', () => {
    it('should return the completion rate for a region', () => {
      const prescriptionMatrix: PrescriptionByMatrix = {
        programmingPlanId: '1',
        context: 'Control',
        matrix: 'A000L',
        stages: ['STADE2'],
        regionalData: [
          {
            prescriptionId: '1',
            sampleCount: 5,
            sentSampleCount: 3,
            region: '84',
          },
        ],
      };

      const result = matrixCompletionRate(prescriptionMatrix, '84');
      expect(result).toEqual(60);
    });

    it('should limit the rate to 100', () => {
      const prescriptionMatrix: PrescriptionByMatrix = {
        programmingPlanId: '1',
        context: 'Control',
        matrix: 'A000L',
        stages: ['STADE2'],
        regionalData: [
          {
            prescriptionId: '1',
            sampleCount: 5,
            sentSampleCount: 6,
            region: '84',
          },
        ],
      };

      const result = matrixCompletionRate(prescriptionMatrix, '84');
      expect(result).toEqual(100);
    });

    it('should return 100 if sampleCount is 0', () => {
      const prescriptionMatrix: PrescriptionByMatrix = {
        programmingPlanId: '1',
        context: 'Control',
        matrix: 'A000L',
        stages: ['STADE2'],
        regionalData: [
          {
            prescriptionId: '1',
            sampleCount: 0,
            sentSampleCount: 0,
            region: '84',
          },
        ],
      };

      const result = matrixCompletionRate(prescriptionMatrix, '84');
      expect(result).toEqual(100);
    });
  });

  it('should return the total completion rate for a prescription', () => {
    const prescriptionMatrix: PrescriptionByMatrix = {
      programmingPlanId: '1',
      context: 'Control',
      matrix: 'A000L',
      stages: ['STADE2'],
      regionalData: [
        {
          prescriptionId: '1',
          sampleCount: 5,
          sentSampleCount: 3,
          region: '84',
          laboratoryId: undefined,
        },
        {
          prescriptionId: '1',
          sampleCount: 5,
          sentSampleCount: 6,
          region: '27',
          laboratoryId: undefined,
        },
        {
          prescriptionId: '1',
          sampleCount: 0,
          sentSampleCount: 0,
          region: '53',
          laboratoryId: undefined,
        },
      ],
    };

    const result = matrixCompletionRate(prescriptionMatrix);
    expect(result).toEqual(80);
  });

  it('should return the total completion rate for a prescription array', () => {
    const prescriptionMatrix: PrescriptionByMatrix[] = [
      {
        programmingPlanId: '1',
        context: 'Control',
        matrix: 'A000L',
        stages: ['STADE2'],
        regionalData: [
          {
            prescriptionId: '1',
            sampleCount: 5,
            sentSampleCount: 3,
            region: '84',
            laboratoryId: undefined,
          },
          {
            prescriptionId: '1',
            sampleCount: 5,
            sentSampleCount: 6,
            region: '27',
            laboratoryId: undefined,
          },
          {
            prescriptionId: '1',
            sampleCount: 0,
            sentSampleCount: 0,
            region: '53',
            laboratoryId: undefined,
          },
        ],
      },
      {
        programmingPlanId: '1',
        context: 'Control',
        matrix: 'A000L',
        stages: ['STADE3'],
        regionalData: [
          {
            prescriptionId: '1',
            sampleCount: 10,
            sentSampleCount: 1,
            region: '84',
            laboratoryId: undefined,
          },
          {
            prescriptionId: '1',
            sampleCount: 6,
            sentSampleCount: 8,
            region: '27',
            laboratoryId: undefined,
          },
          {
            prescriptionId: '1',
            sampleCount: 0,
            sentSampleCount: 2,
            region: '53',
            laboratoryId: undefined,
          },
        ],
      },
    ];

    const result = matrixCompletionRate(prescriptionMatrix);
    expect(result).toEqual(57.69);
  });
});
