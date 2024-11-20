import { PrescriptionSubstanceAnalysisTable } from '../../../server/repositories/prescriptionSubstanceAnalysisRepository';
import { AnalysisKind } from '../../../shared/schema/Analysis/AnalysisKind';
import { abricotsEtSimilaires } from '../production/002-prescriptions';

exports.seed = async function () {
  const genSubstanceAnalysis = (
    prescriptionId: string,
    analysisKind: AnalysisKind,
    ...substanceCodes: string[]
  ) =>
    substanceCodes.map((substanceCode) => ({
      prescriptionId,
      substanceCode,
      analysisKind,
    }));

  console.log('Seeding substance analysis', abricotsEtSimilaires.id);

  // prettier-ignore
  const substanceAnalysis = [
    genSubstanceAnalysis(abricotsEtSimilaires.id, 'Mono'),
    genSubstanceAnalysis(abricotsEtSimilaires.id, 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(avocats.id, 'Mono'),
    // genSubstanceAnalysis(avocats.id, 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(legumesFeuilles.id, 'Mono', 'RF-0151-001-PPP', 'RF-0225-001-PPP'),
    // genSubstanceAnalysis(legumesFeuilles.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(carottes.id, 'Mono', 'RF-0151-001-PPP', 'RF-0267-001-PPP'),
    // genSubstanceAnalysis(carottes.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(celeris.id, 'Mono', 'RF-0151-001-PPP'),
    // genSubstanceAnalysis(celeris.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(cerisesEtSimilaires.id, 'Mono', 'RF-0151-001-PPP', 'RF-0150-001-PPP', 'RF-0160-001-PPP'),
    // genSubstanceAnalysis(cerisesEtSimilaires.id, 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(chouxVertsEtSimilaires.id, 'Mono'),
    // genSubstanceAnalysis(chouxVertsEtSimilaires.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(chouxFleurs.id, 'Mono'),
    // genSubstanceAnalysis(chouxFleurs.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(endives.id, 'Mono', 'RF-0151-001-PPP', 'RF-0225-001-PPP'),
    // genSubstanceAnalysis(endives.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(fenouils.id, 'Mono'),
    // genSubstanceAnalysis(fenouils.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(fevesNonEcossees.id, 'Mono'),
    // genSubstanceAnalysis(fevesNonEcossees.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(figues.id, 'Mono'),
    // genSubstanceAnalysis(figues.id, 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(jeunesPousses.id, 'Mono', 'RF-0151-001-PPP', 'RF-0225-001-PPP'),
    // genSubstanceAnalysis(jeunesPousses.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(fruitsACoques.id, 'Mono'),
    // genSubstanceAnalysis(fruitsACoques.id, 'Multi', 'RF-0030-001-PPP','RF-0374-001-PPP','RF-00007585-PAR','RF-00009360-PAR','RF-00008949-PAR','RF-0440-001-PPP','RF-00002591-PAR','RF-0259-001-PPP'),
    // genSubstanceAnalysis(houblon.id, 'Mono', 'RF-0225-001-PPP'),
    // genSubstanceAnalysis(houblon.id, 'Multi', 'RF-00010217-PAR','RF-0446-001-PPP','RF-00007585-PAR','RF-00009360-PAR','RF-00008949-PAR','RF-0440-001-PPP','RF-00002591-PAR','RF-0259-001-PPP'),
    // genSubstanceAnalysis(laituesEtSimilaires.id, 'Mono', 'RF-0151-001-PPP', 'RF-0225-001-PPP'),
    // genSubstanceAnalysis(laituesEtSimilaires.id, 'Multi', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0282-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(lentilles.id, 'Mono'),
    // genSubstanceAnalysis(lentilles.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(litchis.id, 'Mono'),
    // genSubstanceAnalysis(litchis.id, 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(maches.id, 'Mono', 'RF-0791-001-PPP'),
    // genSubstanceAnalysis(maches.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(mangues.id, 'Mono'),
    // genSubstanceAnalysis(mangues.id, 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(navets.id, 'Mono', 'RF-0225-001-PPP'),
    // genSubstanceAnalysis(navets.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(oignons.id, 'Mono', 'RF-0267-001-PPP'),
    // genSubstanceAnalysis(oignons.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(orgeEtSimilaires.id, 'Mono', 'RF-1020-001-PPP', 'RF-00005727-PAR', 'RF-00005721-PAR'),
    // genSubstanceAnalysis(orgeEtSimilaires.id, 'Multi', 'RF-00010217-PAR', 'RF-0446-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(avoineEtSimilaires.id, 'Mono', 'RF-1020-001-PPP', 'RF-00005727-PAR', 'RF-00005721-PAR'),
    // genSubstanceAnalysis(avoineEtSimilaires.id, 'Multi', 'RF-00010217-PAR', 'RF-0446-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(patatesDouces.id, 'Mono', 'RF-0267-001-PPP'),
    // genSubstanceAnalysis(patatesDouces.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(pechesEtSimilaires.id, 'Mono', 'RF-0151-001-PPP', 'RF-0150-001-PPP', 'RF-0160-001-PPP'),
    // genSubstanceAnalysis(pechesEtSimilaires.id, 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(poireauxEtSimilaires.id, 'Mono'),
    // genSubstanceAnalysis(poireauxEtSimilaires.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-0374-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(poires.id, 'Mono', 'RF-0150-001-PPP', 'RF-0160-001-PPP', 'RF-0225-001-PPP', 'RF-00005727-PAR'),
    // genSubstanceAnalysis(poires.id, 'Multi', 'RF-0030-001-PPP', 'RF-0374-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(rizEtSimilaires.id, 'Mono'),
    // genSubstanceAnalysis(rizEtSimilaires.id, 'Multi', 'RF-0318-001-PPP', 'RF-0042-001-PPP', 'RF-0331-001-PPP', 'RF-0271-004-PPP', 'RF-0499-001-PPP', 'RF-0398-001-PPP', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(fevesDeSoja.id, 'Mono', 'RF-1020-001-PPP'),
    // genSubstanceAnalysis(fevesDeSoja.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
    // genSubstanceAnalysis(graineDeTournesol1.id, 'Mono', 'RF-00005727-PAR', 'RF-00005721-PAR'),
    // genSubstanceAnalysis(graineDeTournesol1.id, 'Multi', 'RF-00007585-PAR', 'RF-00009360-PAR', 'RF-00008949-PAR', 'RF-0440-001-PPP', 'RF-00002591-PAR', 'RF-0259-001-PPP'),
  ];

  await PrescriptionSubstanceAnalysisTable().insert(substanceAnalysis.flat());
};
