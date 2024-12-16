import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { Laboratories } from '../../../server/repositories/laboratoryRepository';
import { Knex } from 'knex';
import { setKnexInstance } from '../../../server/repositories/db';

export const SCL34Id = uuidv4();
export const LDA66Id = uuidv4();
export const LDA72Id = uuidv4();
export const SCL91Id = uuidv4();
export const GIR49Id = uuidv4();
export const CAP29Id = uuidv4();
export const CER30Id = uuidv4();
export const FYTId = uuidv4();

export const DummyLaboratoryIds = [
  SCL34Id,
  LDA66Id,
  LDA72Id,
  SCL91Id,
  GIR49Id,
  CAP29Id,
  CER30Id,
  FYTId,
];

exports.seed = async function (knex: Knex) {
  setKnexInstance(knex)

  await Laboratories().insert([
    {
      id: SCL34Id,
      name: 'SCL 34',
      email: fakerFR.internet.exampleEmail(),
    },
    {
      id: LDA66Id,
      name: 'LDA 66',
      email: fakerFR.internet.exampleEmail(),
    },
    {
      id: LDA72Id,
      name: 'LDA 72',
      email: fakerFR.internet.exampleEmail(),
    },
    {
      id: SCL91Id,
      name: 'SCL 91',
      email: fakerFR.internet.exampleEmail(),
    },
    {
      id: GIR49Id,
      name: 'GIR 49',
      email: fakerFR.internet.exampleEmail(),
    },
    {
      id: CAP29Id,
      name: 'CAP 29',
      email: fakerFR.internet.exampleEmail(),
    },
    {
      id: CER30Id,
      name: 'CER 30',
      email: fakerFR.internet.exampleEmail(),
    },
    {
      id: FYTId,
      name: 'FYT',
      email: fakerFR.internet.exampleEmail(),
    },
  ]);
};
