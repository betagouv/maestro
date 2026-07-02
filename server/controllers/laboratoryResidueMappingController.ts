import { HttpStatus } from '../constants/httpStatus';
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

      return { status: HttpStatus.OK, response: mappings };
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

      return { status: HttpStatus.OK, response: mapping };
    }
  }
} as const satisfies ProtectedSubRouter;
