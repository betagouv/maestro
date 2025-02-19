import { SSD2Id } from './SSD2Id';
import { SSD2Referential } from './SSD2Referential';

export const SSD2Hierachy: {[reference in SSD2Id]?: SSD2Id[]} = {
'RF-00004681-PAR': ['RF-00004686-PAR', 'RF-0061-001-PPP']
}

export const getAnalytes = (ssd2Id: SSD2Id) : SSD2Id[] => {

  const reference = SSD2Referential[ssd2Id]

  const analytes: SSD2Id[] = 'analytes' in reference ? [...reference.analytes] : []

  analytes.push(...(SSD2Hierachy[ssd2Id] ?? []))

  return analytes
}

export const hasAnalytes = (ssd2Id: SSD2Id) : boolean => getAnalytes(ssd2Id).length > 0