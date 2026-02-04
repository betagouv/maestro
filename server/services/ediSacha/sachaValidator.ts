import { maestroDateRefined } from 'maestro-shared/utils/date';
import { z } from 'zod';
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
const typeValidator = z.literal(['G', 'S']);
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
      NumeroEtiquette: z.string().optional(),
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
const referenceMatricesGeneriques = z.object({
  Cle: z.string(),
  Sigle: z.string(),
  Libelle: z.string(),
  Statut: statusValidator,
  Type: typeValidator,
  LibelleFamille: z.string(),
  LibelleEspece: z.string().optional(),
  CleRemplacement: z.string().optional(),
  Commentaire: z.string().optional()
});
const referenceAnalytes = z.object({
  Cle: z.string(),
  Sigle: z.string(),
  Libelle: z.string(),
  Statut: statusValidator,
  Type: typeValidator,
  LibelleFamille: z.string(),
  LibelleMaladie: z.string().optional(),
  CleRemplacement: z.string().optional(),
  Commentaire: z.string().optional()
});
const referenceUnites = coerceToArray(
  z.object({
    Cle: z.string(),
    Sigle: z.string(),
    Libelle: z.string(),
    Statut: statusValidator,
    CleRemplacement: z.string().optional(),
    Commentaire: z.string().optional()
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

const referenceMethodes = z.object({
  Cle: z.string(),
  Sigle: z.string(),
  Libelle: z.string(),
  Statut: statusValidator,
  Type: typeValidator,
  LibelleFamille: z.string(),
  CleRemplacement: z.string().optional(),
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
const referenceCommemoratifs = coerceToArray(
  z.object({
    SigleCommemoratif: z.string(),
    Commentaire: z.string().optional()
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

export const sachaValidator = z.object({
  DemandesAnalyses: demandesAnalysesValidator.optional(),
  DonneesStandardisees: z
    .object({
      MessageParametres: messageParametres,
      ReferenceMatricesType: coerceToArray(
        z.object({
          ReferenceMatricesGeneriques: referenceMatricesGeneriques,
          ReferenceMatricesSpecifiques: coerceToArray(
            referenceMatricesGeneriques
          ).optional()
        })
      ).optional(),
      ReferenceAnalytesType: coerceToArray(
        z.object({
          ReferenceAnalytesGeneriques: referenceAnalytes,
          ReferenceAnalytesSpecifiques:
            coerceToArray(referenceAnalytes).optional()
        })
      ).optional(),
      ReferenceMethodesType: coerceToArray(
        z.object({
          ReferenceMethodesGeneriques: referenceMethodes,
          ReferenceMethodesSpecifiques:
            coerceToArray(referenceMethodes).optional()
        })
      ).optional(),
      ReferenceUnites: referenceUnites,
      ReferenceValeursInterpretation: referenceUnites,
      ReferenceValeursPossiblesResultat: referenceUnites,
      ReferenceCausesNonAnalysibilite: referenceUnites,
      ReferenceCommemoratifType: coerceToArray(
        z.object({
          ReferenceCommemoratif: z.object({
            Cle: z.string(),
            Sigle: z.string(),
            Libelle: z.string(),
            Statut: statusValidator,
            CleRemplacement: z.string().optional(),
            Commentaire: z.string().optional(),
            Unite: z.string().optional(),
            TypeDonnee: z.literal(['V', 'N', 'A', 'D'])
          }),
          ReferenceCommemoratifsValeurs: referenceUnites
        })
      ).optional()
    })
    .optional(),
  ReferentielPrescripteur: z
    .object({
      MessageParametres: messageParametres,
      Emetteur: partenaire,
      ReferencePlanAnalyseType: coerceToArray(
        z.object({
          ReferencePlanAnalyse: z.object({
            Cle: z.string(),
            Sigle: z.string(),
            Libelle: z.string(),
            Statut: statusValidator,
            Contact: z.string().optional(),
            TexteReference: z.string().optional(),
            NiveauInterpretation: z
              .literal(['AE', 'AL', 'PE', 'PL'])
              .optional(),
            DateModification: sachaDateTime
          }),
          ReferenceCommemoratifsAnalyse: referenceCommemoratifs,
          ReferencePlanAnalyseContenu: referencePlanAnalyseContenu,
          ReferencePlanAnalyseInterpretation: coerceToArray(
            z.object({
              LibelleMatrice: z.string().optional(),
              SigleAnalyte: z.string(),
              SigleMethodeSpecifique: z.string().optional(),
              Depistage: booleanLabel,
              Confirmation: booleanLabel,
              Statut: statusValidator,
              NombreEchantillonParLot: z.coerce.number().int(),
              SigleUnite: z.string().optional(),
              SeuilConfirmationQuantitatif: z.coerce.number().optional(),
              SigleSeuilConfirmationQualitatif: z.string().optional(),
              LibelleSeuil2: z.string().optional(),
              Seuil2Qualitatif: z.string().optional(),
              Seuil2Quantitatif: z.coerce.number().optional(),
              LibelleSeuil1: z.string().optional(),
              Seuil1Quantitatif: z.coerce.number().optional(),
              SigleInterpretationInferieurSeuil1: z.string().optional(),
              SigleInterpretationEntreSeuils: z.string().optional(),
              SigleInterpretationSuperieurSeuil2: z.string().optional(),
              NombreToleresSeuil2: z.coerce.number().int().optional(),
              NombreToleresSuperieursSeuil2: z.coerce.number().int().optional(),
              Commentaire: z.string().optional()
            })
          ).optional()
        })
      ).optional(),
      ReferenceContextesType: coerceToArray(
        z.object({
          ReferenceContextesIntervention: z.object({
            Cle: z.string(),
            Sigle: z.string(),
            Libelle: z.string(),
            Statut: statusValidator,
            DateModification: sachaDateTime
          }),
          ReferenceCommemoratifsInterventionContexte: referenceCommemoratifs,
          ReferenceCommemoratifsEchantillonContexte: referenceCommemoratifs,
          ReferencePlansAnalyseContexte: coerceToArray(
            z.object({ SiglePlanAnalyse: z.string() })
          ).optional()
        })
      ).optional(),
      ReferenceTypesIdentifiants: coerceToArray(
        z.object({
          Cle: z.string(),
          Sigle: z.string(),
          Libelle: z.string(),
          Statut: statusValidator
        })
      ).optional()
    })
    .optional(),
  Resultats: resultatsValidator.optional(),
  AcquittementNonAcquittement: acquittementValidator.optional(),
  DemandesDeDemande: z
    .object({
      ...baseValidator.shape,
      DialogueDemandeDeDemande: z.tuple(
        [z.object({ NumeroDAP: z.coerce.number().int() })],
        z.object({ NumeroDAP: z.coerce.number().int() })
      )
    })
    .optional()
});
