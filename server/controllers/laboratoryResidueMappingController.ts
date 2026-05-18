import { constants } from 'node:http2';
import { laboratoryResidueMappingRepository } from '../repositories/laboratoryResidueMappingRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const laboratoryResidueMappingRouter = {
  '/laboratories/:laboratoryId/residue-mappings': {
    get: async (_, { laboratoryId }) => {
      console.info('Get laboratory residue mappings', laboratoryId);

      const mappings =
        await laboratoryResidueMappingRepository.findByLaboratoryId(
          laboratoryId
        );

      return { status: constants.HTTP_STATUS_OK, response: mappings };
    },
    put: async ({ body }, { laboratoryId }) => {
      console.info(
        'Update laboratory residue mapping',
        laboratoryId,
        body.label
      );

      const mapping = await laboratoryResidueMappingRepository.update({
        laboratoryId,
        label: body.label,
        ssd2Id: body.ssd2Id
      });

      if (mapping.ssd2Id !== null) {
        await laboratoryResidueMappingRepository.applyResidueMapping(
          laboratoryId,
          body.label,
          mapping.ssd2Id
        );
      }

      return { status: constants.HTTP_STATUS_OK, response: mapping };
    }
  },
  '/laboratories/:laboratoryId/residue-mappings/orphan-labels': {
    get: async (_, { laboratoryId }) => {
      console.info('Get orphan residue labels', laboratoryId);

      const labels =
        await laboratoryResidueMappingRepository.findOrphanLabelsByLaboratoryId(
          laboratoryId
        );

      return { status: constants.HTTP_STATUS_OK, response: labels };
    }
  }
} as const satisfies ProtectedSubRouter;
