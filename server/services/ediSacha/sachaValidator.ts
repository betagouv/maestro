import { maestroDateRefined } from 'maestro-shared/utils/date';
import { z } from 'zod';
import { NumeroEtiquette } from './sachaReferences';
import {
  sigleContexteInterventionValidator,
  sigleMatrixValidator,
  siglePlanAnalyseValidator
} from './sachaReferential';

// FIXME EDI à supprimer et remplir correctement isArray de XMLParser
const coerceToArray = <Schema extends z.ZodObject>(
  schema: Schema
): z.ZodArray<Schema> => {
  return z.codec(z.array(schema).or(schema), z.array(schema), {
    encode: (value) => value as z.infer<Schema>[],
    decode: (value) => {
      if (Array.isArray(value)) {
        return value as z.input<Schema>[];
      } else {
        return [value] as z.input<Schema>[];
      }
    }
  }) as unknown as z.ZodArray<Schema>;
};

// 1900-01-01
const sachaDate = maestroDateRefined;

// 1900-01-01T00:00:00
const sachaDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
  .brand<'SachaDateTime'>();

export const toSachaDateTime = (date: Date): z.infer<typeof sachaDateTime> => {
  // Use the Sweden locale because it uses the ISO format
  const dateString = `${date.toLocaleDateString('sv', { timeZone: 'Europe/Paris' })}T${date.toLocaleTimeString('sv', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Paris' })}`;
  const parsedDate = sachaDateTime.safeParse(dateString);
  if (parsedDate.success) {
    return parsedDate.data;
  }

  throw new Error(
    `Shouldn't get here (invalid toDateStr provided): ${date} ${dateString} ${parsedDate.error}`
  );
};

const booleanLabel = z.codec(z.literal(['O', 'N']), z.boolean(), {
  decode: (b) => b === 'O',
  encode: (b) => (b ? 'O' : 'N')
});

const statusValidator = z.literal(['G', 'V']);
const indicateurPrelevementPartielValidator = z.literal(['C', 'P', 'F']);

const referenceEtablissement = z.object({
  SigleIdentifiant: z.string(),
  Identifiant: z.string(),
  Nom: z.string(),
  Adresse1: z.string().optional(),
  Adresse2: z.string().optional(),
  Adresse3: z.string().optional(),
  BoitePostale: z.string().optional(),
  CodePostal: z.string().optional(),
  Telephone: z.string().optional(),
  Fax: z.string().optional(),
  Email: z.string().optional(),
  Pays: z.string().optional()
});
const dialogueCommemoratif = coerceToArray(
  z.object({
    Sigle: z.string(),
    TexteValeur: z.string().optional(),
    SigleValeur: z.string().optional()
  })
).optional();
const dialogueEchantillonCommemoratifType = coerceToArray(
  z.object({
    DialogueEchantillonComplet: z.object({
      NumeroEchantillon: z.coerce.number().int(),
      SigleMatriceSpecifique: sigleMatrixValidator,
      NumeroIdentificationExterne: z.string().optional(),
      IdentifiantLabo: z.string().optional(),
      NumeroLot: z.coerce.number().int().optional(),
      NumeroEtiquette: NumeroEtiquette.optional(),
      DateRealisationPrelevement: sachaDate.optional(),
      SigleMotifNonAnalysabilite: z.string().optional(),
      Commentaire: z.string().optional()
    }),
    DialogueCommemoratif: dialogueCommemoratif
  })
).optional();
const referencePlanAnalyseEffectuer = z.object({
  SiglePlanAnalyse: siglePlanAnalyseValidator,
  EditionRapports: z.literal(['A', 'T', 'P']).optional(),
  LibelleDestinataireEchantillon: z.string().optional(),
  LigneBudgetaire: z.string().optional(),
  Commentaire: z.string().optional(),
  PlanComplet: booleanLabel.optional(),
  DateModification: sachaDateTime.optional(),
  DateDebutExecution: sachaDate.optional(),
  DateFinExecution: sachaDate.optional()
});
const messageParametres = z.object({
  CodeScenario: z.string(),
  VersionScenario: z.string(),
  TypeFichier: z.string(),
  NomFichier: z.string(),
  VersionReferenceStandardisees: z.string().optional(),
  VersionReferencePrescripteur: z.string().optional(),
  NomLogicielCreation: z.string(),
  VersionLogicielCreation: z.string(),
  CodeReferentielPrescripteur: z.string().optional()
});
const dialogueEchantillonSimple = coerceToArray(
  z.object({ NumeroEchantillon: z.coerce.number().int() })
).optional();

