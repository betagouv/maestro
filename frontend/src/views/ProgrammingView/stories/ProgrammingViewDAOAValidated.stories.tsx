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
  VolailleLocalPrescriptionFixture,
  VolaillePrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import {
  DAOABovinValidatedSubPlanId,
  DAOAInProgressProgrammingPlanFixture,
  DAOAVolailleValidatedSubPlanId,
  genProgrammingSubPlan
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  DepartmentalCoordinator,
  genAuthUser,
  NationalCoordinator,
  RegionalCoordinator,
  SamplerDaoaFixture
} from 'maestro-shared/test/userFixtures';
import { expect, within } from 'storybook/test';
import { getMockApi } from '../../../services/mockApiClient';
import ProgrammingView from '../ProgrammingView';

const meta = {
  title: 'Views/ProgrammingPlanView/DAOA/4 - Validated',
  component: ProgrammingView
} satisfies Meta<typeof ProgrammingView>;

export default meta;
type Story = StoryObj<typeof meta>;

const programmingPlan = {
  ...DAOAInProgressProgrammingPlanFixture,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'Validated' as const
  })),
  departmentalStatus: RegionList.flatMap((region) =>
    Regions[region].departments.map((department) => ({
      region,
      department,
      status: 'Validated' as const
    }))
  )
};

const prescriptions = [
  FoieDeBovinPrescriptionFixture,
  VolaillePrescriptionFixture
];

const regionalPrescriptions = [
  ...FoieDeBovinLocalPrescriptionFixture,
  ...VolailleLocalPrescriptionFixture
];

const companies = [
  SlaughterhouseCompanyFixture1,
  SlaughterhouseCompanyFixture2
];

const laboratories = [genLaboratory(), genLaboratory(), genLaboratory()];

export const NationalCoordinatorView: Story = {
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: {
        data: [programmingPlan]
      },
      useFindPrescriptionsQuery: { data: prescriptions },
      useFindLocalPrescriptionsQuery: {
        data: regionalPrescriptions
      }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('prescription-table')).toBeInTheDocument();

    await expect(
      canvas.getByTestId(`matrix-${FoieDeBovinPrescriptionFixture.id}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getByTestId(`matrix-${VolaillePrescriptionFixture.id}`)
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByTestId(`cell-${FoieDeBovinPrescriptionFixture.id}`)
    ).toHaveLength(RegionList.length);

    await expect(
      canvas.queryByTestId('update-laboratory-button')
    ).not.toBeInTheDocument();

    await expect(canvas.getByText('Statut par région')).toBeInTheDocument();
    await expect(canvas.queryByTestId('Commentaires')).not.toBeInTheDocument();

    await expect(canvas.queryByTestId('notify-button')).not.toBeInTheDocument();
  }
};

export const RegionalCoordinatorView: Story = {
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          ...RegionalCoordinator,
          programmingSubPlans: [
            genProgrammingSubPlan({ id: DAOAVolailleValidatedSubPlanId }),
            genProgrammingSubPlan({ id: DAOABovinValidatedSubPlanId })
          ]
        })
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: { data: [programmingPlan] },
      useFindPrescriptionsQuery: {
        data: prescriptions
      },
      useFindLocalPrescriptionsQuery: {
        data: regionalPrescriptions.filter(
          (_) => _.region === RegionalCoordinator.region
        )
      }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByTestId('update-laboratory-button')
    ).not.toBeInTheDocument();

    await expect(
      canvas.queryByText('Statut par département')
    ).not.toBeInTheDocument();
    await expect(canvas.getByText('Suivi des plans')).toBeInTheDocument();
    await expect(canvas.queryByTestId('Commentaires')).not.toBeInTheDocument();

    await expect(canvas.queryByTestId('notify-button')).not.toBeInTheDocument();

    await expect(
      Array.from(canvasElement.querySelectorAll('.fr-badge')).filter((el) =>
        el.textContent?.toLowerCase().includes('%')
      )
    ).toHaveLength(0);
    await expect(canvas.queryByText('attribué')).not.toBeInTheDocument();
  }
};

export const DepartmentalCoordinatorView: Story = {
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser(DepartmentalCoordinator)
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: { data: [programmingPlan] },
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
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getAllByTestId('laboratorySelect-input').length
    ).toBeGreaterThan(0);

    await expect(canvas.queryByText(/Statut/)).not.toBeInTheDocument();
    await expect(canvas.queryByTestId('Commentaires')).not.toBeInTheDocument();

    await expect(canvas.queryByTestId('notify-button')).not.toBeInTheDocument();

    await expect(canvas.getByTestId('prescription-table')).toBeInTheDocument();

    await expect(canvas.getByText('Suivi des plans')).toBeInTheDocument();
  }
};

export const SamplerView: Story = {
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser(SamplerDaoaFixture)
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: { data: [programmingPlan] },
      useFindPrescriptionsQuery: {
        data: prescriptions
      },
      useFindLocalPrescriptionsQuery: {
        data: regionalPrescriptions
          .filter((_) => _.department === SamplerDaoaFixture.department)
          .map((_, index) => ({
            ..._,
            companySiret: SamplerDaoaFixture.companies[0].siret,
            sampleCount: index + 5
          }))
      },
      useFindCompaniesQuery: { data: companies },
      useFindLaboratoriesQuery: { data: laboratories }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByTestId('update-laboratory-button')
    ).not.toBeInTheDocument();

    await expect(canvas.queryByText(/Statut/)).not.toBeInTheDocument();
    await expect(canvas.queryByText('Commentaires')).not.toBeInTheDocument();

    await expect(canvas.queryByTestId('notify-button')).not.toBeInTheDocument();

    await expect(canvas.getByTestId('prescription-table')).toBeInTheDocument();

    await expect(
      canvas.queryByText('Attribution des laboratoires')
    ).not.toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('.checkbox-cell')).toHaveLength(
      0
    );
    await expect(canvas.getAllByText('N°').length).toBeGreaterThan(0);
    await expect(canvas.getAllByText('Matrice').length).toBeGreaterThan(0);
    await expect(canvas.getAllByText('Analyte').length).toBeGreaterThan(0);
  }
};
