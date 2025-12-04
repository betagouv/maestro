import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import { getPrescriptionTitle } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import {
  FoieDeBovinPrescriptionFixture,
  genPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import { PPVInProgressProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import { genLocalPrescriptionComment } from 'maestro-shared/test/regionalPrescriptionCommentFixture';
import {
  genAuthUser,
  NationalCoordinator,
  Region1Fixture,
  RegionalCoordinator,
  RegionalDromCoordinator,
  RegionDromFixture
} from 'maestro-shared/test/userFixtures';
import { useEffect } from 'react';
import { useAppDispatch } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import { expect, fn, userEvent, within } from 'storybook/test';
import PrescriptionCommentsModal from './PrescriptionCommentsModal';

const meta = {
  title: 'Components/PrescriptionCommentsModal/PPV',
  component: PrescriptionCommentsModal,
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [
    (Story, context) => {
      const dispatch = useAppDispatch();
      const { prescriptionCommentsData } = context.parameters;

      useEffect(() => {
        if (prescriptionCommentsData) {
          dispatch(
            prescriptionsSlice.actions.setPrescriptionCommentsData(
              prescriptionCommentsData
            )
          );
        }
      }, [dispatch, prescriptionCommentsData]);

      return <Story />;
    }
  ]
} satisfies Meta<typeof PrescriptionCommentsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const onSubmitLocalPrescriptionComment = fn();

const oldComments = Array.from({ length: 5 }, (_, i) =>
  genLocalPrescriptionComment({
    comment: `Ancien commentaire ${i + 1} - ${new Date(2024, 10, i + 1).toLocaleDateString('fr-FR')}`,
    createdAt: new Date(2024, 10, i + 1),
    createdBy: NationalCoordinator.id
  })
);

const recentComments = [
  genLocalPrescriptionComment({
    comment: 'Commentaire récent 1',
    createdAt: new Date(2024, 10, 20),
    createdBy: RegionalCoordinator.id
  }),
  genLocalPrescriptionComment({
    comment: 'Commentaire récent 2',
    createdAt: new Date(2024, 10, 21),
    createdBy: NationalCoordinator.id
  }),
  genLocalPrescriptionComment({
    comment: 'Commentaire récent 3',
    createdAt: new Date(2024, 10, 22),
    createdBy: RegionalCoordinator.id
  })
];

const allComments = [...oldComments, ...recentComments];

const getProgrammingPlanWithStatus = (status: ProgrammingPlanStatus) => ({
  ...PPVInProgressProgrammingPlanFixture,
  regionalStatus: RegionList.map((region) => ({
    region,
    status
  }))
});

export const NationalCoordinatorViewByPrescription: Story = {
  args: {
    onSubmitLocalPrescriptionComment
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) }
    },
    prescriptionCommentsData: {
      viewBy: 'Prescription',
      programmingPlan: getProgrammingPlanWithStatus('SubmittedToRegion'),
      prescription: FoieDeBovinPrescriptionFixture,
      currentRegion: Region1Fixture,
      regionalCommentsList: [
        {
          region: Region1Fixture,
          comments: allComments
        },
        {
          region: RegionDromFixture,
          comments: [
            genLocalPrescriptionComment({
              createdBy: RegionalDromCoordinator.id
            })
          ]
        }
      ]
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const title = canvas.queryByText(
      getPrescriptionTitle(FoieDeBovinPrescriptionFixture)
    );
    await expect(title).toBeInTheDocument();

    await expect(canvas.getByText(/Commentaire récent 1/)).toBeInTheDocument();
    await expect(canvas.getByText(/Commentaire récent 2/)).toBeInTheDocument();
    await expect(canvas.getByText(/Commentaire récent 3/)).toBeInTheDocument();

    await expect(
      canvas.queryByText(/Ancien commentaire 1/)
    ).not.toBeInTheDocument();

    const previousButton = canvas.getByText('Messages précédents');
    await expect(previousButton).toBeInTheDocument();

    await userEvent.click(previousButton);

    await expect(canvas.getByText(/Ancien commentaire 5/)).toBeInTheDocument();
    await expect(
      canvas.getByText('Message au coordinateur régional')
    ).toBeInTheDocument();
  }
};

export const NationalCoordinatorViewByRegion: Story = {
  args: {
    onSubmitLocalPrescriptionComment
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(NationalCoordinator) }
    },
    prescriptionCommentsData: {
      viewBy: 'Region',
      region: Region1Fixture,
      prescriptionCommentsList: [
        {
          programmingPlan: getProgrammingPlanWithStatus('SubmittedToRegion'),
          prescription: FoieDeBovinPrescriptionFixture,
          comments: allComments
        },
        {
          programmingPlan: getProgrammingPlanWithStatus('SubmittedToRegion'),
          prescription: genPrescription({
            id: '22222222-2222-2222-2222-222222222222',
            programmingPlanId: PPVInProgressProgrammingPlanFixture.id,
            programmingPlanKind: 'PPV',
            context: 'Surveillance',
            matrixKind: 'A01SN',
            stages: ['STADE10']
          }),
          comments: [
            genLocalPrescriptionComment({
              comment: 'Commentaire sur la volaille',
              createdAt: new Date(2024, 10, 25),
              createdBy: RegionalCoordinator.id
            })
          ]
        }
      ]
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const regionTitle = canvas.queryByText(
      `Région ${Regions[Region1Fixture].name}`
    );
    await expect(regionTitle).toBeInTheDocument();

    await expect(canvas.getByText(/Commentaire récent 1/)).toBeInTheDocument();
    await expect(canvas.getByText(/Commentaire récent 2/)).toBeInTheDocument();
    await expect(canvas.getByText(/Commentaire récent 3/)).toBeInTheDocument();

    const breedingTag = canvas.getByText(/Viande de volaille/);

    await expect(breedingTag).toBeInTheDocument();

    await userEvent.click(breedingTag);
    await expect(
      canvas.getByText(/Commentaire sur la volaille/)
    ).toBeInTheDocument();
  }
};

export const RegionalCoordinatorViewPlanSubmittedToRegions: Story = {
  args: {
    onSubmitLocalPrescriptionComment
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser(RegionalCoordinator) }
    },
    prescriptionCommentsData: {
      viewBy: 'Prescription',
      programmingPlan: getProgrammingPlanWithStatus('SubmittedToRegion'),
      prescription: FoieDeBovinPrescriptionFixture,
      currentRegion: Region1Fixture,
      regionalCommentsList: [
        {
          region: Region1Fixture,
          comments: allComments
        }
      ]
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const title = canvas.queryByText(
      getPrescriptionTitle(FoieDeBovinPrescriptionFixture)
    );
    await expect(title).toBeInTheDocument();

    await expect(
      canvas.getByText('Message au coordinateur national')
    ).toBeInTheDocument();
  }
};
