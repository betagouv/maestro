import { Matrix } from '../Matrix/Matrix';
import { Substance } from './Substance';

export const SubstanceListByMatrix: Partial<Record<Matrix, Substance[]>> = {
  A00KR: ['RF-0151-001-PPP', 'RF-0225-001-PPP'],
  A00QH: ['RF-0267-001-PPP'],
  A00RY: ['RF-0151-001-PPP'],
  A01GG: ['RF-0151-001-PPP', 'RF-0150-001-PPP', 'RF-0160-001-PPP'],
  A00NE: ['RF-0151-001-PPP', 'RF-0225-001-PPP'],
  A00MA: ['RF-0151-001-PPP', 'RF-0225-001-PPP'],
  A0DLB: ['RF-0151-001-PPP', 'RF-0225-001-PPP'],
  A013Q: ['RF-1020-001-PPP'],
  A00KT: ['RF-0791-001-PPP'],
  A00RE: ['RF-0225-001-PPP'],
  A00HC: ['RF-0267-001-PPP'],
  A0D9Y: ['RF-1020-001-PPP', 'RF-00005727-PAR', 'RF-00005721-PAR'],
  A010C: ['RF-0267-001-PPP'],
  A01DP: ['RF-0150-001-PPP', 'RF-0160-001-PPP', 'RF-0225-001-PPP'],
  A0DFR: ['RF-1020-001-PPP'],
  A0DBP: ['RF-00005727-PAR', 'RF-00005721-PAR'],
};
