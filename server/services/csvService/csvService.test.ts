/* eslint-disable no-irregular-whitespace */

import { faker } from '@faker-js/faker';
import { AnalysisRequestData } from 'maestro-shared/schema/Analysis/AnalysisRequestData';
import { CompanyFixture } from 'maestro-shared/test/companyFixtures';
import { Sample11Fixture } from 'maestro-shared/test/sampleFixtures';
import { Sampler1Fixture } from 'maestro-shared/test/userFixtures';
import { expect, test } from 'vitest';
import { csvService } from './csvService';

const data: AnalysisRequestData = {
  compliance200263: '',
  cultureKind: '',
  establishment: {
    fullAddress: '',
    name: ''
  },
  copyNumber: 1,
  itemNumber: 1,
  substanceKind: 'Any',
  laboratory: {
    emails: [''],
    id: '',
    name: 'Capinov',
    address: '',
    city: '',
    postalCode: '',
    shortName: 'CAP 29'
  },
  matrixLabel: '',
  matrixPart: '',
  monoSubstanceLabels: [],
  multiSubstanceLabels: [],
  quantity: 0,
  quantityUnit: '',
  recipientKind: 'Sampler',
  sampleId: '',
  sampledAtDate: '',
  sampledAtTime: '',
  sealId: '',
  supportDocumentId: undefined,
  matrixKindLabel: '',
  ...Sample11Fixture,
  sampler: Sampler1Fixture,
  company: { ...CompanyFixture, fullAddress: '' },
  sampledAt: '',
  context: '',
  legalContext: '',
  stage: '',
  department: '',
  ownerAgreement: true,
  matrixKind: 'A0D9Y',
  matrix: 'A031K',
  specificData: {
    programmingPlanKind: 'PPV',
    matrixPart: 'PART1',
    productionKind: 'PD07A',
    cultureKind: 'PD05A',
    matrixDetails: ''
  },
  geolocation: {
    x: faker.number.int(),
    y: faker.number.int()
  },
  laboratoryId: '',
  items: []
};

test('génère un CSV', async () => {
  const csv = await csvService.generateAnalysisRequestCsv(data);

  expect(csv.toString()).toMatchInlineSnapshot(`
    "Donneur d'ordre;
    Adresse;
    Préleveur;John Doe
    Email;john.doe@example.net
    Date de prélèvement;
    Heure de prélèvement;
    Numéro de prélèvement;GS-08-24-313-A
    Contexte du prélèvement;
    Cadre juridique;
    Entité contrôlée;Company 1
    Siret;11111111111111
    Identifiant Resytal;23-123456
    Département;
    Adresse;
    N° ou appellation de la parcelle;
    Note additionnelle;notes on creation
    Catégorie de matrice programmée;;A0D9Y
    Matrice;;A031K
    LMR/ Partie du végétal concernée;
    Détails de la matrice;
    Type de production;
    Type de culture;
    Stade de prélèvement;

    Laboratoire destinataire;CAP 29
    Analyses mono-résidu;
    Analyses multi-résidus dont;
    Note additionnelle;
    Échantillon n°;1
    Nombre;0
    Unité de mesure;
    Numéro de scellé;
    Directive 2002/63;Non respectée
    Note;"
  `);
});

test('génère un CSV avec le BOM pour Girpa', async () => {
  const csv = await csvService.generateAnalysisRequestCsv({
    ...data,
    laboratory: { ...data.laboratory, shortName: 'GIR 49', name: 'Girpa' }
  });

  expect(csv.toString()).toMatchInlineSnapshot(`
    "﻿Donneur d'ordre;
    Adresse;
    Préleveur;John Doe
    Email;john.doe@example.net
    Date de prélèvement;
    Heure de prélèvement;
    Numéro de prélèvement;GS-08-24-313-A
    Contexte du prélèvement;
    Cadre juridique;
    Entité contrôlée;Company 1
    Siret;11111111111111
    Identifiant Resytal;23-123456
    Département;
    Adresse;
    N° ou appellation de la parcelle;
    Note additionnelle;notes on creation
    Catégorie de matrice programmée;;A0D9Y
    Matrice;;A031K
    LMR/ Partie du végétal concernée;
    Détails de la matrice;
    Type de production;
    Type de culture;
    Stade de prélèvement;

    Laboratoire destinataire;GIR 49
    Analyses mono-résidu;
    Analyses multi-résidus dont;
    Note additionnelle;
    Échantillon n°;1
    Nombre;0
    Unité de mesure;
    Numéro de scellé;
    Directive 2002/63;Non respectée
    Note;"
  `);
});
