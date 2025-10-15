import { Laboratories } from '../../../repositories/laboratoryRepository';

export const laboratoriesSeed = async () => {
  console.info('Seeding laboratories...');

  await Laboratories()
    .insert([
      {
        shortName: 'ANS 94a - LNR ETM',
        name: 'LNR ETM - Laboratoire de sécurité des aliments de Maisons-Alfort',
        address: '14, rue Pierre et Marie Curie',
        postalCode: '94701',
        city: 'MAISONS-ALFORT Cedex'
      },
      {
        shortName: 'ANS 94a - LNR PEST',
        name: 'LNR PESTICIDES Laboratoire de sécurité des aliments de Maisons-Alfort',
        address: '14, rue Pierre et Marie Curie',
        postalCode: '94701',
        city: 'MAISONS-ALFORT Cedex'
      },
      {
        shortName: 'CAP 29',
        name: 'Capinov',
        address: 'ZI de Lanrinou',
        postalCode: '29800',
        city: 'Landerneau'
      },
      {
        shortName: 'CER 30',
        name: 'CERECO',
        address: '3, rue Pierre Bautias ZA Aéropôle',
        postalCode: '30128',
        city: 'Garons'
      },
      {
        shortName: 'GIR 49',
        name: 'GIRPA',
        address: "9, avenue du Bois l'Abbé",
        postalCode: '49070',
        city: 'Beaucouzé'
      },
      {
        shortName: 'LDA 17',
        name: 'QUALYSE site de La Rochelle',
        address: '5 allée de l’Océan',
        postalCode: '17000',
        city: 'LA ROCHELLE'
      },
      {
        shortName: 'LDA 21',
        name: "Laboratoire Départemental de la Côte-d'Or",
        address: '2 ter, rue Hoche BP 71778',
        postalCode: '21017',
        city: 'DIJON Cedex'
      },
      {
        shortName: 'LDA 22',
        name: 'LABOCEA',
        address: 'Zoopole 7, rue du Sabot  -  CS 30 054',
        postalCode: '22440',
        city: 'PLOUFRAGAN'
      },
      {
        shortName: 'LDA 31',
        name: 'Laboratoire départemental Eau - Vétérinaire - Air LAUNAGUET',
        address: '76, chemin Boudou CS 50013',
        postalCode: '31140',
        city: 'LAUNAGUET'
      },
      {
        shortName: 'LDA 66',
        name: 'CAMP',
        address: '5002F, Rambla de la Thermodynamique',
        postalCode: '66100',
        city: 'Perpignan'
      },
      {
        shortName: 'LDA 72',
        name: 'Inovalys',
        address: '128, rue de Beaugé',
        postalCode: '72018',
        city: 'LE MANS Cedex 2'
      },
      {
        shortName: 'LDA 85',
        name: "Laboratoire de l'Environnement et de l'Alimentation de la Vendée (LEAV)",
        address: 'Rond Point Georges Duval CS 80802',
        postalCode: '85021',
        city: 'LA ROCHE SUR YON Cedex'
      },
      {
        shortName: 'LDA 87',
        name: "Laboratoire Départemental d'Analyses et de Recherches de la Haute-Vienne",
        address: 'Avenue du professeur Joseph Léobardy BP 50165',
        postalCode: '87005',
        city: 'LIMOGES Cedex'
      },
      {
        shortName: 'SCL 34',
        name: 'SCL Montpellier',
        address: '205, Rue de la Croix Verte',
        postalCode: '34090',
        city: 'Montpellier'
      },
      {
        shortName: 'SCL 91',
        name: "SCL d'Ile de France",
        address: '25, avenue de la République',
        postalCode: '91300',
        city: 'MASSY'
      }
    ])
    .onConflict()
    .ignore();
};
