import { v4 as uuidv4 } from 'uuid';
import { genSample } from '../../../test/testFixtures';
import { Sample } from '../../Sample/Sample';
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
          matrix: 'A000L',
          stages: ['STADE2'],
          region: '44',
          sampleCount: 1,
        },
        {
          id: '2',
          programmingPlanId: '1',
          matrix: 'A000L',
          stages: ['STADE2'],
          region: '53',
          sampleCount: 2,
        },
        {
          id: '3',
          programmingPlanId: '1',
          matrix: 'A001X',
          stages: ['STADE2'],
          region: '01',
          sampleCount: 3,
        },
        {
          id: '4',
          programmingPlanId: '1',
          matrix: 'A000L',
          stages: ['STADE3'],
          region: '94',
          sampleCount: 4,
        },
        {
          id: '5',
          programmingPlanId: '2',
          matrix: 'A000L',
          stages: ['STADE2'],
          region: '27',
          sampleCount: 5,
        },
      ];

      const samples: Sample[] = [
        {
          ...genSample(uuidv4(), '1'),
          matrix: 'A000L',
          stage: 'STADE2',
          department: '52',
        },
      ];

      const result = genPrescriptionByMatrix(prescriptions, samples);

      expect(result).toEqual([
        {
          programmingPlanId: '1',
          matrix: 'A000L',
          stages: ['STADE3'],
          regionalData: [
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '84',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '27',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '53',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '24',
              laboratoryId: undefined,
            },
            {
              sampleCount: 4,
              sentSampleCount: 0,
              region: '94',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '44',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '32',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '11',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '28',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '75',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '76',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '52',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '93',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '01',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '02',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '03',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '04',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '06',
              laboratoryId: undefined,
            },
          ],
        },
        {
          programmingPlanId: '1',
          matrix: 'A000L',
          stages: ['STADE2'],
          regionalData: [
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '84',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '27',
              laboratoryId: undefined,
            },
            {
              sampleCount: 2,
              sentSampleCount: 0,
              region: '53',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '24',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '94',
              laboratoryId: undefined,
            },
            {
              sampleCount: 1,
              sentSampleCount: 1,
              region: '44',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '32',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '11',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '28',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '75',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '76',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '52',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '93',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '01',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '02',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '03',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '04',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '06',
              laboratoryId: undefined,
            },
          ],
        },
        {
          programmingPlanId: '1',
          matrix: 'A001X',
          stages: ['STADE2'],
          regionalData: [
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '84',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '27',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '53',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '24',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '94',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '44',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '32',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '11',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '28',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '75',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '76',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '52',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '93',
              laboratoryId: undefined,
            },
            {
              sampleCount: 3,
              sentSampleCount: 0,
              region: '01',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '02',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '03',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '04',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '06',
              laboratoryId: undefined,
            },
          ],
        },
        {
          programmingPlanId: '2',
          matrix: 'A000L',
          stages: ['STADE2'],
          regionalData: [
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '84',
              laboratoryId: undefined,
            },
            {
              sampleCount: 5,
              sentSampleCount: 0,
              region: '27',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '53',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '24',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '94',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '44',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '32',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '11',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '28',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '75',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '76',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '52',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '93',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '01',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '02',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '03',
              laboratoryId: undefined,
            },
            {
              sampleCount: 0,
              sentSampleCount: 0,
              region: '04',
              laboratoryId: undefined,
            },
            {
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
        matrix: 'A000L',
        stages: ['STADE2'],
        regionalData: [{ sampleCount: 5, sentSampleCount: 3, region: '84' }],
      };

      const result = matrixCompletionRate(prescriptionMatrix, '84');
      expect(result).toEqual(60);
    });

    it('should limit the rate to 100', () => {
      const prescriptionMatrix: PrescriptionByMatrix = {
        programmingPlanId: '1',
        matrix: 'A000L',
        stages: ['STADE2'],
        regionalData: [{ sampleCount: 5, sentSampleCount: 6, region: '84' }],
      };

      const result = matrixCompletionRate(prescriptionMatrix, '84');
      expect(result).toEqual(100);
    });

    it('should return 100 if sampleCount is 0', () => {
      const prescriptionMatrix: PrescriptionByMatrix = {
        programmingPlanId: '1',
        matrix: 'A000L',
        stages: ['STADE2'],
        regionalData: [{ sampleCount: 0, sentSampleCount: 0, region: '84' }],
      };

      const result = matrixCompletionRate(prescriptionMatrix, '84');
      expect(result).toEqual(100);
    });
  });

  it('should return the total completion rate for a prescription', () => {
    const prescriptionMatrix: PrescriptionByMatrix = {
      programmingPlanId: '1',
      matrix: 'A000L',
      stages: ['STADE2'],
      regionalData: [
        {
          sampleCount: 5,
          sentSampleCount: 3,
          region: '84',
          laboratoryId: undefined,
        },
        {
          sampleCount: 5,
          sentSampleCount: 6,
          region: '27',
          laboratoryId: undefined,
        },
        {
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
        matrix: 'A000L',
        stages: ['STADE2'],
        regionalData: [
          {
            sampleCount: 5,
            sentSampleCount: 3,
            region: '84',
            laboratoryId: undefined,
          },
          {
            sampleCount: 5,
            sentSampleCount: 6,
            region: '27',
            laboratoryId: undefined,
          },
          {
            sampleCount: 0,
            sentSampleCount: 0,
            region: '53',
            laboratoryId: undefined,
          },
        ],
      },
      {
        programmingPlanId: '1',
        matrix: 'A000L',
        stages: ['STADE3'],
        regionalData: [
          {
            sampleCount: 10,
            sentSampleCount: 1,
            region: '84',
            laboratoryId: undefined,
          },
          {
            sampleCount: 6,
            sentSampleCount: 8,
            region: '27',
            laboratoryId: undefined,
          },
          {
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
