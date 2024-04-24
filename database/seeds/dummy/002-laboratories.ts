import { v4 as uuidv4 } from 'uuid';
import { Laboratories } from '../../../server/repositories/laboratoryRepository';

exports.seed = async function () {
  await Laboratories().insert([
    {
      id: uuidv4(),
      name: 'SCL 34',
    },
    {
      id: uuidv4(),
      name: 'LDA 66',
    },
    {
      id: uuidv4(),
      name: 'LDA 72',
    },
    {
      id: uuidv4(),
      name: 'SCL 91',
    },
    {
      id: uuidv4(),
      name: 'GIR 49',
    },
    {
      id: uuidv4(),
      name: 'CAP 29',
    },
    {
      id: uuidv4(),
      name: 'CER 30',
    },
    {
      id: uuidv4(),
      name: 'FYT',
    },
  ]);
};