const dialogueAnalyseType = coerceToArray(
  z.object({
    DialogueAnalyse: z.object({
      SigleMatriceSpecifique: z.string(),
      SigleAnalyte: z.string(),
      SigleMethodeSpecifique: z.string()
    }),
    DialogueEchantillonSimple: dialogueEchantillonSimple
  })
).optional();
const referencePlanAnalyseContenu = z.object({
  LibelleMatrice: z.string(),
  SigleAnalyte: z.string(),
  SigleMethodeSpecifique: z.string(),
  Depistage: booleanLabel,
  Confirmation: booleanLabel,
  Statut: statusValidator,
  Commentaire: z.string().optional()
});

const partenaire = z.object({
  Sigle: z.string(),
  Nom: z.string().optional(),
  Telephone: z.string().optional(),
  LibellePartenaire: z.string(),
  EmailPartenaire: z.string()
});
const dialogueResultatLot = coerceToArray(
  z.object({
    NumeroLot: z.coerce.number().int(),
    SigleConclusion: z.string()
  })
).optional();
export const baseValidator = z.object({
  MessageParametres: messageParametres,
  Emetteur: partenaire,
  Destinataire: partenaire
});

const resultatsValidator = z.object({
  ...baseValidator.shape,
  DialogueResultatType: z.intersection(
    z.union([
      z.object({
        DialogueRetourInterventionSansDAP: z.object({
          SigleTypeIdentifiantActeur: z.string(),
          IdentifiantActeur: z.string(),
          DateInterventionReelle: sachaDate,
          SigleTypeIdentifiantEtablissement: z.string(),
          IdentifiantEtablissement: z.string(),
          SigleTypeIdentifiantAtelier: z.string().optional(),
          IdentifiantAtelier: z.string().optional(),
          SigleContexteIntervention: z.string(),
          IndicateurPrelevementPartiel: indicateurPrelevementPartielValidator,
          DossierComplet: booleanLabel
        })
      }),
      z.object({
        DialogueRetourInterventionAvecDAP: z.object({
          NumeroDAP: z.coerce.number().int(),
          SigleTypeIdentifiantActeur: z.string(),
          IdentifiantActeur: z.string(),
          DateInterventionReelle: sachaDate,
          IndicateurPrelevementPartiel: indicateurPrelevementPartielValidator,
          DossierComplet: booleanLabel
        })
      })
    ]),
    z.object({
      DialogueCommemoratif: dialogueCommemoratif,
      DialogueEchantillonCommemoratifType: dialogueEchantillonCommemoratifType,
      DialoguePlanAnalyseType: z
        .array(
          z.object({
            ReferencePlanAnalyseEffectuer: referencePlanAnalyseEffectuer,
            DialogueAnalyseType: z
              .array(
                z.object({
                  DialogueAnalyse: z.object({
                    SigleMatriceSpecifique: z.string(),
                    SigleAnalyte: z.string(),
                    SigleMethodeSpecifique: z.string()
                  }),
                  DialogueCommemoratif: dialogueCommemoratif,
                  DialogueResultatEchantillonAnalyse: z
                    .array(
                      z.object({
                        IdentifiantLabo: z.string(),
                        NumeroDossierLIMS: z.string(),
                        IndicateurAnalyseConfirmation: booleanLabel.optional(),
                        OperateurResultatQuantitatif: z
                          .literal([
                            '>>',
                            '>',
                            '>=',
                            '=',
                            '<=',
                            '<',
                            '<<',
                            '<>',
                            'ne',
                            ''
                          ])
                          .optional(),
                        ValeurResultatQuantitatif: z.coerce.number().optional(),
                        SigleValeurResultatQualitatif: z.string().optional(),
                        SigleUnite: z.string().optional(),
                        SigleConclusionElementaire: z.string().optional(),
                        LibelleLaboratoireSousTraitant: z.string().optional(),
                        DateValidation: sachaDate,
                        Commentaire: z.string().optional(),
                        IncertitudePourcentage: z.coerce.number().optional(),
                        IncertitudeMini: z.coerce.number().optional(),
                        IncertitudeMaxi: z.coerce.number().optional()
                      })
                    )
                    .optional(),
                  DialogueResultatLotAnalyse: dialogueResultatLot
                })
              )
              .optional(),
            DialogueResultatEchantillonPlan: coerceToArray(
              z.object({
                IdentifiantLabo: z.string(),
                SigleConclusion: z.string()
              })
            ).optional(),
            DialogueResultatLotPlan: dialogueResultatLot
          })
        )
        .optional(),
      DialogueAnalyseType: dialogueAnalyseType
    })
  )
});

