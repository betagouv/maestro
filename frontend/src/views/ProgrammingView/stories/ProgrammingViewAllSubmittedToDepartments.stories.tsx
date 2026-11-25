import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  SlaughterhouseCompanyFixture1,
  SlaughterhouseCompanyFixture2
} from 'maestro-shared/test/companyFixtures';
import { genLaboratory } from 'maestro-shared/test/laboratoryFixtures';
import {
  FoieDeBovinLocalPrescriptionFixture,
  FoieDeBovinPrescriptionFixture,
  genLocalPrescriptions,
  genPrescription,
  VolailleLocalPrescriptionFixture,
  VolaillePrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import {
  ALANProgrammingPlanFixture,
  ALANRuminantsSubPlanId,
  DAOAInProgressProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  DepartmentalCoordinator,
  genAuthUser
} from 'maestro-shared/test/userFixtures';
import { getMockApi } from '../../../services/mockApiClient';
import ProgrammingView from '../ProgrammingView';

const meta = {
  title: 'Views/ProgrammingPlanView/All/3 - SubmittedToDepartments',
  component: ProgrammingView
} satisfies Meta<typeof ProgrammingView>;

export default meta;
type Story = StoryObj<typeof meta>;

const programmingPlan = {
  ...DAOAInProgressProgrammingPlanFixture,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'SubmittedToDepartments' as const
  })),
  departmentalStatus: RegionList.flatMap((region) =>
    Regions[region].departments.map((department) => ({
      region,
      department,
      status: 'SubmittedToDepartments' as const
    }))
  )
};

const prescriptions = [
  FoieDeBovinPrescriptionFixture,
  VolaillePrescriptionFixture,
  genPrescription({
    id: '8154e757-7393-4d98-bb43-ed3977d4f342',
    programmingSubPlanId: ALANRuminantsSubPlanId,
    sampleCount: 80
  })
];

const regionalPrescriptions = [
  ...FoieDeBovinLocalPrescriptionFixture,
  ...VolailleLocalPrescriptionFixture,
  ...genLocalPrescriptions(
    '8154e757-7393-4d98-bb43-ed3977d4f342',
    [3, 2, 5, 8, 10, 1, 2, 10, 3, 3, 2, 9, 4, 4, 2, 1, 5, 6],
    { withDepartment: true }
  )
];

const companies = [
  SlaughterhouseCompanyFixture1,
  SlaughterhouseCompanyFixture2
];

const laboratories = [genLaboratory(), genLaboratory(), genLaboratory()];

export const DepartmentalCoordinatorView: Story = {
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser(DepartmentalCoordinator)
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: [programmingPlan, ALANProgrammingPlanFixture]
      },
      useFindPrescriptionsQuery: {
        data: prescriptions
      },
      useFindLocalPrescriptionsQuery: {
        data: regionalPrescriptions
          .filter((_) => _.department === DepartmentalCoordinator.department)
          .map((_, index) => ({ ..._, sampleCount: index + 5 }))
      },
      useFindCompaniesQuery: { data: companies },
      useFindLaboratoriesQuery: { data: laboratories }
    })
  }
};
