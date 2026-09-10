# PPV : un sous-plan par matrice

Le plan PPV portait un sous-plan unique (`subPlanNumber = 'PPV'`) et une prescription par
catégorie de matrice. Il rejoint le modèle des autres plans : un sous-plan par prescription,
numérotés `PPV01`, `PPV02`… Ce document ne décrit que ce que le code ne dit pas de lui-même.

## Le préfixe du numéro de sous-plan est un discriminant

Une trentaine d'endroits du code se comportent différemment pour PPV : conformité recopiée de
l'analyse vers le prélèvement, contrôle libératoire dans le PDF et le CSV, mode opératoire,
champs spécifiques. Tous testaient `subPlanNumber === 'PPV'`.

Avec un sous-plan par matrice, ce test devient un test de préfixe, centralisé dans
`isPPVSubPlanNumber` / `isPPVSubPlan` (`shared/schema/ProgrammingPlan/ProgrammingSubPlan.ts`).
Conséquence à ne pas perdre de vue : **le numéro d'un sous-plan PPV doit commencer par `PPV`**.
Le renommer casse silencieusement ces comportements, sans erreur de compilation.

Deux endroits ne suivent pas cette règle et c'est voulu :

- `specificDataFieldConfigRepository.findSachaFields` filtre sur `withSacha`, qui est le critère
  réel — le numéro de sous-plan n'en était qu'un proxy.
- `FindLaboratoryOptions.subPlanNumberPrefix` filtre les agréments par préfixe (`like 'PPV%'`),
  puisqu'un laboratoire est désormais agréé par matrice.

## Ordre des migrations et vue `programming_sub_plans`

`programming_sub_plans` est une **vue** posée sur `programming_sub_plans_raw`, qui applique
l'héritage plan → sous-plan (`CASE WHEN sp.<clé>_managed THEN sp.<clé> ELSE pp.<clé> END`).
Plusieurs migrations la suppriment et la recréent en entier pour y ajouter une colonne.

Une migration qui touche cette vue doit donc porter un numéro **supérieur à toutes celles déjà
présentes**, y compris celles arrivées entre-temps sur `main`. Sur une base existante l'ordre
réel de passage masque le problème, mais sur une base neuve les migrations s'exécutent par ordre
de nom : une vue recréée plus tard écrase silencieusement les colonnes ajoutées plus tôt.

## `IN (...)` élimine les NULL

Le sous-plan d'un prélèvement est déduit de la matrice, choisie après l'étape de contexte :
`samples.programming_sub_plan_id` est donc nullable, et le reste définitivement pour les
prélèvements hors plan.

Or `buildFindSampleOptions` impose `programmingSubPlanIds` à partir des stades de l'utilisateur,
et le filtre correspondant est un `whereIn`. En SQL, `colonne IN (...)` ne retient pas les NULL :
sans précaution, tout prélèvement sans sous-plan disparaît de **toutes** les listes, sans erreur.
Le filtre de `sampleRepository` accepte donc explicitement les NULL.

Le même piège s'était déjà refermé sur le filtre `department`, pour la même raison : une colonne
devenue facultative dont le filtre était resté un `IN`. À vérifier pour toute colonne de
`samples` qui deviendrait nullable.

## Repli pour les prélèvements sans sous-plan

`analysisPermissionRole` et `withSacha` restent portés par le sous-plan, donc un prélèvement hors
plan n'a plus personne pour les lui fournir. Les conséquences ne sont pas des dégradations
douces :

- `hasSamplePermission` teste `analysisPermissionRole === userRole` ; sans sous-plan, plus
  personne ne peut saisir les résultats ;
- `analysisDaiProcessor` lit `withSacha` ; sans sous-plan, aucune DAI n'est envoyée.

`subPlanSampleSettings` (`ProgrammingSubPlan.ts`) renvoie donc des valeurs PPV codées en dur
(`Sampler`, pas de SACHA) quand le sous-plan est absent. C'est **transitoire** : ces deux réglages,
ainsi que `contactListId`, sont identiques sur toutes les matrices d'un même plan et doivent
remonter au niveau du plan, aux côtés de `stages` et `substanceKinds`. La PR qui fait cette
remontée supprime ce repli.

Tant qu'elle n'est pas passée, le repli est faux pour tout plan non-PPV qui autoriserait le hors
plan.