export type SachaResultats = z.infer<typeof resultatsValidator>;

export const resultatsMessageValidator = z.object({
  Resultats: resultatsValidator
});

export const demandesAnalysesValidator = z.object({
  ...baseValidator.shape,
  DemandeType: z.object({
    DialogueDemandeIntervention: z.object({
      NumeroDAP: z.coerce.number().int(),
      SigleContexteIntervention: sigleContexteInterventionValidator,
      DateIntervention: sachaDate,
      DateModification: sachaDateTime
    }),
    DialogueCommemoratif: dialogueCommemoratif,
    ReferenceEtablissementType: z.object({
      ReferenceEtablissement: referenceEtablissement,
      DialogueCommemoratif: dialogueCommemoratif,
      ReferenceAtelierType: z
        .object({
          ReferenceAtelier: referenceEtablissement,
          DialogueCommemoratif: dialogueCommemoratif
        })
        .optional()
    }),
    DialogueActeurType: z.object({
      DialogueActeur: referenceEtablissement,
      DialogueActeurRessource: z
        .object({
          NumeroIdentifiant: z.string(),
          Libelle: z.string(),
          Initiales: z.string().optional(),
          Telephone: z.string().optional()
        })
        .optional()
    }),
    DialogueEchantillonCommemoratifType: dialogueEchantillonCommemoratifType,
    DialoguePrevisionnelEchantillon: coerceToArray(
      z.object({
        SigleMatriceSpecifique: z.string(),
        Nombre: z.coerce.number().int()
      })
    ).optional(),
    ReferencePlanAnalyseType: z.object({
      ReferencePlanAnalyseEffectuer: referencePlanAnalyseEffectuer,
      ReferencePlanAnalyseContenu: referencePlanAnalyseContenu,
      DialogueEchantillonSimple: dialogueEchantillonSimple
    }),
    DialogueAnalyseType: dialogueAnalyseType
  })
});

export const acquittementValidator = z.object({
  ...baseValidator.shape,
  MessageAcquittement: coerceToArray(
    z.object({ NomFichier: z.string(), DateAcquittement: sachaDateTime })
  ).optional(),
  MessageNonAcquittement: coerceToArray(
    z.object({
      NomFichier: z.string(),
      LibelleMotif: z.string(),
      TypeMotif: z.string().optional(),
      DateNonAcquittement: sachaDateTime
    })
  ).optional()
});
export type Acquittement = z.infer<typeof acquittementValidator>;

export const acquittementMessageValidator = z.object({
  AcquittementNonAcquittement: acquittementValidator
});
