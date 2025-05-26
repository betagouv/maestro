import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { Laboratories } from '../../../repositories/laboratoryRepository';

const SCL34Id = uuidv4();
const LDA66Id = uuidv4();
const LDA72Id = uuidv4();
const SCL91Id = uuidv4();
const GIR49Id = uuidv4();
const CAP29Id = uuidv4();
const CER30Id = uuidv4();
const FYTId = uuidv4();

export const DummyLaboratoryIds = [
  SCL34Id,
  LDA66Id,
  LDA72Id,
  SCL91Id,
  GIR49Id,
  CAP29Id,
  CER30Id,
  FYTId
];

export const seed = async function () {
  await Laboratories().insert([
    {
      id: SCL34Id,
      name: 'SCL 34',
      emails: [fakerFR.internet.exampleEmail()]
    },
    {
      id: LDA66Id,
      name: 'LDA 66',
      emails: [fakerFR.internet.exampleEmail()]
    },
    {
      id: LDA72Id,
      name: 'LDA 72',
      emails: [fakerFR.internet.exampleEmail()]
    },
    {
      id: SCL91Id,
      name: 'SCL 91',
      emails: [fakerFR.internet.exampleEmail()]
    },
    {
      id: GIR49Id,
      name: 'GIR 49',
      emails: [fakerFR.internet.exampleEmail()]
    },
    {
      id: CAP29Id,
      name: 'CAP 29',
      emails: [fakerFR.internet.exampleEmail()]
    },
    {
      id: CER30Id,
      name: 'CER 30',
      emails: [fakerFR.internet.exampleEmail()]
    },
    {
      id: FYTId,
      name: 'FYT',
      emails: [fakerFR.internet.exampleEmail()]
    }
  ]);
};
