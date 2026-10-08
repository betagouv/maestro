# Masquage des données

Permettre l'accès à la base avec un utilisateur en lecture seule dont les colonnes
sensibles sont masquées par l'extension PostgreSQL Anonymizer.

## Fichiers

- `masking_rules.sql` — les règles, en `SECURITY LABEL FOR anon`.
- `maskingExceptions.ts` — les colonnes déclarées sans donnée sensible.
- `maskingCoverage.integration.test.ts` — refuse toute colonne absente des deux.

## Mise en place

1. Créer l'utilisateur en lecture seule avec la commande `database-users-create
   --read-only` de la CLI Scalingo.

2. Ouvrir un ticket au support Scalingo pour l'activation de l'extension et la
   configuration du rôle. L'extension n'est pas activable en libre-service.
   Vérifier au préalable que la version de l'addon est à jour.

3. Appliquer les règles :

   ```
   psql $DATABASE_URL -f masking_rules.sql
   ```

## À rejouer

Les règles sont portées par le catalogue et ne survivent ni à une réactivation de
l'extension, ni à une recréation des tables. Rejouer `masking_rules.sql` puis
exécuter les contrôles ci-dessous :

- après chaque montée de version PostgreSQL ;
- après toute restauration de la base.

Ces deux contrôles font partie de la procédure : ils ne sont pas facultatifs.

## Les règles

`masking_rules.sql` couvre six catégories.

**Identité de personne** — comptes utilisateurs, propriétaire du produit prélevé,
transporteur, contacts des laboratoires.

**Paramètres techniques d'authentification** — jetons de session et configuration
d'échange avec SACHA.

**Identité d'exploitant** — SIRET, raison sociale, nom commercial, adresse.

**Localisation fine** — géolocalisation et parcelle. La granularité publiée est
région / département, qui restent lisibles.

**Texte libre** — les champs de notes et de commentaires, sur une dizaine de
tables, ainsi que les colonnes `jsonb` dont le contenu n'est pas maîtrisé. Ils sont
annulés : rien ne permet de savoir ce qu'un agent y a saisi, donc aucune règle par
colonne ne saurait les traiter finement.

**Identifiants externes** — les références permettant de recouper avec d'autres
systèmes d'information.

### Fonctions déterministes

Les fonctions `pseudo_*` renvoient toujours la même valeur pour une même entrée et
une même clé. Leurs équivalents `fake_*` tirent une valeur au hasard à chaque
appel : deux requêtes successives donneraient des résultats différents, les
jointures sur SIRET deviendraient incohérentes et tout regroupement serait faux.
**Ne pas les substituer.** La documentation déconseille aussi les `fake_*` en
masquage dynamique, parce qu'elles lisent des tables internes auxquelles le rôle
masqué n'a pas accès.

**Les noms de ces fonctions changent entre versions de l'extension.** Les règles
ci-dessus visent `anon` **3.1.3** ; les versions plus récentes renomment les
`pseudo_*` en `seeded_*`, avec un argument `locale` supplémentaire. Après chaque
montée de version, vérifier ce qui existe réellement :

```sql
SELECT p.proname, pg_get_function_arguments(p.oid)
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'anon' AND p.proname LIKE 'pseudo_%' ORDER BY 1;
```

### Cohérence du SIRET

`companies.siret` est une clé primaire. Toutes les colonnes qui la portent — dans
`samples`, `user_companies`, `local_prescriptions`, `local_prescription_changes` et
`local_prescription_comments` — reçoivent la même fonction. En ajouter une nouvelle
sans l'inscrire ici casse les jointures.

### Emplacement du propriétaire

Les colonnes `owner_email`, `owner_first_name` et `owner_last_name` sont portées par
`samples`, pas par `sample_items` : la migration `026-sample-owner-data.ts` les y a
déplacées et `kysely.type.ts` n'a jamais été mis à jour. Se fier au schéma, pas au
typage.

## Les exceptions

`maskingExceptions.ts` énumère les colonnes qui n'ont pas à être masquées.
Y ajouter une entrée est une décision de sécurité : elle déclare que la colonne ne
contient rien de personnel ni de saisi librement, et doit être relue comme telle.

Quelques choix qui ne vont pas de soi :

- **Laboratoires** — nom et adresses restent lisibles, ce sont des organismes
  publics. Seuls leurs contacts et paramètres techniques sont masqués.
- **`analysis_residues.precise_method`** — désigne une méthode d'analyse
  normalisée, donc une information technique.
- **`sample_items.seal_id`** — numéro de scellé physique, il n'identifie pas un
  exploitant.

Les colonnes `uuid` ne sont pas contrôlées : ce sont des identifiants opaques, sans
contenu personnel. Certaines entrées du fichier portent malgré tout sur des colonnes
`uuid` et sont donc sans effet ; elles sont conservées pour que la décision reste
écrite si le type venait à changer.

## Contrôler

Connecté avec l'utilisateur Metabase :

```sql
SELECT siret, name FROM companies LIMIT 5;
SELECT email FROM users LIMIT 5;
SELECT notes_on_creation, geolocation FROM samples LIMIT 5;
```

Aucune valeur réelle ne doit apparaître, et la même requête répétée doit renvoyer
les mêmes valeurs.

Contrôler aussi les vues et les requêtes qualifiées, que le test de couverture ne
couvre pas — il ne porte que sur les tables :

```sql
SELECT notes, programming_instruction FROM programming_sub_plans LIMIT 5;
SELECT siret FROM public.companies LIMIT 5;
```

Vérifier également qu'une jointure sur un SIRET renvoie le même nombre de lignes
que depuis le rôle propriétaire :

```sql
SELECT count(*) FROM samples s JOIN companies c ON s.company_siret = c.siret;
```

## Ajouter une colonne

Le test de couverture échoue sur toute colonne de type texte, tableau, json ou
géométrie qui n'est ni masquée ni exceptée, et indique lesquelles. Choisir :

- donnée personnelle, identifiante ou saisie librement → règle dans
  `masking_rules.sql` ;
- sinon → entrée dans `maskingExceptions.ts`.

Le test vérifie aussi que chaque règle vise une colonne existante, afin qu'un
`masking_rules.sql` obsolète ne parte pas en production.
