# États de programmation — PPV vs DAOA

Rollback effectué (`server/controllers/programmingPlanController.ts`, `server/repositories/programmingPlanRepository.ts`, `server/services/prescriptionDiffusionService.ts`, tests associés) — retour à `HEAD`. Ce document décrit l'état **actuel** (code non modifié) pour servir de référence avant tout nouveau correctif.

## Hypothèses

- Répartition complète à chaque étape (`isComplete = true`, `hasAnyProgrammedSample = true`), sauf la ligne 1 (saisie).
- PPV = `distributionKind: 'REGIONAL'` (pas de palier département — `Statut département` = toujours **N/A**).
- DAOA = `distributionKind: 'SLAUGHTERHOUSE'`.
- Labels lus dans `shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus.ts` (`computeDisplayStatus`, `submittedLabel`).

## Mécanique clé (source des régressions passées)

Le statut affiché vient de `computeDisplayStatus`, alimenté par deux champs par ligne (national/région/département) :

- **`hasPendingChange`** — **masqué par profil** (`maskHasPendingChangeForViewer` dans `programmingPlanController.ts`). Un profil ne voit `hasPendingChange: true` que sur **sa propre** ligne (National → Coord national/Suivi national ; Regional → Coord régional de cette région ; Departmental → Coord départemental de ce département). Pour tous les autres, il est forcé à `false`. **Admin ne "possède" aucune ligne** (`editingEchelonForRole('Administrator')` → `null`), donc Admin voit toujours `hasPendingChange: false`, y compris sur la ligne nationale.
- **`needsResend`** — **jamais masqué**, visible à l'identique par tout le monde. Il ne se déclenche que si un changement a déjà été **diffusé** (`diffused_at IS NOT NULL`) après le dernier `sentAt` de l'échelon.

Priorité dans `computeDisplayStatus` : `needsSend` (piloté par `hasPendingChange` masqué, → `ReadyToSend`/"Modifié, à envoyer") est testé **avant** la branche `needsResend` (→ `InProgress`/"En cours", `modified: true`). D'où l'asymétrie : le propriétaire de la ligne voit "Modifié, à envoyer" (actionnable), les autres voient "En cours" (non actionnable) pour le **même** changement.

⚠️ **Piège identifié** : élargir `needsResendExpression` (SQL, non masqué) pour couvrir un changement encore *pending* (non diffusé) le rend visible **à tout le monde, sur tout plan**, dès la sauvegarde d'une modif — même avant tout envoi explicite. C'est ce qui a fait passer des statuts stables ("Soumis"/"Diffusé") en "En cours" de façon intempestive. Ne pas toucher ce champ non masqué pour résoudre un problème scopé à un seul échelon/profil ; passer plutôt par `hasPendingChange` (masqué) ou par la donnée déjà exposée via `local_prescription_changes` (decorator `previousSampleCount`/`changedAt`).

## Bug initial (rappel, non corrigé)

`commitPendingNationalChanges` écrit `local_prescriptions.sample_count` dès l'envoi National → Région. Pour PPV (`REGIONAL`, pas de palier département), cette ligne région **est** la ligne lue directement par les préleveurs (`tous les sous-plans`, dashboard) → ils voient le nouveau volume avant que le coordinateur régional n'ait cliqué "Diffuser aux préleveurs".

---

## Tableau PPV (`REGIONAL`)

Profils : Admin, Coord. national, Coord. régional, Préleveur. Le préleveur n'a pas accès à l'onglet "Suivi des plans" (`canViewPlanTracking` exclut `Sampler`) — colonnes statut remplacées par "Volume/visibilité perçus".

| # | Action | Qui | Statut BGIR (Admin) | Statut BGIR (Coord nat) | Statut région (Coord nat) | Statut BGIR (Coord rég) | Statut région (Coord rég) | Préleveur — volume/visibilité |
|---|---|---|---|---|---|---|---|---|
| 1 | Saisie en cours | Coord national | En cours | En cours | — (pas encore reçu) | — | En attente | Plan invisible |
| 2 | Soumission à l'admin | Coord national | Terminé, à envoyer | Soumis à l'admin | En attente | — | En attente | Plan invisible |
| 3 | Admin soumet aux régions | Admin | Soumis aux régions | Soumis aux régions | Terminé, à envoyer (côté rég.) | Soumis aux régions | Terminé, à envoyer | Plan invisible |
| 4 | Coord régional diffuse aux préleveurs (1er envoi) | Coord régional | Soumis aux régions | Soumis aux régions | Diffusé aux préleveurs | Soumis aux régions | Diffusé aux préleveurs | **Volume X visible**, saisie ouverte |
| 5 | Coord national modifie le volume (pas encore soumis) | Coord national | Soumis aux régions | **Modifié, à envoyer** (ligne nationale) | Diffusé aux préleveurs (inchangé, rien commité) | Soumis aux régions | Diffusé aux préleveurs | **Toujours volume X** (comportement correct attendu — actuellement en fuite, voir bug) |
| 6 | Coord national resoumet à la région | Coord national | Soumis aux régions | Soumis aux régions (renvoyé) | **Modifié, à envoyer** *(needsResend, si déjà diffusé — cf. mécanique ci-dessus)* / En cours pour Admin | Soumis aux régions | **Modifié, à envoyer** (côté propriétaire région) | **Toujours volume X** tant que non diffusé — **actuellement volume Y (bug)** |
| 7 | Coord régional diffuse les modifications | Coord régional | Soumis aux régions | Soumis aux régions | Diffusé aux préleveurs | Soumis aux régions | Diffusé aux préleveurs | **Volume Y visible** (correct, seulement après ce clic) |

