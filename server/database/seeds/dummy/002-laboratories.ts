import { v4 as uuidv4 } from 'uuid';
import { Laboratories } from '../../../repositories/laboratoryRepository';

const SCL34Id = uuidv4();
const LDA66Id = uuidv4();
const LDA72Id = uuidv4();
const SCL91Id = uuidv4();
const GIR49Id = uuidv4();
const CAP29Id = uuidv4();
const CER30Id = uuidv4();

export const DummyLaboratoryIds = [
  SCL34Id,
  LDA66Id,
  LDA72Id,
  SCL91Id,
  GIR49Id,
  CAP29Id,
  CER30Id
];

const EMAIL_SANBOX = 'preleveur@maestro.beta.gouv.fr';
export const seed = async function () {
  await Laboratories().insert([
    {
      id: SCL34Id,
      name: 'SCL 34',
      emails: [EMAIL_SANBOX]
    },
    {
      id: LDA66Id,
      name: 'LDA 66',
      emails: [EMAIL_SANBOX]
    },
    {
      id: LDA72Id,
      name: 'LDA 72',
      emails: [EMAIL_SANBOX]
    },
    {
      id: SCL91Id,
      name: 'SCL 91',
      emails: [EMAIL_SANBOX]
    },
    {
      id: GIR49Id,
      name: 'GIR 49',
      emails: [EMAIL_SANBOX]
    },
    {
      id: CAP29Id,
      name: 'CAP 29',
      emails: [EMAIL_SANBOX]
    },
    {
      id: CER30Id,
      name: 'CER 30',
      emails: [EMAIL_SANBOX]
    }
  ]);
};
