import { Prescription } from '../Prescription';
import { genPrescriptionByMatrix } from '../PrescriptionsByMatrix';

describe('PrescriptionsByMatrix', () => {
  describe('genPrescriptionByMatrix', () => {
    it('should generate the prescription by matrix', () => {
      const prescriptions: Prescription[] = [
        {
          id: '1',
          programmingPlanId: '1',
          sampleMatrix: 'A',
          sampleStage: 'Avant récolte',
          region: 'ARA',
          sampleCount: 1,
        },
        {
          id: '2',
          programmingPlanId: '1',
          sampleMatrix: 'A',
          sampleStage: 'Avant récolte',
          region: 'BRE',
          sampleCount: 2,
        },
        {
          id: '3',
          programmingPlanId: '1',
          sampleMatrix: 'B',
          sampleStage: 'Avant récolte',
          region: 'GUA',
          sampleCount: 3,
        },
        {
          id: '4',
          programmingPlanId: '1',
          sampleMatrix: 'A',
          sampleStage: 'Stockage',
          region: 'COR',
          sampleCount: 4,
        },
        {
          id: '5',
          programmingPlanId: '2',
          sampleMatrix: 'A',
          sampleStage: 'Avant récolte',
          region: 'BFC',
          sampleCount: 5,
        },
      ];
      const result = genPrescriptionByMatrix(prescriptions);

      expect(result).toEqual([
        {
          programmingPlanId: '1',
          sampleMatrix: 'A',
          sampleStage: 'Avant récolte',
          regionSampleCounts: [
            1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          ],
        },
        {
          programmingPlanId: '1',
          sampleMatrix: 'B',
          sampleStage: 'Avant récolte',
          regionSampleCounts: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0,
          ],
        },
        {
          programmingPlanId: '1',
          sampleMatrix: 'A',
          sampleStage: 'Stockage',
          regionSampleCounts: [
            0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          ],
        },
        {
          programmingPlanId: '2',
          sampleMatrix: 'A',
          sampleStage: 'Avant récolte',
          regionSampleCounts: [
            0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          ],
        },
      ]);
    });
  });
});
