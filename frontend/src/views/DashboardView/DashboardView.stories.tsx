import type { Meta, StoryObj } from '@storybook/react-vite';
import { type Region, RegionList } from 'maestro-shared/referential/Region';
import type { MatrixKind } from 'maestro-shared/schema/Matrix/MatrixReferential';
import type { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import type { DashboardStats } from 'maestro-shared/schema/Sample/DashboardStats';
import {
  genLocalPrescription,
  genPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import {
  genProgrammingPlan,
  PesticideResidueDomainId,
  PPVValidatedSubPlanFixture,
  withMatrixKindSubPlans
} from 'maestro-shared/test/programmingPlanFixtures';
import {
  genAuthUser,
  NationalCoordinator,
  Region1Fixture,
  RegionalCoordinator,
  Sampler1Fixture
} from 'maestro-shared/test/userFixtures';
import { expect, fn, within } from 'storybook/test';
import { getMockApi } from '../../services/mockApiClient';
import DashboardView from './DashboardView';

const meta = {
  title: 'Views/DashboardView',
  component: DashboardView,
  args: { onSelect: fn() }
} satisfies Meta<typeof DashboardView>;

export default meta;
type Story = StoryObj<typeof meta>;

const matrixKindProgrammingPlan = withMatrixKindSubPlans(
  genProgrammingPlan({
    domainId: PesticideResidueDomainId,
    year: new Date().getFullYear(),
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'Validated'
    }))
  }),
  ['A0DEH', 'A0DQS'] as MatrixKind[]
);
const currentProgrammingPlan = {
  ...matrixKindProgrammingPlan,
  subPlans: [
    matrixKindProgrammingPlan.subPlans[0],
    {
      ...matrixKindProgrammingPlan.subPlans[1],
      context: 'Surveillance' as const
    }
  ]
};

const prescription1 = genPrescription({
  programmingSubPlanId: currentProgrammingPlan.subPlans[0].id
});
const prescription2 = genPrescription({
  programmingSubPlanId: currentProgrammingPlan.subPlans[1].id
});

const localPrescriptions = [
  genLocalPrescription({
    prescriptionId: prescription1.id,
    region: Region1Fixture,
    sampleCount: 8,
    realizedSampleCount: 5,
    notAdmissibleSampleCount: 2,
    inProgressSampleCount: 1
  }),
  genLocalPrescription({
    prescriptionId: prescription2.id,
    region: Region1Fixture,
    sampleCount: 23,
    realizedSampleCount: 25,
    notAdmissibleSampleCount: 1,
    inProgressSampleCount: 0
  })
];

const dashboardStats: DashboardStats = {
  programmedCount: 31,
  planCount: 1,
  subPlanCount: 2,
  countsByStatus: {
    Draft: 4,
    Submitted: 3,
    Sent: 10,
    NotAdmissible: 3,
    Analysis: 5,
    InReview: 2,
    Completed: 8
  },
  compliantCount: 7,
  nonCompliantCount: 1,
  receivedItemCount: 100,
  notAdmissibleItemCount: 3,
  byTerritory: [
    {
      key: '44',
      programmedCount: 20,
      countsByStatus: {
        Draft: 0,
        Submitted: 2,
        Sent: 6,
        NotAdmissible: 1,
        Analysis: 0,
        InReview: 1,
        Completed: 4
      }
    },
    {
      key: '52',
      programmedCount: 5,
      countsByStatus: {
        Draft: 0,
        Submitted: 1,
        Sent: 4,
        NotAdmissible: 0,
        Analysis: 0,
        InReview: 1,
        Completed: 3
      }
    }
  ],
  sentByMonth: [{ month: 3, count: 12 }],
  averageSampledToDaiHours: 7.5
};

