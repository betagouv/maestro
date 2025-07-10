import { MatrixPart } from '../referential/Matrix/MatrixPart';
import { Stage } from '../referential/Stage';
import { ResultKind } from '../schema/Analysis/Residue/ResultKind';

// La LMR est obligatoire lorsque les inspecteurs ont saisi dans la description du prélèvement:
// - Le résultat est quantifiable
// - Stade de prélèvement -> n'est pas « en cours de culture »
// - Et LMR / Partie du végétal concernée -> n'est pas « Partie non LMR »
export const lmrIsRequired = (
  matrixPart: MatrixPart | null,
  stage: Stage | null,
  resultKind: ResultKind
): boolean => {
  return resultKind === 'Q' && matrixPart !== 'PART2' && stage !== 'STADE2';
};
