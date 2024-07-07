import { SubstanceAnalysisTable } from '../../../server/repositories/substanceRepository';
import { Matrix } from '../../../shared/referential/Matrix/Matrix';
import { AnalysisKind } from '../../../shared/schema/Analysis/AnalysisKind';

exports.seed = async function () {
  const genSubstanceAnalysis = (
    matrix: Matrix,
    kind: AnalysisKind,
    ...substanceCodes: string[]
  ) =>
    substanceCodes.map((substanceCode) => ({
      matrix,
      substanceCode,
      kind,
      year: 2024,
    }));

  // prettier-ignore
  const substanceAnalysis = [
    genSubstanceAnalysis('A0DVX', 'Mono'),
    genSubstanceAnalysis('A0DVX', 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A01LB', 'Mono'),
    genSubstanceAnalysis('A01LB', 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A00KR', 'Mono', 'RF-0151-001-PPP', 'RF-0225-001-PPP'),
    genSubstanceAnalysis('A00KR', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A00QH', 'Mono', 'RF-0151-001-PPP', 'RF-0267-001-PPP'),
    genSubstanceAnalysis('A00QH', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A00RY', 'Mono', 'RF-0151-001-PPP'),
    genSubstanceAnalysis('A00RY', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A01GG', 'Mono', 'RF-0151-001-PPP', 'RF-0150-001-PPP', 'RF-0160-001-PPP'),
    genSubstanceAnalysis('A01GG', 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A00GL', 'Mono'),
    genSubstanceAnalysis('A00GL', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A00FR', 'Mono'),
    genSubstanceAnalysis('A00FR', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A00NE', 'Mono', 'RF-0151-001-PPP', 'RF-0225-001-PPP'),
    genSubstanceAnalysis('A00NE', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A00SA', 'Mono'),
    genSubstanceAnalysis('A00SA', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A00PH', 'Mono'),
    genSubstanceAnalysis('A00PH', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A01HG', 'Mono'),
    genSubstanceAnalysis('A01HG', 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A00MA', 'Mono', 'RF-0151-001-PPP', 'RF-0225-001-PPP'),
    genSubstanceAnalysis('A00MA', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A014C', 'Mono'),
    genSubstanceAnalysis('A014C', 'Multi', 'RF-0030-001-PPP','RF-0374-001-PPP','RF-00007585-PAR','RF-00009360-PAR','RF-00008949-PAR','RF-0440-001-PPP','RF-00002591-PAR','RF-0259-001-PPP'),
    genSubstanceAnalysis('A00YZ', 'Mono', 'RF-0225-001-PPP'),
    genSubstanceAnalysis('A00YZ', 'Multi', 'RF-00010217-PAR','RF-0446-001-PPP','RF-00007585-PAR','RF-00009360-PAR','RF-00008949-PAR','RF-0440-001-PPP','RF-00002591-PAR','RF-0259-001-PPP'),
    genSubstanceAnalysis('A0DLB', 'Mono', 'RF-0151-001-PPP', 'RF-0225-001-PPP'),
    genSubstanceAnalysis('A0DLB', 'Multi', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0282-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A013Q', 'Mono'),
    genSubstanceAnalysis('A013Q', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A01JV', 'Mono'),
    genSubstanceAnalysis('A01JV', 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A00KT', 'Mono', 'RF-0791-001-PPP'),
    genSubstanceAnalysis('A00KT', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A01LF', 'Mono'),
    genSubstanceAnalysis('A01LF', 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A00RE', 'Mono', 'RF-0225-001-PPP'),
    genSubstanceAnalysis('A00RE', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A00HC', 'Mono', 'RF-0267-001-PPP'),
    genSubstanceAnalysis('A00HC', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A0D9Y', 'Mono', 'RF-1020-001-PPP', 'RF-00005727-PAR', 'RF-00005721-PAR'),
    genSubstanceAnalysis('A0D9Y', 'Multi', 'RF-00010217-PAR', 'RF-0446-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A000F', 'Mono', 'RF-1020-001-PPP', 'RF-00005727-PAR', 'RF-00005721-PAR'),
    genSubstanceAnalysis('A000F', 'Multi', 'RF-00010217-PAR', 'RF-0446-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A010C', 'Mono', 'RF-0267-001-PPP'),
    genSubstanceAnalysis('A010C', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A01GL', 'Mono', 'RF-0151-001-PPP', 'RF-0150-001-PPP', 'RF-0160-001-PPP'),
    genSubstanceAnalysis('A01GL', 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A0DEH', 'Mono'),
    genSubstanceAnalysis('A0DEH', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A01DP', 'Mono', 'RF-0150-001-PPP', 'RF-0160-001-PPP', 'RF-0225-001-PPP', 'RF-00005727-PAR'),
    genSubstanceAnalysis('A01DP', 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A001C', 'Mono'),
    genSubstanceAnalysis('A001C', 'Multi', 'RF-0318-001-PPP', 'RF-0042-001-PPP', 'RF-0331-001-PPP', 'RF-0271-004-PPP', 'RF-0499-001-PPP', 'RF-0398-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A0DFR', 'Mono', 'RF-1020-001-PPP'),
    genSubstanceAnalysis('A0DFR', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    genSubstanceAnalysis('A0DBP', 'Mono', 'RF-00005727-PAR', 'RF-00005721-PAR'),
    genSubstanceAnalysis('A0DBP', 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
  ];

  await SubstanceAnalysisTable().insert(substanceAnalysis.flat());
};