export const DashboardViewForSampler: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          userRole: 'Sampler',
          region: Region1Fixture,
          id: Sampler1Fixture.id,
          programmingSubPlans: [PPVValidatedSubPlanFixture]
        })
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: ({ status }: FindProgrammingPlanOptions) =>
        status?.includes('Validated')
          ? { data: [currentProgrammingPlan] }
          : { data: [] },
      useFindPrescriptionsQuery: { data: [prescription1, prescription2] },
      useFindLocalPrescriptionsQuery: { data: localPrescriptions }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Tableau de bord')).toBeInTheDocument();
    await expect(canvas.getByText('Vue globale')).toBeInTheDocument();
    await expect(
      canvas.getByText('Avancement par plans (2)')
    ).toBeInTheDocument();

    // (5 réalisés - 2 non recevables) / 8 (programmés) = 3/8 = 37%
    await expect(canvas.getAllByText('37%')[0]).toBeInTheDocument();
    await expect(
      canvas.getAllByText('2 non recevables')[0]
    ).toBeInTheDocument();
    // 8 (programmés) - (5 réalisés - 2 non recevables) - 1 (en cours) = 4
    await expect(canvas.getAllByText('4 à faire')[0]).toBeInTheDocument();

    // le filtre régional est réservé aux rôles nationaux
    await expect(canvas.queryByText('Régions')).not.toBeInTheDocument();
  }
};

export const DashboardViewForRegionalCoordinator: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          userRole: 'RegionalCoordinator',
          region: Region1Fixture,
          id: RegionalCoordinator.id
        })
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: ({ status }: FindProgrammingPlanOptions) =>
        status?.includes('Validated')
          ? { data: [currentProgrammingPlan] }
          : { data: [] },
      useFindPrescriptionsQuery: { data: [prescription1, prescription2] },
      useFindLocalPrescriptionsQuery: { data: localPrescriptions }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Tableau de bord')).toBeInTheDocument();
    await expect(canvas.getByText('Domaines')).toBeInTheDocument();
    await expect(canvas.getByText('Plans')).toBeInTheDocument();
    await expect(canvas.getByText('Stades de prélèvement')).toBeInTheDocument();
    await expect(canvas.queryByText('Régions')).not.toBeInTheDocument();
  }
};

export const DashboardViewForNationalCoordinator: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          userRole: 'NationalCoordinator',
          id: NationalCoordinator.id
        })
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: () => ({
        data: [currentProgrammingPlan]
      }),
      useFindPrescriptionsQuery: { data: [prescription1, prescription2] },
      useFindLocalPrescriptionsQuery: {
        data: RegionList.flatMap((region) => [
          genLocalPrescription({
            prescriptionId: prescription1.id,
            region: region as Region
          })
        ])
      },
      useGetDashboardStatsQuery: { data: dashboardStats }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Tableau de bord')).toBeInTheDocument();
    await expect(canvas.getByText('Régions')).toBeInTheDocument();

    await expect(
      canvas.getByText('Prélèvements programmés')
    ).toBeInTheDocument();
    await expect(canvas.getByText('31')).toBeInTheDocument();
    await expect(canvas.getByText('1 plan / 2 sous-plans')).toBeInTheDocument();

    // Sent + Analysis + InReview + Completed = 10 + 5 + 2 + 8 = 25
    await expect(canvas.getByText('25')).toBeInTheDocument();
    // 3 échantillons non recevables sur 100 reçus par les laboratoires = 3 %
    await expect(canvas.getByText('3 %')).toBeInTheDocument();
    await expect(
      canvas.getByText('3 échantillons non recevables')
    ).toBeInTheDocument();

    await expect(canvas.getByText('Avancement par région')).toBeInTheDocument();
    // 52 : 3 + 1 + 4 + 1 à envoyer = 9 réalisés pour 5 programmés
    await expect(canvas.getByText('+4')).toBeInTheDocument();

    await expect(
      canvas.getByText('Prélèvements transmis aux laboratoires')
    ).toBeInTheDocument();
    await expect(canvas.getByText('7,5 heures')).toBeInTheDocument();
  }
};

export const DashboardViewWithoutProgrammingPlan: Story = {
  args: {
    id: 'id',
    filters: {}
  },
  parameters: {
    preloadedState: {
      auth: {
        authUser: genAuthUser({
          userRole: 'NationalCoordinator',
          id: NationalCoordinator.id
        })
      }
    },
    apiClient: getMockApi({
      useFindProgrammingPlansQuery: () => ({
        data: []
      })
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Tableau de bord')).toBeInTheDocument();
    await expect(
      canvas.queryByText(/Avancement par plans/)
    ).not.toBeInTheDocument();
  }
};
