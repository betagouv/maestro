# Référentiel des ateliers

La table `company_workshops` permet de préciser, lors d'un prélèvement, l'atelier
exact au sein de l'entité contrôlée. Elle est alimentée par import manuel en
production : l'application ne propose ni écran d'administration, ni fonction
d'import.

## L'import doit être en upsert

La clé primaire est un `uuid` généré par la base, et `samples.company_workshop_id`
la référence. Un rechargement qui recrée les lignes leur attribue de **nouveaux
uuid**, et tous les prélèvements déjà saisis perdent leur atelier.

Un index unique sur `(siret, ate_identifiant)` existe pour rendre l'upsert
possible :

```sql
INSERT INTO company_workshops (siret, ate_identifiant, ate_lb, ...)
VALUES (...)
ON CONFLICT (siret, ate_identifiant) DO UPDATE
  SET ate_lb = EXCLUDED.ate_lb, ...;
```

La clé étrangère depuis `samples` empêche par ailleurs de supprimer un atelier
déjà référencé par un prélèvement.

## Pas de clé étrangère vers `companies`

C'est délibéré. `companies` n'est pas un référentiel : c'est un cache alimenté au
fil des prélèvements par `companyRepository.upsert`. Le référentiel des ateliers
contient des SIRET d'établissements jamais prélevés, et une contrainte ferait
échouer l'import sur le premier d'entre eux.

Le rapprochement se fait donc par valeur de SIRET. Rien ne garantit qu'un `siret`
de `company_workshops` existe dans `companies` — sans conséquence à l'écran,
puisqu'on part toujours de l'entreprise sélectionnée.

## `ate_lb` porte le Nom SACHA complet

La colonne contient déjà la chaîne attendue par SACHA, de la forme
`DOSDSV-72080002ABATTOIR-Viande de boucherie - Amont - Chaîne d'abattage…`.
Elle n'est pas recomposée à l'envoi, et sert telle quelle à l'affichage dans la
liste proposée au préleveur — d'où un libellé verbeux, assumé.

## Correspondance avec le flux SACHA

`sachaDAI.ts` alimente `ReferenceEtablissementType` depuis ces colonnes :

| Balise                                    | Colonne                    |
| ----------------------------------------- | -------------------------- |
| `ReferenceEtablissement/SigleIdentifiant` | `type_ident_eta`           |
| `ReferenceEtablissement/Identifiant`      | `eta_id`                   |
| `ReferenceEtablissement/Nom`              | `eta_lb`                   |
| `Adresse1`                                | `adr_ligne1`               |
| `CodePostal`                              | `cp_etab` + `commune_etab` |
| `ReferenceAtelier/SigleIdentifiant`       | `ide_lb`                   |
| `ReferenceAtelier/Identifiant`            | `ate_identifiant`          |
| `ReferenceAtelier/Nom`                    | `ate_lb`                   |

`Adresse2`, `Telephone` et `Pays` restent vides : l'import n'en fournit pas la
source.

Si l'atelier est absent, ou si `type_ident_eta`, `eta_id` ou `eta_lb` sont nuls,
le bloc revient à sa forme antérieure — `SIRET` et nom d'entreprise, sans
`ReferenceAtelierType`.

`ide_lb` alimente un `SigleIdentifiant` que le format déclare obligatoire. Une
valeur nulle produit une chaîne vide : à surveiller selon la complétude de la
source.
