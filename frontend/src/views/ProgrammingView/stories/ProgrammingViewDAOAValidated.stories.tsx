import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlanKindWithSachaList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
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
import { DAOAInProgressProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import {
  DepartmentalCoordinator,
  genAuthUser,
  NationalCoordinator,
  RegionalCoordinator,
  SamplerDaoaFixture
} from 'maestro-shared/test/userFixtures';
import { expect, userEvent, within } from 'storybook/test';
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

    await expect(
      canvas.getByTestId('prescriptions-cards-segment')
    ).toBeInTheDocument();
    await expect(
      canvas.getByTestId('prescriptions-table-segment')
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByTestId('prescriptions-table-segment'));

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

    await userEvent.click(canvas.getByTestId('prescriptions-cards-segment'));

    await expect(canvas.getByTestId('add-matrix-button')).toBeInTheDocument();

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
          programmingPlanKinds: ProgrammingPlanKindWithSachaList
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
      canvas.queryByTestId('prescriptions-cards-segment')
    ).toBeInTheDocument();
    await expect(
      canvas.queryByTestId('prescriptions-table-segment')
    ).toBeInTheDocument();

    await expect(
      canvas.queryByTestId('add-matrix-button')
    ).not.toBeInTheDocument();

    await expect(
      canvas.queryByTestId('update-laboratory-button')
    ).not.toBeInTheDocument();

    await expect(
      canvas.getByText('Statut par département')
    ).toBeInTheDocument();
    await expect(canvas.queryByTestId('Commentaires')).not.toBeInTheDocument();

    await expect(canvas.queryByTestId('notify-button')).not.toBeInTheDocument();

    await expect(
      Array.from(canvasElement.querySelectorAll('.fr-badge')).filter((el) =>
        el.textContent?.toLowerCase().includes('%')
      )
    ).toHaveLength(prescriptions.length);
    await expect(canvas.queryByText('attribué')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByTestId('prescriptions-table-segment'));

    await expect(
      Array.from(canvasElement.querySelectorAll('.fr-badge')).filter((el) =>
        el.textContent?.toLowerCase().includes('%')
      )
    ).toHaveLength(
      (Regions[RegionalCoordinator.region].departments.length + 1) *
        (prescriptions.length + 1)
    );
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
      canvas.queryByTestId('prescriptions-cards-segment')
    ).toBeInTheDocument();
    await expect(
      canvas.queryByTestId('prescriptions-table-segment')
    ).toBeInTheDocument();

    await expect(
      canvas.queryByTestId('add-matrix-button')
    ).not.toBeInTheDocument();

    await expect(canvas.getAllByTestId('update-laboratory-button').length).toBe(
      regionalPrescriptions.filter(
        (_) => _.department === DepartmentalCoordinator.department
      ).length
    );

    await expect(canvas.queryByText(/Statut/)).not.toBeInTheDocument();
    await expect(canvas.queryByTestId('Commentaires')).not.toBeInTheDocument();

    await expect(canvas.queryByTestId('notify-button')).not.toBeInTheDocument();

    await expect(
      Array.from(canvasElement.querySelectorAll('.fr-badge')).filter((el) =>
        el.textContent?.toLowerCase().includes('%')
      )
    ).toHaveLength(prescriptions.length);
    await expect(canvas.queryByText('attribué')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByTestId('prescriptions-table-segment'));

    await expect(
      Array.from(canvasElement.querySelectorAll('.fr-badge')).filter((el) =>
        el.textContent?.toLowerCase().includes('%')
      )
    ).toHaveLength(prescriptions.length + 1);
    await expect(canvas.queryByText('attribué')).not.toBeInTheDocument();
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
          .filter((_) => _.department === DepartmentalCoordinator.department)
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
      canvas.queryByTestId('prescriptions-cards-segment')
    ).toBeInTheDocument();
    await expect(
      canvas.queryByTestId('prescriptions-table-segment')
    ).toBeInTheDocument();

    await expect(
      canvas.queryByTestId('add-matrix-button')
    ).not.toBeInTheDocument();

    await expect(
      canvas.queryByTestId('update-laboratory-button')
    ).not.toBeInTheDocument();

    await expect(canvas.queryByText(/Statut/)).not.toBeInTheDocument();
    await expect(canvas.queryByText('Commentaires')).not.toBeInTheDocument();

    await expect(canvas.queryByTestId('notify-button')).not.toBeInTheDocument();

    await expect(
      Array.from(canvasElement.querySelectorAll('.fr-badge')).filter((el) =>
        el.textContent?.toLowerCase().includes('%')
      )
    ).toHaveLength(prescriptions.length);
    await expect(canvas.queryByText('attribué')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByTestId('prescriptions-table-segment'));

    await expect(
      Array.from(canvasElement.querySelectorAll('.fr-badge')).filter((el) =>
        el.textContent?.toLowerCase().includes('%')
      )
    ).toHaveLength(prescriptions.length + 1);
    await expect(canvas.queryByText('attribué')).not.toBeInTheDocument();
  }
};
