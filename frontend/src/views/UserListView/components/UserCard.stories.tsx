import type { Meta, StoryObj } from '@storybook/react-vite';
import { SlaughterhouseStage } from 'maestro-shared/referential/Stage';
import { genCompany } from 'maestro-shared/test/companyFixtures';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import { genAuthUser, genUserListItem } from 'maestro-shared/test/userFixtures';
import { expect, fn, within } from 'storybook/test';
import { getMockApi } from '../../../services/mockApiClient';
import { UserCard } from './UserCard';

const meta = {
  title: 'Views/Users/UserCard',
  component: UserCard,
  args: {
    user: genUserListItem({}),
    onEdit: fn(),
    onDisable: fn(),
    onEnable: fn(),
    onToggleCertification: fn()
  }
} satisfies Meta<typeof UserCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};

export const SamplerNotCertified: Story = {
  args: {
    user: genUserListItem({ roles: ['Sampler'], certified: false })
  }
};

const myself = genUserListItem({
  roles: ['AdministratorBGIR', 'NationalCoordinator']
});

export const Myself: Story = {
  args: {
    user: myself
  },
  parameters: {
    preloadedState: {
      auth: { authUser: genAuthUser({ id: myself.id, roles: myself.roles }) }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Vous')).toBeVisible();
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
  }
};

const longCompanyName =
  'Société coopérative agricole des éleveurs de volailles du bocage vendéen';
const companies = [
  genCompany({ name: longCompanyName }),
  ...Array.from(Array(6).keys()).map(() => genCompany())
];

export const SamplerWithCompanies: Story = {
  args: {
    user: genUserListItem({
      roles: ['Sampler'],
      stages: [SlaughterhouseStage],
      companies
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTitle(longCompanyName)).toBeVisible();
    await expect(canvas.getByText(companies[2].name)).toBeVisible();
    await expect(canvas.queryByText(companies[3].name)).not.toBeInTheDocument();
    await expect(canvas.getByText('+4')).toHaveAttribute(
      'title',
      companies
        .slice(3)
        .map((company) => company.name)
        .join('\n')
    );
  }
};

export const LaboratoryUser: Story = {
  args: {
    user: genUserListItem({
      roles: ['LaboratoryUser'],
      laboratoryId: LaboratoryFixture.id
    })
  },
  parameters: {
    apiClient: getMockApi({
      useFindLaboratoriesQuery: { data: [LaboratoryFixture] }
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTitle(LaboratoryFixture.name)).toBeVisible();
  }
};
