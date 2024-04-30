import { v4 as uuidv4 } from 'uuid';
import { genSample } from '../../../test/testFixtures';
import { Sample } from '../../Sample/Sample';
import { Prescription } from '../Prescription';
import {
  completionRate,
  genPrescriptionByMatrix,
  PrescriptionByMatrix,
} from '../PrescriptionsByMatrix';

describe('PrescriptionsByMatrix', () => {
  describe('genPrescriptionByMatrix', () => {
    it('should generate the prescription by matrix', () => {
      const prescriptions: Prescription[] = [
        {
          id: '1',
          programmingPlanId: '1',
          sampleMatrix: 'A',
          sampleStage: 'Avant récolte',
          region: '44',
          sampleCount: 1,
        },
        {
          id: '2',
          programmingPlanId: '1',
          sampleMatrix: 'A',
          sampleStage: 'Avant récolte',
          region: '53',
          sampleCount: 2,
        },
        {
          id: '3',
          programmingPlanId: '1',
          sampleMatrix: 'B',
          sampleStage: 'Avant récolte',
          region: '01',
          sampleCount: 3,
        },
        {
          id: '4',
          programmingPlanId: '1',
          sampleMatrix: 'A',
          sampleStage: 'Stockage',
          region: '94',
          sampleCount: 4,
        },
        {
          id: '5',
          programmingPlanId: '2',
          sampleMatrix: 'A',
          sampleStage: 'Avant récolte',
          region: '27',
          sampleCount: 5,
        },
      ];

      const samples: Sample[] = [
        {
          ...genSample(uuidv4(), '1'),
          matrix: 'A',
          stage: 'Avant récolte',
          department: '52',
        },
      ];

      const result = genPrescriptionByMatrix(prescriptions, samples);

      expect(result).toEqual([
        {
          programmingPlanId: '1',
          sampleMatrix: 'A',
          sampleStage: 'Avant récolte',
          regionalData: [
            { sampleCount: 0, sentSampleCount: 0, region: '84' },
            { sampleCount: 0, sentSampleCount: 0, region: '27' },
            { sampleCount: 2, sentSampleCount: 0, region: '53' },
            { sampleCount: 0, sentSampleCount: 0, region: '24' },
            { sampleCount: 0, sentSampleCount: 0, region: '94' },
            { sampleCount: 1, sentSampleCount: 1, region: '44' },
            { sampleCount: 0, sentSampleCount: 0, region: '32' },
            { sampleCount: 0, sentSampleCount: 0, region: '11' },
            { sampleCount: 0, sentSampleCount: 0, region: '28' },
            { sampleCount: 0, sentSampleCount: 0, region: '75' },
            { sampleCount: 0, sentSampleCount: 0, region: '76' },
            { sampleCount: 0, sentSampleCount: 0, region: '52' },
            { sampleCount: 0, sentSampleCount: 0, region: '93' },
            { sampleCount: 0, sentSampleCount: 0, region: '01' },
            { sampleCount: 0, sentSampleCount: 0, region: '02' },
            { sampleCount: 0, sentSampleCount: 0, region: '03' },
            { sampleCount: 0, sentSampleCount: 0, region: '04' },
            { sampleCount: 0, sentSampleCount: 0, region: '06' },
          ],
        },
        {
          programmingPlanId: '1',
          sampleMatrix: 'A',
          sampleStage: 'Stockage',
          regionalData: [
            { sampleCount: 0, sentSampleCount: 0, region: '84' },
            { sampleCount: 0, sentSampleCount: 0, region: '27' },
            { sampleCount: 0, sentSampleCount: 0, region: '53' },
            { sampleCount: 0, sentSampleCount: 0, region: '24' },
            { sampleCount: 4, sentSampleCount: 0, region: '94' },
            { sampleCount: 0, sentSampleCount: 0, region: '44' },
            { sampleCount: 0, sentSampleCount: 0, region: '32' },
            { sampleCount: 0, sentSampleCount: 0, region: '11' },
            { sampleCount: 0, sentSampleCount: 0, region: '28' },
            { sampleCount: 0, sentSampleCount: 0, region: '75' },
            { sampleCount: 0, sentSampleCount: 0, region: '76' },
            { sampleCount: 0, sentSampleCount: 0, region: '52' },
            { sampleCount: 0, sentSampleCount: 0, region: '93' },
            { sampleCount: 0, sentSampleCount: 0, region: '01' },
            { sampleCount: 0, sentSampleCount: 0, region: '02' },
            { sampleCount: 0, sentSampleCount: 0, region: '03' },
            { sampleCount: 0, sentSampleCount: 0, region: '04' },
            { sampleCount: 0, sentSampleCount: 0, region: '06' },
          ],
        },
        {
          programmingPlanId: '1',
          sampleMatrix: 'B',
          sampleStage: 'Avant récolte',
          regionalData: [
            { sampleCount: 0, sentSampleCount: 0, region: '84' },
            { sampleCount: 0, sentSampleCount: 0, region: '27' },
            { sampleCount: 0, sentSampleCount: 0, region: '53' },
            { sampleCount: 0, sentSampleCount: 0, region: '24' },
            { sampleCount: 0, sentSampleCount: 0, region: '94' },
            { sampleCount: 0, sentSampleCount: 0, region: '44' },
            { sampleCount: 0, sentSampleCount: 0, region: '32' },
            { sampleCount: 0, sentSampleCount: 0, region: '11' },
            { sampleCount: 0, sentSampleCount: 0, region: '28' },
            { sampleCount: 0, sentSampleCount: 0, region: '75' },
            { sampleCount: 0, sentSampleCount: 0, region: '76' },
            { sampleCount: 0, sentSampleCount: 0, region: '52' },
            { sampleCount: 0, sentSampleCount: 0, region: '93' },
            { sampleCount: 3, sentSampleCount: 0, region: '01' },
            { sampleCount: 0, sentSampleCount: 0, region: '02' },
            { sampleCount: 0, sentSampleCount: 0, region: '03' },
            { sampleCount: 0, sentSampleCount: 0, region: '04' },
            { sampleCount: 0, sentSampleCount: 0, region: '06' },
          ],
        },
        {
          programmingPlanId: '2',
          sampleMatrix: 'A',
          sampleStage: 'Avant récolte',
          regionalData: [
            { sampleCount: 0, sentSampleCount: 0, region: '84' },
            { sampleCount: 5, sentSampleCount: 0, region: '27' },
            { sampleCount: 0, sentSampleCount: 0, region: '53' },
            { sampleCount: 0, sentSampleCount: 0, region: '24' },
            { sampleCount: 0, sentSampleCount: 0, region: '94' },
            { sampleCount: 0, sentSampleCount: 0, region: '44' },
            { sampleCount: 0, sentSampleCount: 0, region: '32' },
            { sampleCount: 0, sentSampleCount: 0, region: '11' },
            { sampleCount: 0, sentSampleCount: 0, region: '28' },
            { sampleCount: 0, sentSampleCount: 0, region: '75' },
            { sampleCount: 0, sentSampleCount: 0, region: '76' },
            { sampleCount: 0, sentSampleCount: 0, region: '52' },
            { sampleCount: 0, sentSampleCount: 0, region: '93' },
            { sampleCount: 0, sentSampleCount: 0, region: '01' },
            { sampleCount: 0, sentSampleCount: 0, region: '02' },
            { sampleCount: 0, sentSampleCount: 0, region: '03' },
            { sampleCount: 0, sentSampleCount: 0, region: '04' },
            { sampleCount: 0, sentSampleCount: 0, region: '06' },
          ],
        },
      ]);
    });
  });

  describe('completionRate', () => {
    it('should return the completion rate for a region', () => {
      const prescriptionMatrix: PrescriptionByMatrix = {
        programmingPlanId: '1',
        sampleMatrix: 'A',
        sampleStage: 'Avant récolte',
        regionalData: [{ sampleCount: 5, sentSampleCount: 3, region: '84' }],
      };

      const result = completionRate(prescriptionMatrix, '84');
      expect(result).toEqual(60);
    });

    it('should limit the rate to 100', () => {
      const prescriptionMatrix: PrescriptionByMatrix = {
        programmingPlanId: '1',
        sampleMatrix: 'A',
        sampleStage: 'Avant récolte',
        regionalData: [{ sampleCount: 5, sentSampleCount: 6, region: '84' }],
      };

      const result = completionRate(prescriptionMatrix, '84');
      expect(result).toEqual(100);
    });

    it('should return 100 if sampleCount is 0', () => {
      const prescriptionMatrix: PrescriptionByMatrix = {
        programmingPlanId: '1',
        sampleMatrix: 'A',
        sampleStage: 'Avant récolte',
        regionalData: [{ sampleCount: 0, sentSampleCount: 0, region: '84' }],
      };

      const result = completionRate(prescriptionMatrix, '84');
      expect(result).toEqual(100);
    });
  });

  it('should return the total completion rate for a prescription', () => {
    const prescriptionMatrix: PrescriptionByMatrix = {
      programmingPlanId: '1',
      sampleMatrix: 'A',
      sampleStage: 'Avant récolte',
      regionalData: [
        { sampleCount: 5, sentSampleCount: 3, region: '84' },
        { sampleCount: 5, sentSampleCount: 6, region: '27' },
        { sampleCount: 0, sentSampleCount: 0, region: '53' },
      ],
    };

    const result = completionRate(prescriptionMatrix);
    expect(result).toEqual(80);
  });

  it('should return the total completion rate for a prescription array', () => {
    const prescriptionMatrix: PrescriptionByMatrix[] = [
      {
        programmingPlanId: '1',
        sampleMatrix: 'A',
        sampleStage: 'Avant récolte',
        regionalData: [
          { sampleCount: 5, sentSampleCount: 3, region: '84' },
          { sampleCount: 5, sentSampleCount: 6, region: '27' },
          { sampleCount: 0, sentSampleCount: 0, region: '53' },
        ],
      },
      {
        programmingPlanId: '1',
        sampleMatrix: 'A',
        sampleStage: 'Stockage',
        regionalData: [
          { sampleCount: 10, sentSampleCount: 1, region: '84' },
          { sampleCount: 6, sentSampleCount: 8, region: '27' },
          { sampleCount: 0, sentSampleCount: 2, region: '53' },
        ],
      },
    ];

    const result = completionRate(prescriptionMatrix);
    expect(result).toEqual(57.69);
  });
});
