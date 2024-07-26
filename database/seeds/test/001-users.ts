import { default as _ } from 'lodash';
import { Users } from '../../../server/repositories/userRepository';
import { Region, RegionList } from '../../../shared/referential/Region';
import { genUser, oneOf } from '../../../shared/test/testFixtures';

export const Region1Fixture = '44' as Region;
export const Region2Fixture = oneOf(
  _.difference(RegionList, Region1Fixture)
) as Region;
export const Sampler1Fixture = {
  ...genUser('Sampler'),
  region: Region1Fixture,
};
export const Sampler2Fixture = {
  ...genUser('Sampler'),
  region: Region2Fixture,
};

export const RegionalCoordinator = {
  ...genUser('RegionalCoordinator'),
  region: Region1Fixture,
};
export const NationalCoordinator = genUser('NationalCoordinator');

exports.seed = async function () {
  await Users().insert([
    Sampler1Fixture,
    Sampler2Fixture,
    RegionalCoordinator,
    NationalCoordinator,
  ]);
};
