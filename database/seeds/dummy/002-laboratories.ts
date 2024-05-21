import { v4 as uuidv4 } from 'uuid';
import { Laboratories } from '../../../server/repositories/laboratoryRepository';

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

exports.seed = async function () {
  await Laboratories().insert([
    {
      id: SCL34Id,
      name: 'SCL 34',
    },
    {
      id: LDA66Id,
      name: 'LDA 66',
    },
    {
      id: LDA72Id,
      name: 'LDA 72',
    },
    {
      id: SCL91Id,
      name: 'SCL 91',
    },
    {
      id: GIR49Id,
      name: 'GIR 49',
    },
    {
      id: CAP29Id,
      name: 'CAP 29',
    },
    {
      id: CER30Id,
      name: 'CER 30',
    },
    {
      id: FYTId,
      name: 'FYT',
    },
  ]);
};