Notes :
- Ligne 5/6 : "Modifié, à envoyer" côté Coord national = ligne **nationale** (`nationalStatus.hasPendingChange`, il est propriétaire de cet échelon). Ce n'est pas la ligne région.
- Ligne 6, colonne "Coord rég" : le badge "Modifié, à envoyer" que la région voit **aujourd'hui** dépend du fait que `commitPendingNationalChanges` a déjà committé (comportement actuel, bug inclus) → `needsResend` + `hasPendingChange` masqué basculent ensemble. Si on corrige le bug (report du commit), il faut un mécanisme **alternatif** pour que la région voie quand même "à traiter" sans committer la ligne live (ex. étendre le masking `hasPendingChange` pour la région à partir d'un changement National *pending* ciblant sa région — **scopé à cette ligne précise**, pas au SQL `needsResend` global).

---

## Tableau DAOA (`SLAUGHTERHOUSE`)

Profils : Admin, Coord. national, Coord. régional, Coord. départemental, Préleveur.

| # | Action | Qui | Statut BGIR | Statut région (Coord rég, propriétaire) | Statut région (autres) | Statut dépt (Coord dépt, propriétaire) | Statut dépt (autres) | Préleveur |
|---|---|---|---|---|---|---|---|---|
| 1 | Saisie en cours | Coord national | En cours | En attente | En attente | En attente | En attente | Plan invisible |
| 2 | Soumission à l'admin | Coord national | Soumis à l'admin (Coord nat) / Terminé, à envoyer (Admin) | En attente | En attente | En attente | En attente | Plan invisible |
| 3 | Admin soumet aux régions | Admin | Soumis aux régions | Terminé, à envoyer | Terminé, à envoyer *(masqué → visible car needsSend piloté par `sentAt===null`, pas par hasPendingChange)* | En attente | En attente | Plan invisible |
| 4 | Coord régional soumet aux départements | Coord régional | Soumis aux régions | Soumis aux départements | Soumis aux départements | Terminé, à envoyer | Terminé, à envoyer *(idem, `sentAt===null`)* | Plan invisible |
| 5 | Coord départemental lance la campagne (1er envoi) | Coord départemental | Soumis aux régions | Soumis aux départements | Soumis aux départements | Diffusé aux préleveurs | Diffusé aux préleveurs | **Volume X visible** |
| 6 | Coord régional modifie la répartition département (pas encore soumis) | Coord régional | Soumis aux régions | **Modifié, à envoyer** (Coord rég, propriétaire) | Soumis aux départements (inchangé, rien commité) | Diffusé aux préleveurs (inchangé) | Diffusé aux préleveurs | Toujours volume X |
| 7 | Coord régional resoumet aux départements | Coord régional | Soumis aux régions | Soumis aux départements (renvoyé) | Soumis aux départements | **Modifié, à envoyer** (Coord dépt, propriétaire, via needsResend+hasPendingChange masqué) | **En cours** (via `needsResend` non masqué, `modified:true`) | Toujours volume X (correct — le département n'a pas encore relancé) |
| 8 | Coord départemental re-diffuse aux préleveurs | Coord départemental | Soumis aux régions | Soumis aux départements | Soumis aux départements | Diffusé aux préleveurs | Diffusé aux préleveurs | **Volume Y visible** |

Notes :
- DAOA n'a **pas** le bug initial : `commitPendingRegionalChanges`/`commitPendingDepartmentalChanges` écrivent la ligne département seulement à l'étape où le Coord départemental agit réellement (étape 5/8) — le préleveur lit toujours la ligne département (pas la ligne région), jamais écrite prématurément.
- Ligne 3/4 : le "Terminé, à envoyer" visible par les non-propriétaires vient de `sentAt === null` (1er envoi jamais fait), **pas** de `hasPendingChange` — donc pas de fuite de masquage ici, c'est correct par construction actuelle.
