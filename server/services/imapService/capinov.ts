import { groupBy } from 'lodash-es';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { maestroDate } from 'maestro-shared/utils/date';
import { z } from 'zod';
import { ExtractError } from './extractError';
import {
  ExportAnalysis,
  ExportDataFromEmail,
  ExportResultNonQuantifiable,
  ExportResultQuantifiable,
  LaboratoryConf
} from './index';
import { csvToJson, frenchNumberStringValidator } from './utils';

const unknownReferences = [
  'Cyprosulfamide',
  'Difethialone',
  'Ethofumesate-metabolite (Ethofumesate-open-ring expr. as ethofumesate)',
  'Ethyl-phosphite',
  'Metobromuron metabolite (desmethyl-metobromuron expr. as metobromuron)',
  'Metyltetraprole metabolite ISS7',
  'Pyroxasulfone',
  'Triflumizole (+ Triflumizole-amino (FM6-1) expr. as triflumizole)'
];

const capinovReferential: Record<string, SSD2Id> = {
  // Références associées manuellement
  'Abamectin (Avermectin B1a, B1b & Avermectin B1a (8,9,z) expr. as avermectin B1a)':
    'RF-00004655-PAR',
  'Aldicarb (sum of aldicarb, its sulfoxide and its sulfone expr. as aldicarb)':
    'RF-0020-001-PPP',
  'Amitraz-metabolites (DMF + DMPF expr. as amitraz)': 'RF-0024-001-PPP',
  'Benalaxyl (incl. benalaxyl-M)': 'RF-0038-001-PPP',
  'Bentazone (+ free 6/8-hydroxy-bentazone expr. as bentazone)':
    'RF-0042-001-PPP',
  'Benthiavalicarb-isopropyl': 'RF-00004656-PAR',
  Bispyribac: 'RF-0507-001-PPP',
  'Bromoxynil (+salts)': 'RF-00003327-PAR',
  Bromuconazole: 'RF-0054-001-PPP',
  'Captan + tetrahydrophtaIimide expr. as captan': 'RF-00004681-PAR',
  Carbetamide: 'RF-00012044-PAR',
  'Carbofuran (+ 3-hydroxy-carbofuran expr. as carbofuran)': 'RF-0065-002-PPP',
  'Carboxin (+Carboxin-sulfoxide + carboxin-sulfone (Oxycarboxin) expr. as carboxin)':
    'RF-00011559-PAR',
  'Carfentrazone-ethyl (sum of carfentrazone-ethyl and carfentrazone, expr. as carfentrazone-ethyl)':
    'RF-00012874-PAR',
  'Chlordane (cis + trans)': 'RF-0075-001-PPP',
  'Chloridazon (+-desphenyl expr. as chloridazon)': 'RF-00005729-PAR',
  'Chlorpyrifos-methyl (+desmethyl expr. as chlorpyriphos methyl)':
    'RF-00007588-PAR',
  'Clethodim (+ -sulfone + -sulfoxide + sethoxydim expr. as sethoxydim)':
    'RF-0096-001-PPP',
  'Clodinafop (incl. S-clodinafop + sels)': 'RF-0097-001-PPP',
  Cloquintocet: 'RF-0568-001-PPP',
  'Cyflufenamid (sum of E & Z isomers)': 'RF-0107-001-PPP',
  'Cyfluthrin (incl. cyfluthrin-beta - sum of isomers)': 'RF-0108-001-PPP',
  Cyhalofop: 'RF-00003378-PAR',
  'Cyhalothrin-lambda': 'RF-1004-001-PPP',
  'Cypermethrin (incl. alphamethrin - sum of isomers)': 'RF-0112-001-PPP',
  "DDT (sum of isomers DDT op'+ DDT pp' + DDD pp' + DDE pp')":
    'RF-0119-001-PPP',
  'Diclofop (+ -methyl expr. as diclofop-methyl)': 'RF-00012875-PAR',
  'Aldrin + dieldrin (expr. as dieldrin)': 'RF-0021-001-PPP',
  'Dimethenamid (incl. dimethenamid-P)': 'RF-0137-002-PPP',
  'Dinocap-meptyl': 'RF-00002838-PAR',
  'Disulfoton-metabolite (-sulfone expr. as disulfoton)': 'RF-0149-004-PPP',
  'Disulfoton-metabolite (-sulfoxide expr. as disulfoton)': 'RF-0149-003-PPP',
  'Disulfoton (+ -sulfoxide + -sulfone expr. as disulfoton)': 'RF-0149-001-PPP',
  'Emamectine B1a': 'RF-00014212-PAR',
  'Endosulfan (sum of isomers)': 'RF-0155-001-PPP',
  'Ethofumesate (+ Ethofumesate-2-keto + Ethofumesate-open-ring expr. as ethofumesate)':
    'RF-00005724-PAR',
  'Fenamiphos (+ -sulfoxide + -sulfone expr. as fenamiphos)': 'RF-0173-001-PPP',
  Fenbuconazole: 'RF-00012045-PAR',
  Fenpropimorph: 'RF-0185-001-PPP',
  'Fenthion-oxon (expr. as fenthion)': 'RF-0187-004-PPP',
  'Fenthion (+metabolites expr. as fenthion)': 'RF-0187-001-PPP',
  'Fenvalerate / Esfenvalerate': 'RF-0690-006-PPP',
  'Fipronil (+ -sulfone expr. as fipronil)': 'RF-0192-001-PPP',
  'Flonicamid-metabolite (TFNG expr. as flonicamid)': 'RF-00003349-PAR',
  'Flonicamid-metabolite (TFNA expr. as flonicamid)': 'RF-00003348-PAR',
  'Flonicamid (+ TFNA + TNFG expr. as flonicamid)': 'RF-00004683-PAR',
  'Fluazifop-P (+isomers of fluazifop)': 'RF-00005730-PAR',
  'Fluazifop-P ( + -butyl expr. as fluazifop)': 'RF-0197-002-PPP',
  Flucythrinate: 'RF-0201-002-PPP',
  Flurochloridone: 'RF-00011881-PAR',
  'Fluroxypyr (+-meptyl, expr. as fluroxypyr)': 'RF-0215-002-PPP',
  'Folpet + phtalimide expr. as folpet': 'RF-00004687-PAR',
  'Fenchlorphos (+ -oxon expr. as fenchlorphos)': 'RF-0178-001-PPP',
  'Halauxifen-methyl (+ Halauxifen expr. as halauxifen-methyl)':
    'RF-00004666-PAR',
  'Haloxyfop (+-methyl +--2-ethoxyethyl expr. as haloxyfop)': 'RF-00004667-PAR',
  'Heptachlor (sum of isomers)': 'RF-0236-001-PPP',
  'Heptachlor-epoxyde-trans (expr. as heptachlor)': 'RF-0236-005-PPP',
  Hexythiazox: 'RF-00013472-PAR',
  'Imazamox (+salts)': 'RF-0247-001-PPP',
  'Indoxacarb (S & R)': 'RF-0251-001-PPP',
  'Iodosulfuron-methyl (+salts)': 'RF-0252-001-PPP',
  'Ioxynil (+salts)': 'RF-00011560-PAR',
  'Isopyrazam (sum of isomers)': 'RF-00000025-PAR',
  'Isoxaflutole (+ Isoxaflutole diketonitrile RPA 202248 expr. as Isoxaflutole)':
    'RF-0259-001-PPP',
  'Malathion (+ malaoxon expr. as malathion)': 'RF-0266-001-PPP',
  Mandipropamid: 'RF-00012047-PAR',
  'MCPA + MCPB (expr. as MCPA)': 'RF-0271-004-PPP',
  'Mecoprop (incl. Mecoprop-p)': 'RF-0273-001-PPP',
  'Metalaxyl (incl. metalaxyl-M = mefenoxam)': 'RF-0281-001-PPP',
  'Metazachlor metabolite (479M04 expr.as metazachlor)': 'RF-00003323-PAR',
  'Metazachlor metabolite (479M08 expr.as metazachlor)': 'RF-00003324-PAR',
  'Metazachlor metabolite (479M16 expr.as metazachlor)': 'RF-00003325-PAR',
  'Metazachlor  : 479M04 + 479M08 + 479M16 expr. as metazachlor':
    'RF-00003344-PAR',
  'Methiocarb-metabolite (-sulfoxide expr. as methiocarb)': 'RF-0291-003-PPP',
  'Methiocarb (+ -sulfoxide + -sulfone expr. as methiocarb)': 'RF-0291-001-PPP',
  'Metobromuron (+ desmethyl-metobromuron + 4-bromophenylurea expr. as metobromuron)':
    'RF-00014532-PAR',
  'Metolachlor (incl. S-metolachlor)': 'RF-00002611-PAR',
  Mevinphos: 'RF-0302-001-PPP',
  'Milbemectin (milbemycin A3 + A4 expr. as milbemectin)': 'RF-00003018-PAR',
  Myclobutanil: 'RF-00012801-PAR',
  '1-Naphtylacetic acid + 1-Naphthylacetamide (+ salts expr. as 1-naphtylacetic acid)':
    'RF-00005728-PAR',
  Napropamide: 'RF-00012802-PAR',
  'Oxydemeton-methyl (+ demeton-S-methyl-sulfone expr. as ODM)':
    'RF-0323-001-PPP',
  Paclobutrazol: 'RF-00012043-PAR',
  'Parathion-methyl (+paraoxon-methyl expr. as parathion-methyl)':
    'RF-0328-001-PPP',
  'Pencycuron (+ Pencycuron-PB-amine expr. as pencycuron)': 'RF-00012803-PAR',
  'Phorate-metabolite (Phorate-oxon-sulfone expr. as phorate)':
    'RF-0336-006-PPP',
  'Phorate-metabolite (Phorate-oxon-sulfoxide expr. as phorate)':
    'RF-0336-007-PPP',
  'Phorate-metabolite (Phorate-sulfone expr. as phorate)': 'RF-0336-002-PPP',
  'Phorate-metabolite (Phorate-sulfoxide expr. as phorate)': 'RF-0336-004-PPP',
  'Phorate (+ Phorate-oxon + Phorate-oxon-sulfone + Phorate-oxon-sulfoxide + Phorate-sulfone +  Phorate-sulfoxide expr. as phorate)':
    'RF-0336-001-PPP',
  'Phosmet (+ -oxon expr. as phosmet)': 'RF-0338-001-PPP',
  'Prochloraz-metabolite (BTS 44595/M201-04 expr. as prochloraz)':
    'RF-00003328-PAR',
  'Prochloraz-metabolite (BTS 44596/M201-03 expr. as prochloraz)':
    'RF-00003329-PAR',
  'Prochloraz (prochloraz + BTS 44595 (M201-04) + BTS 44596 (M201-03), expr. as prochloraz)':
    'RF-00012032-PAR',
  'Prohexadione-calcium (+salts)': 'RF-0352-001-PPP',
  Propachlor: 'RF-0353-001-PPP',
  Propamocarb: 'RF-0354-001-PPP',
  'Propoxycarbazone (+ hydroxypropoxycarbazone expr. as propoxycarbazone)':
    'RF-0362-001-PPP',
  'Pyraflufen (expr. as pyraflufen-ethyl)': 'RF-00003366-PAR',
  'Pyraflufen-ethyl (+ pyraflufen expr. as pyraflufen-ethyl)':
    'RF-00003367-PAR',
  'Pyrethrin (cinerin I / II + jasmolin I / II + pyrethrin I / II)':
    'RF-0374-001-PPP',
  'Pyridate (+metabolite expr. as pyridate)': 'RF-0376-001-PPP',
  'Quintozene (+ pentachloroaniline expr. as quintozene)': 'RF-0383-001-PPP',
  'Quizalofop-ethyl (incl. quizalofop-P-ethyl)': 'RF-0887-001-PPP',
  'Quizalofop (incl. quizalofop-P)': 'RF-0384-004-PPP',
  Sedaxane: 'RF-00012869-PAR',
  Spinetoram: 'RF-00013247-PAR',
  'Spinosad (spynosyn A & D)': 'RF-0393-001-PPP',
  'Spirotetramat-metabolite (BYI08330-enol expr. as spirotetramat)':
    'RF-00003331-PAR',
  'Spirotetramat-metabolite (BYI08330-ketohydroxy expr. as spirotetramat)':
    'RF-00003332-PAR',
  'Spirotetramat-metabolite (BYI08330-monohydroxy expr. as spirotetramat)':
    'RF-00003333-PAR',
  'Spirotetramat-metabolite (BYI08330 enol-glucoside expr. as spirotetramat)':
    'RF-00003330-PAR',
  'Spirotetramat (+ 4 metabolites expr. as spirotetramat)': 'RF-0396-001-PPP',
  Sulfoxaflor: 'RF-00004679-PAR',
  Tefluthrin: 'RF-00013463-PAR',
  'Tembotrione (+ Tembotrione-4,6-dihydroxy AE 1417268 expr. as tembotrione)':
    'RF-00012293-PAR',
  'Tolyfluanid (+ DMST expr. as tolyfluanid)': 'RF-0425-001-PPP',
  Triadimenol: 'RF-00005717-PAR',
  'Triflumizole-metabolite (Triflumizole-amino (FM6-1) expr. as triflumizole)':
    'RF-0440-001-PPP',
  'Triflusulfuron (IN-M7222)': 'RF-00005716-PAR',
  'Tritosulfuron-metabolite (AMTT)': 'RF-00005711-PAR',

  // Références associées automatiquement via le label ou le cas number
  'Avermectin B1a': 'RF-0011-003-PPP',
  'Avermectin B1b expr. as avermectin B1a': 'RF-0011-004-PPP',
  'Avermectin B1a (8,9,z) expr. as avermectin B1a': 'RF-0011-002-PPP',
  Acephate: 'RF-0012-001-PPP',
  Acequinocyl: 'RF-0013-001-PPP',
  Acetamiprid: 'RF-0014-001-PPP',
  Acetochlor: 'RF-0015-001-PPP',
  'Acibenzolar-S-methyl': 'RF-0016-002-PPP',
  Aclonifen: 'RF-0017-001-PPP',
  Acrinathrin: 'RF-0018-001-PPP',
  Alachlor: 'RF-0019-001-PPP',
  Aldicarb: 'RF-0020-002-PPP',
  'Aldicarb-métabolite (aldicarb sulfone)': 'RF-0020-004-PPP',
  'Aldicarb - métabolite (aldicarb sufloxide)': 'RF-0020-003-PPP',
  'Aldrin (expr. as dieldrin)': 'RF-0021-002-PPP',
  'Alloxydim-sodium': 'RF-0465-001-PPP',
  Ametoctradin: 'RF-1055-001-PPP',
  Ametryn: 'RF-0467-001-PPP',
  Amisulbrom: 'RF-0470-001-PPP',
  Amidosulfuron: 'RF-0022-001-PPP',
  '2,4-dimethylformamidine (DMF)': 'RF-0024-003-PPP',
  'N-2,4-dimethylphenyl-N-methylformamidine (DMPF)': 'RF-0024-004-PPP',
  Anthraquinone: 'RF-0475-001-PPP',
  Asulam: 'RF-0028-001-PPP',
  Atrazine: 'RF-0029-001-PPP',
  'Atrazine-desethyl': 'RF-0478-001-PPP',
  'Atrazine-desisopropyl': 'RF-0481-001-PPP',
  Azaconazole: 'RF-0482-001-PPP',
  Azadirachtin: 'RF-0030-001-PPP',
  Azamethiphos: 'RF-0484-001-PPP',
  Azimsulfuron: 'RF-0031-001-PPP',
  'Azinphos-ethyl': 'RF-0032-001-PPP',
  'Azinphos-methyl': 'RF-0033-001-PPP',
  Azoxystrobin: 'RF-0035-001-PPP',
  Beflubutamid: 'RF-0037-001-PPP',
  Bendiocarb: 'RF-0489-001-PPP',
  Benfluralin: 'RF-0039-001-PPP',
  'Benfuracarb (expr. as carbofuran)': 'RF-0040-001-PPP',
  Benoxacor: 'RF-0492-001-PPP',
  'Bensulfuron-methyl': 'RF-0494-001-PPP',
  'Bentazone (+salts)': 'RF-0042-002-PPP',
  'Bentazone metabolite (free 6-hydroxy bentazone expr. as bentazone)':
    'RF-0042-004-PPP',
  'Bentazone metabolite (free 8-hydroxy bentazone expr. as bentazone)':
    'RF-0042-003-PPP',
  Benzobicyclon: 'RF-0499-001-PPP',
  Benzovindiflupyr: 'RF-00003386-PAR',
  '6BA (6-benzyladenine)': 'RF-1062-001-PPP',
  Bifenazate: 'RF-0044-001-PPP',
  Bifenox: 'RF-0045-001-PPP',
  Bifenthrin: 'RF-0046-001-PPP',
  Bioresmethrin: 'RF-0505-001-PPP',
  Biphenyl: 'RF-0506-001-PPP',
  Pentachloroanisol: 'RF-0837-001-PPP',
  Bitertanol: 'RF-0048-001-PPP',
  Bixafen: 'RF-1056-001-PPP',
  Boscalid: 'RF-0049-001-PPP',
  Brodifacoum: 'RF-0510-001-PPP',
  Bromacil: 'RF-0511-001-PPP',
  Bromadiolone: 'RF-00002596-PAR',
  'Bromophos(-methyl)': 'RF-0517-001-PPP',
  'Bromophos-ethyl': 'RF-0051-001-PPP',
  Bromopropylate: 'RF-0052-001-PPP',
  Bupirimate: 'RF-0055-001-PPP',
  Buprofezin: 'RF-0056-001-PPP',
  Butralin: 'RF-0057-001-PPP',
  Cadusafos: 'RF-0528-001-PPP',
  Carbaryl: 'RF-0062-001-PPP',
  'Carbendazim (incl. benomyl)': 'RF-0041-002-PPP',
  Carbofuran: 'RF-0065-003-PPP',
  'Carbofuran-metabolite (Hydroxy-3-carbofuran )': 'RF-0065-002-PPP',
  Carbophenothion: 'RF-0535-001-PPP',
  'Carbosulfan (expr. as carbofuran)': 'RF-0068-001-PPP',
  Carboxin: 'RF-0069-001-PPP',
  'Carboxin-metabolite (Carboxin-sulfoxide expr. as carboxin)':
    'RF-00005982-PAR',
  'Carboxin-metabolite (Carboxin-sulfone (Oxycarboxin) expr. as carboxin)':
    'RF-0322-001-PPP',
  'Carfentrazone-ethyl': 'RF-0070-003-PPP',
  'Carfentrazone (expr.as carfentrazone-ethyl)': 'RF-0070-002-PPP',
  Chinomethionat: 'RF-0539-001-PPP',
  'Chlordane-cis': 'RF-0075-004-PPP',
  'Chlordane-oxy': 'RF-0827-001-PPP',
  'Chlordane-trans': 'RF-0075-003-PPP',
  Chlorfenvinphos: 'RF-0079-001-PPP',
  Chlorfluazuron: 'RF-0549-001-PPP',
  Chlorfenapyr: 'RF-0077-001-PPP',
  Chloridazon: 'RF-0080-001-PPP',
  'Chloridazon-metabolite (-desphenyl expr. as chloridazon': 'RF-00006186-PAR',
  Chlormephos: 'RF-0554-001-PPP',
  Chlorobenzilate: 'RF-0082-001-PPP',
  Chlorothalonil: 'RF-0084-001-PPP',
  Chlorotoluron: 'RF-0092-001-PPP',
  Chloroxuron: 'RF-0085-001-PPP',
  'Chlorpropham (CIPC)': 'RF-0086-003-PPP',
  'Chlorpyrifos(-ethyl)': 'RF-0087-001-PPP',
  'Chlorpyrifos-methyl': 'RF-0088-001-PPP',
  'Chlorpyrifos-methyl metabolite (-desmethyl expr. as chlorpyrifos-methyl)':
    'RF-00009870-PAR',
  Chlorsulfuron: 'RF-0089-001-PPP',
  'Chlorthal-dimethyl': 'RF-0090-001-PPP',
  Chlozolinate: 'RF-0093-001-PPP',
  Chromafenozide: 'RF-0094-001-PPP',
  Clethodim: 'RF-0096-005-PPP',
  'Clethodim sulfone': 'RF-0096-002-PPP',
  'Clethodim sulfoxide': 'RF-0096-004-PPP',
  'Clodinafop-propargyl': 'RF-0565-001-PPP',
  Clofentezine: 'RF-0098-001-PPP',
  Clomazone: 'RF-0099-001-PPP',
  Clopyralid: 'RF-0100-001-PPP',
  'Cloquintocet-mexyl': 'RF-0568-001-PPP',
  Coumaphos: 'RF-0571-001-PPP',
  Coumatetralyl: 'RF-0572-001-PPP',
  Cyanazine: 'RF-0576-001-PPP',
  Cyflumetofen: 'RF-00002591-PAR',
  Cyprodinil: 'RF-0114-001-PPP',
  Cyantraniliprole: 'RF-00003336-PAR',
  Cyazofamid: 'RF-0104-001-PPP',
  Cyclaniliprole: 'RF-00008948-PAR',
  Cycloxydim: 'RF-0106-002-PPP',
  Cycluron: 'RF-0583-001-PPP',
  'Cyhalofop-butyl': 'RF-00003378-PAR',
  Cymiazole: 'RF-0586-001-PPP',
  Cymoxanil: 'RF-0111-001-PPP',
  Cyproconazole: 'RF-0113-001-PPP',
  Cyromazine: 'RF-0115-001-PPP',
  '2,4-D (+salts)': 'RF-0010-003-PPP',
  Dazomet: 'RF-0118-003-PPP',
  '2,4-DB (+salts)': 'RF-00004646-PAR',
  Deltamethrin: 'RF-0120-001-PPP',
  'Demethon-S-methyl': 'RF-0594-002-PPP',
  'Oxydemeton-methyl metabolite (demeton-S-methyl-sulfone expr. as ODM)':
    'RF-0323-003-PPP',
  Desmedipham: 'RF-0121-001-PPP',
  Desmethryn: 'RF-0595-001-PPP',
  Diafenthiuron: 'RF-0596-001-PPP',
  Diallate: 'RF-0122-001-PPP',
  Diazinon: 'RF-0123-001-PPP',
  Dicamba: 'RF-0124-001-PPP',
  Dichlobenil: 'RF-0125-001-PPP',
  Dichlofenthion: 'RF-0599-001-PPP',
  Dichlofluanid: 'RF-0453-001-PPP',
  Dichlormid: 'RF-0601-001-PPP',
  '3,5-dichloroaniline': 'RF-0450-002-PPP',
  'Dichlorprop (incl. dichlorprop-p+salts) (2,4-DP)': 'RF-0126-002-PPP',
  Dichlorvos: 'RF-0127-001-PPP',
  Diclobutrazol: 'RF-0610-001-PPP',
  'Diclofop-methyl': 'RF-0128-003-PPP',
  'Diclofop (expr. as diclofop-methyl)': 'RF-0128-002-PPP',
  Dicloran: 'RF-0129-001-PPP',
  Dicofol: 'RF-0130-002-PPP',
  Dicrotophos: 'RF-0612-001-PPP',
  Dieldrin: 'RF-0021-003-PPP',
  Diethofencarb: 'RF-0132-001-PPP',
  'Diethyl toluamide': 'RF-0616-001-PPP',
  Difenacoum: 'RF-0617-001-PPP',
  Difenoconazole: 'RF-0133-001-PPP',
  Diflubenzuron: 'RF-0134-001-PPP',
  'Diflufenican (diflufenicanil)': 'RF-0135-001-PPP',
  Dimefuron: 'RF-0623-001-PPP',
  Dimethachlor: 'RF-0136-001-PPP',
  Dimethoate: 'RF-0139-003-PPP',
  Dimethomorph: 'RF-0140-001-PPP',
  Dimoxystrobin: 'RF-0141-001-PPP',
  '1,4-dimethylnaphtalene': 'RF-00004728-PAR',
  Diniconazole: 'RF-0142-001-PPP',
  Dinocap: 'RF-0143-002-PPP',
  'Dinoseb (+salts)': 'RF-0144-001-PPP',
  Dinotefuran: 'RF-0633-001-PPP',
  Diphenamid: 'RF-0638-001-PPP',
  Diphenylamine: 'RF-0147-001-PPP',
  Disulfoton: 'RF-0149-002-PPP',
  Ditalimfos: 'RF-0640-001-PPP',
  Diuron: 'RF-0152-002-PPP',
  Dodemorph: 'RF-0645-001-PPP',
  Dodine: 'RF-0154-001-PPP',
  'Emamectine B1b': 'RF-00011965-PAR',
  'Endosulfan-alpha': 'RF-0155-004-PPP',
  'Endosulfan-beta': 'RF-0155-003-PPP',
  'Endosulfan-sulfate': 'RF-0155-002-PPP',
  Endrin: 'RF-0156-001-PPP',
  'Endrin ketone': 'RF-0653-001-PPP',
  EPN: 'RF-0654-001-PPP',
  Epoxiconazole: 'RF-0157-001-PPP',
  Ethametsulfuron: 'RF-0658-001-PPP',
  Ethiofencarb: 'RF-0660-001-PPP',
  'Ethion (Diethion)': 'RF-0161-001-PPP',
  Ethirimol: 'RF-0162-001-PPP',
  Ethofumesate: 'RF-0163-002-PPP',
  'Ethofumesate-metabolite (Ethofumesate-2-keto expr. as ethofumesate)':
    'RF-00000021-PAR',
  Ethoprophos: 'RF-0164-001-PPP',
  Ethoxysulfuron: 'RF-0166-001-PPP',
  Etofenprox: 'RF-0168-001-PPP',
  Etoxazole: 'RF-0169-001-PPP',
  Etridiazole: 'RF-0170-001-PPP',
  Etrimphos: 'RF-0668-001-PPP',
  Famoxadone: 'RF-0171-001-PPP',
  Fenamiphos: 'RF-0173-004-PPP',
  'Fenamiphos-metabolite (sulfone expr. as fenamiphos)': 'RF-0173-003-PPP',
  'Fenamiphos-metabolite (sulfoxide expr. as fenamiphos)': 'RF-0173-002-PPP',
  Fenamidone: 'RF-0172-001-PPP',
  Fenarimol: 'RF-0174-001-PPP',
  Fenazaquin: 'RF-0175-001-PPP',
  'Fenchlorazole-ethyl': 'RF-0673-001-PPP',
  Fenhexamid: 'RF-0179-001-PPP',
  Fenitrothion: 'RF-0180-001-PPP',
  Fenobucarb: 'RF-0677-001-PPP',
  'Fenoxaprop-P': 'RF-0181-001-PPP',
  'Fenoxaprop-P-ethyl': 'RF-0681-001-PPP',
  Fenoxycarb: 'RF-0182-001-PPP',
  Fenpicoxamid: 'RF-00010217-PAR',
  Fenpropathrin: 'RF-0183-001-PPP',
  'Fenpropidin (+ salts)': 'RF-00007586-PAR',
  Fenpyrazamine: 'RF-00002610-PAR',
  Fenpyroximate: 'RF-0186-001-PPP',
  Fensulfothion: 'RF-0685-002-PPP',
  'Fensulfothion-sulfone (expr. as fensulfothion)': 'RF-0685-003-PPP',
  'Fensulfothion-oxon (expr. as fensulfothion)': 'RF-0685-004-PPP',
  'Fensulfothion-oxon-sulfone (expr. as fensulfothion)': 'RF-0685-005-PPP',
  Fenthion: 'RF-0187-006-PPP',
  'Fenthion-oxon-sulfone (expr. as fenthion)': 'RF-0187-007-PPP',
  'Fenthion-oxon-sulfoxide (expr. as fenthion)': 'RF-0187-005-PPP',
  'Fenthion-sulfone (expr. as fenthion)': 'RF-0187-003-PPP',
  'Fenthion-metabolite (-sulfoxide expr. as fenthion)': 'RF-0187-002-PPP',
  Fipronil: 'RF-0192-003-PPP',
  'Fipronil-metabolite (-sulfone expr. as fipronil)': 'RF-0192-002-PPP',
  Flazasulfuron: 'RF-0193-001-PPP',
  Flocoumafen: 'RF-0696-001-PPP',
  Flonicamid: 'RF-0194-002-PPP',
  Florasulam: 'RF-0195-001-PPP',
  'Florpyrauxifen-benzyl': 'RF-00010416-PAR',
  'Fluazifop-P-butyl (fluazifop acid)': 'RF-0197-002-PPP',
  Fluazinam: 'RF-0198-001-PPP',
  Flubendiamide: 'RF-0199-001-PPP',
  Fludioxonil: 'RF-0202-001-PPP',
  Fluensulfone: 'RF-00011591-PAR',
  Flufenoxuron: 'RF-0204-001-PPP',
  Flumetralin: 'RF-0706-001-PPP',
  Flumioxazine: 'RF-0206-001-PPP',
  'Flufenacet (Fluthiamide)': 'RF-0203-002-PPP',
  Fluometuron: 'RF-0207-001-PPP',
  Fluopicolide: 'RF-0208-001-PPP',
  Fluopyram: 'RF-1071-001-PPP',
  Fluoroglycofene: 'RF-0210-001-PPP',
  Fluoxastrobin: 'RF-0211-001-PPP',
  Fluquinconazole: 'RF-0213-001-PPP',
  Flupyradifurone: 'RF-00004662-PAR',
  'Flupyrsulfuron-methyl': 'RF-0212-001-PPP',
  'Fluroxypyr (+salts)': 'RF-0215-003-PPP',
  'Fluroxypyr-meptyl': 'RF-0215-002-PPP',
  Flurtamone: 'RF-0217-001-PPP',
  Flusilazole: 'RF-0218-001-PPP',
  'Fluthiacet-methyl': 'RF-0720-001-PPP',
  Flutianil: 'RF-00008904-PAR',
  Flutolanil: 'RF-0219-001-PPP',
  Flutriafol: 'RF-0220-001-PPP',
  'Fluvalinate-tau': 'RF-0402-001-PPP',
  Fluxapyroxad: 'RF-00000024-PAR',
  Fomesafen: 'RF-0723-001-PPP',
  Fonofos: 'RF-0724-001-PPP',
  Foramsulfuron: 'RF-0222-001-PPP',
  Forchlorfenuron: 'RF-0196-001-PPP',
  'Formethanate (+salts)': 'RF-0223-002-PPP',
  Formothion: 'RF-0224-001-PPP',
  'Phosphonic acid': 'RF-00004675-PAR',
  'Fosetyl-Al (sum of fosetyl, phosphonic acid and their salts, expressed as fosetyl)':
    'RF-0225-001-PPP',
  Fosthiazate: 'RF-0226-001-PPP',
  Fuberidazole: 'RF-0227-001-PPP',
  'Furathiocarb (expr. as carbofuran)': 'RF-0228-001-PPP',
  'HCH-alpha': 'RF-0238-001-PPP',
  'HCH-beta': 'RF-0239-002-PPP',
  'HCH-delta': 'RF-0736-001-PPP',
  'HCH-gamma (Lindane)': 'RF-0263-001-PPP',
  'Gibberellic acid': 'RF-0230-001-PPP',
  Fenchlorphos: 'RF-0178-002-PPP',
  'Fenchlorphos-metabolite (-oxon expr.as fenchlorphos)': 'RF-0178-003-PPP',
  'Halauxifen-methyl': 'RF-00007584-PAR',
  'Halauxifen-methyl-metabolite (Halauxifen expr. as halauxifen-methyl)':
    'RF-00004665-PAR',
  'Halosulfuron-methyl': 'RF-0234-001-PPP',
  'Haloxyfop (+salts)': 'RF-0235-004-PPP',
  'Haloxyfop-methyl (expr. as haloxyfop)': 'RF-0235-002-PPP',
  'Haloxyfop-2-ethoxyethyl (expr. as haloxyfop)': 'RF-0235-003-PPP',
  'Heptachlor-epoxyde-cis (expr. as heptachlor)': 'RF-0236-005-PPP',
  Heptachlor: 'RF-0236-004-PPP',
  Heptenophos: 'RF-0737-001-PPP',
  'Hexachlorobenzene (HCB)': 'RF-0237-001-PPP',
  Hexaconazole: 'RF-0241-001-PPP',
  Hexazinone: 'RF-0739-001-PPP',
  Imazalil: 'RF-0246-001-PPP',
  Imazapyr: 'RF-0744-001-PPP',
  Imazapic: 'RF-0743-001-PPP',
  Imazaquin: 'RF-0248-001-PPP',
  Imazethapyr: 'RF-0745-001-PPP',
  Imazosulfuron: 'RF-0249-001-PPP',
  'Imazamethabenz-methyl': 'RF-0742-001-PPP',
  Imidacloprid: 'RF-0250-001-PPP',
  'Indolylbutyric acid': 'RF-00004668-PAR',
  Ipconazole: 'RF-0254-001-PPP',
  Iprodione: 'RF-0255-001-PPP',
  Iprovalicarb: 'RF-0256-001-PPP',
  Isocarbophos: 'RF-0754-001-PPP',
  'Isofenphos (-ethyl)': 'RF-0756-001-PPP',
  'Isofenphos-methyl': 'RF-0758-001-PPP',
  Isofetamid: 'RF-00007585-PAR',
  Isoprothiolane: 'RF-0764-001-PPP',
  Isoproturon: 'RF-0257-001-PPP',
  Isoxaben: 'RF-0258-001-PPP',
  Isoxaflutole: 'RF-0259-002-PPP',
  'Isoxaflutole-metabolite (Isoxaflutole diketonitrile RPA 202248 expr. as Isoxaflutole)':
    'RF-00004677-PAR',
  'Isoxadifen-ethyl': 'RF-0765-001-PPP',
  'Kresoxim-methyl': 'RF-0260-001-PPP',
  Lenacil: 'RF-0262-001-PPP',
  Linuron: 'RF-0264-001-PPP',
  Lufenuron: 'RF-0265-001-PPP',
  Malathion: 'RF-0266-003-PPP',
  'Malathion-metabolite (malaoxon expr. as malathion)': 'RF-0266-002-PPP',
  Mandestrobin: 'RF-00004671-PAR',
  'MCPA (+salts)': 'RF-0271-005-PPP',
  'MCPB (+salts) expr. as MCPA': 'RF-0271-002-PPP',
  Mecarbam: 'RF-0272-001-PPP',
  'Mefenpyr-diethyl': 'RF-00000026-PAR',
  Mefentrifluconazole: 'RF-00009360-PAR',
  Mepanipyrim: 'RF-0274-002-PPP',
  Mepronil: 'RF-0780-001-PPP',
  'Mesosulfuron-methyl': 'RF-0278-003-PPP',
  Mesotrione: 'RF-00003357-PAR',
  'Metaflumizone (sum of isomers)': 'RF-00007589-PAR',
  Metaldehyde: 'RF-0282-001-PPP',
  Metamitron: 'RF-0284-001-PPP',
  Metconazole: 'RF-0286-001-PPP',
  Metazachlor: 'RF-0285-001-PPP',
  Methabenzthiazuron: 'RF-0287-001-PPP',
  Methacrifos: 'RF-0288-001-PPP',
  Methamidophos: 'RF-0289-001-PPP',
  Methidathion: 'RF-0290-001-PPP',
  'Methiocarb (Mercaptodimethur)': 'RF-0291-002-PPP',
  'Methiocarb-metabolite (-sulfone expr. as methiocarb)': 'RF-0291-004-PPP',
  Methomyl: 'RF-0293-003-PPP',
  Methoxychlor: 'RF-0295-001-PPP',
  Methoxyfenozide: 'RF-0296-001-PPP',
  Metobromuron: 'RF-0791-001-PPP',
  'Metobromuron metabolite (4-bromophenylurea expr. as metobromuron)':
    'RF-00003387-PAR',
  'metobromuron-desmethoxy': 'RF-00006545-PAR',
  '4-bromoaniline': 'RF-00006543-PAR',
  Metoxuron: 'RF-0794-001-PPP',
  Metrafenone: 'RF-0299-001-PPP',
  Metosulam: 'RF-0298-001-PPP',
  Metribuzin: 'RF-0300-001-PPP',
  'Metsulfuron-methyl': 'RF-0301-001-PPP',
  Metyltetraprole: 'RF-00013155-PAR',
  'Milbemycin A3 expr. as milbemectin': 'RF-0303-002-PPP',
  'Milbemycin A4 expr. as milbemectin': 'RF-0303-003-PPP',
  Mirex: 'RF-0797-001-PPP',
  Monocrotophos: 'RF-0305-001-PPP',
  Monolinuron: 'RF-0306-001-PPP',
  Naled: 'RF-0800-001-PPP',
  '2-(1-naphthyl)acetamide (expr. as 1-naphthylacetic acid)': 'RF-0006-001-PPP',
  '1-naphthylacetic acid': 'RF-0007-001-PPP',
  Neburon: 'RF-0805-001-PPP',
  Nicosulfuron: 'RF-0310-001-PPP',
  Nitenpyram: 'RF-0810-001-PPP',
  Nitrofen: 'RF-0311-001-PPP',
  Norflurazon: 'RF-0312-001-PPP',
  Nuarimol: 'RF-0819-001-PPP',
  Omethoate: 'RF-0139-002-PPP',
  Orthosulfamuron: 'RF-0315-001-PPP',
  Oryzalin: 'RF-0316-001-PPP',
  Oxadiargyl: 'RF-0317-001-PPP',
  Oxadiazon: 'RF-0318-001-PPP',
  Oxadixyl: 'RF-0319-001-PPP',
  Oxamyl: 'RF-0320-001-PPP',
  Oxasulfuron: 'RF-0321-001-PPP',
  Oxathiapiprolin: 'RF-00008949-PAR',
  'Demeton-S-methyl-sulfoxide (Oxydemeton-methyl)': 'RF-0323-004-PPP',
  Oxyfluorfen: 'RF-0324-001-PPP',
  Parathion: 'RF-0327-001-PPP',
  'Paraoxon-ethyl': 'RF-0828-001-PPP',
  'Parathion-methyl': 'RF-0328-003-PPP',
  'Parathion-methyl-metabolite (paraoxon-methyl expr. as parathion-methyl)':
    'RF-0328-002-PPP',
  Penconazole: 'RF-0329-001-PPP',
  Pencycuron: 'RF-0330-001-PPP',
  'Pencycuron-metabolite (Pencycuron-PB-amine expr. as pencycuron)':
    'RF-00012804-PAR',
  Pendimethalin: 'RF-0331-001-PPP',
  Penflufen: 'RF-00003362-PAR',
  Penoxsulam: 'RF-0332-001-PPP',
  'Quintozene metabolite (pentachloroaniline expr. as quintozene)':
    'RF-0383-003-PPP',
  Penthiopyrad: 'RF-00002609-PAR',
  'Permethrin (sum of isomers)': 'RF-0842-001-PPP',
  Pethoxamid: 'RF-0333-001-PPP',
  Phenmedipham: 'RF-0334-001-PPP',
  Phenthoate: 'RF-0846-001-PPP',
  'Orthophenylphenol (2-phenyl-phenol)': 'RF-0823-001-PPP',
  Phorate: 'RF-0336-003-PPP',
  'Phorate-metabolite (Phorate-oxon expr. as phorate)': 'RF-0336-005-PPP',
  Phosalone: 'RF-0337-001-PPP',
  Phosmet: 'RF-0338-002-PPP',
  'Phosmet-metabolite (phosmet oxon expr. as phosmet)': 'RF-0338-003-PPP',
  Phosphamidon: 'RF-0339-001-PPP',
  Phoxim: 'RF-0342-001-PPP',
  Picloram: 'RF-0343-001-PPP',
  Picolinafen: 'RF-0344-001-PPP',
  Picoxystrobin: 'RF-0345-001-PPP',
  Pinoxaden: 'RF-0346-001-PPP',
  'Piperonyl-butoxide': 'RF-0848-001-PPP',
  Pirimicarb: 'RF-0347-002-PPP',
  'Desmethylpirimicarb expr. as pirimicarb': 'RF-0347-003-PPP',
  'Pirimiphos(-ethyl)': 'RF-0851-001-PPP',
  'Pirimiphos-methyl': 'RF-0348-001-PPP',
  Prochloraz: 'RF-0349-002-PPP',
  Procymidone: 'RF-0350-001-PPP',
  Profenofos: 'RF-0351-001-PPP',
  Profoxydim: 'RF-0859-001-PPP',
  Profluralin: 'RF-0858-001-PPP',
  Prometryn: 'RF-0862-001-PPP',
  Propaquizafop: 'RF-0356-001-PPP',
  Propanil: 'RF-0355-001-PPP',
  Propargite: 'RF-0357-001-PPP',
  Propham: 'RF-0867-001-PPP',
  Propiconazole: 'RF-0358-001-PPP',
  Propoxur: 'RF-0361-001-PPP',
  'Propoxycarbazone (+salts)': 'RF-0362-002-PPP',
  'Propoxycarbazone metabolite (2-hydroxypropoxycarbazone expr. as propoxycarbazone)':
    'RF-00004648-PAR',
  Propyzamide: 'RF-0364-001-PPP',
  Proquinazid: 'RF-0365-001-PPP',
  Prosulfocarb: 'RF-0366-001-PPP',
  Prosulfuron: 'RF-0367-001-PPP',
  'Prothioconazole (prothioconazole-desthio)': 'RF-0868-001-PPP',
  Prothiofos: 'RF-0869-001-PPP',
  Pydiflumetofen: 'RF-00009486-PAR',
  Pymetrozine: 'RF-0369-001-PPP',
  Pyraclostrobin: 'RF-0370-001-PPP',
  'Pyraflufen-ethyl': 'RF-0371-001-PPP',
  Pyrazophos: 'RF-0373-001-PPP',
  'Cinerin I': 'RF-1066-002-PPP',
  'Cinerin II': 'RF-1066-003-PPP',
  'Jasmolin I': 'RF-0374-004-PPP',
  'Jasmolin II': 'RF-0374-005-PPP',
  'Pyrethrin I': 'RF-0374-002-PPP',
  'Pyrethrin II': 'RF-0374-003-PPP',
  Pyridaben: 'RF-0375-001-PPP',
  Pyridaphenthion: 'RF-0877-001-PPP',
  Pyridalyl: 'RF-0876-001-PPP',
  Pyridate: 'RF-0376-002-PPP',
  'Pyridate-metabolite (expr. as pyridate)': 'RF-0875-001-PPP',
  Pyrifenox: 'RF-0878-001-PPP',
  Pyrimethanil: 'RF-0377-001-PPP',
  Pyriofénone: 'RF-00003031-PAR',
  Pyriproxyfen: 'RF-0378-001-PPP',
  Pyroxsulam: 'RF-0883-001-PPP',
  Quinalphos: 'RF-0380-001-PPP',
  Quinclorac: 'RF-0885-001-PPP',
  Quinmerac: 'RF-0381-001-PPP',
  Quinoclamine: 'RF-0886-001-PPP',
  Quinoxyfen: 'RF-0382-001-PPP',
  Quintozene: 'RF-0383-002-PPP',
  Rimsulfuron: 'RF-0386-001-PPP',
  Rotenone: 'RF-0387-001-PPP',
  'chlorantraniliprole (rynaxypyr)': 'RF-0072-001-PPP',
  Saflufenacil: 'RF-00004816-PAR',
  Sethoxydim: 'RF-0096-003-PPP',
  Silthiofam: 'RF-0389-001-PPP',
  Simazine: 'RF-0390-001-PPP',
  Sintofen: 'RF-00001606-PAR',
  Spirodiclofen: 'RF-0394-001-PPP',
  Spiromesifen: 'RF-0395-001-PPP',
  Spirotetramat: 'RF-00003368-PAR',
  Spiroxamine: 'RF-0397-001-PPP',
  Sulcotrione: 'RF-0398-001-PPP',
  Sulfosulfuron: 'RF-0399-001-PPP',
  Sulfotep: 'RF-0903-001-PPP',
  Sulprofos: 'RF-0905-001-PPP',
  '2,4,5-T (+salts)': 'RF-0009-001-PPP',
  Tebuconazole: 'RF-0403-001-PPP',
  Tebufenozide: 'RF-0404-001-PPP',
  Tebufenpyrad: 'RF-0405-001-PPP',
  Tecnazene: 'RF-0406-001-PPP',
  Teflubenzuron: 'RF-0407-001-PPP',
  Tembotrione: 'RF-0409-001-PPP',
  'Tembotrione-metabolite (Tembotrione-4,6-dihydroxy AE 1417268 expr. as tembotrione)':
    'RF-00002608-PAR',
  Tepraloxydim: 'RF-0411-001-PPP',
  Terbacil: 'RF-0912-001-PPP',
  Terbufos: 'RF-0412-002-PPP',
  'Terbufos-sulfoxide (expr. as terbufos)': 'RF-0412-004-PPP',
  'Terbufos-sulfone (expr. as terbufos)': 'RF-0412-003-PPP',
  Terbuthylazine: 'RF-0413-001-PPP',
  'Terbuthylazine-desethyl expr. as terbuthylazine': 'RF-0918-001-PPP',
  Terbutryn: 'RF-0919-001-PPP',
  Tetraconazole: 'RF-0414-001-PPP',
  Tetradifon: 'RF-0415-001-PPP',
  Tetramethrin: 'RF-0922-001-PPP',
  Thiabendazole: 'RF-0416-001-PPP',
  Thiacloprid: 'RF-0417-001-PPP',
  Thiamethoxam: 'RF-0418-001-PPP',
  Thifluzamide: 'RF-0931-001-PPP',
  Clothianidin: 'RF-0101-001-PPP',
  'Thiencarbazone-methyl': 'RF-00002593-PAR',
  'Thifensulfuron-methyl': 'RF-0419-001-PPP',
  Thiocyclam: 'RF-0932-001-PPP',
  Thiodicarb: 'RF-0293-002-PPP',
  'Thiophanate-methyl': 'RF-0422-001-PPP',
  'Tolclofos-methyl': 'RF-0424-001-PPP',
  Tolfenpyrad: 'RF-0943-001-PPP',
  Tolyfluanid: 'RF-0425-002-PPP',
  'Tolyfluanid metabolite (DMST)': 'RF-0644-001-PPP',
  Transfluthrin: 'RF-0945-001-PPP',
  Triadimefon: 'RF-0428-003-PPP',
  Triallate: 'RF-0430-001-PPP',
  Triasulfuron: 'RF-0431-001-PPP',
  Triazamate: 'RF-0948-001-PPP',
  Triazophos: 'RF-0432-001-PPP',
  'Tribenuron-methyl': 'RF-0434-001-PPP',
  Trichlorfon: 'RF-0435-001-PPP',
  Trichloronat: 'RF-0957-001-PPP',
  Triclopyr: 'RF-0436-001-PPP',
  Tricyclazole: 'RF-0437-001-PPP',
  Trifloxystrobin: 'RF-0439-001-PPP',
  Triflumizole: 'RF-0440-002-PPP',
  Triflumuron: 'RF-0441-001-PPP',
  Trifloxysulfuron: 'RF-0960-001-PPP',
  Trifluralin: 'RF-0442-001-PPP',
  'Triflusulfuron-methyl': 'RF-0961-001-PPP',
  Triforine: 'RF-0444-001-PPP',
  'Trinexapac-acide': 'RF-00007587-PAR',
  'Trinexapac-ethyl': 'RF-0963-001-PPP',
  Triticonazole: 'RF-0447-001-PPP',
  Tritosulfuron: 'RF-0448-001-PPP',
  Valifenalate: 'RF-1057-001-PPP',
  Vamidothion: 'RF-0969-001-PPP',
  Vinclozolin: 'RF-0450-003-PPP',
  'Warfarin (Coumaphene)': 'RF-1043-001-PPP',
  Zoxamide: 'RF-0452-001-PPP'
};

const codeMethods = [
  'LC/MS/MS ou GC/MS/MS',
  'GC/MS/MS',
  'M.I. LC-MS/MS',
  'MI GC-MS/MS',
  'MI HPLC/UV',
  'MI LC-MS/MS',
  'MI LC-MS/MS screening',
  'MI M28 GC-MS/MS',
  'MI MO-PC-003',
  'MI MO-PC-019 LC-MS/MS',
  'MI MO-PC-02',
  'MI MO-PC-036',
  'MI MO-PC-044 LC-MS/MS',
  'MI MO-PC-047 LC-MS/MS',
  'MI MO-PC-049 LC-MS/MS',
  'MI MO-PC-058 LC-MS/MS',
  'MI MO-PC-065 LC-MS/MS',
  'MI MO-PC-067 LC-MS/MS',
  'MI MO-PC-068 LC-MS/MS',
  'MI MO-PC-073 LC-MS/MS',
  'MI MO-PC-076',
  'MI MO-PC-077',
  'MI MO-PC-079',
  'MI MO-PC-081 LC-MS/MS',
  'MI MO-PC-083 LC-MS/MS',
  'MI MO-PC-087 LC-MS/MS',
  'MI MS/MS',
  'NF EN 12393',
  'NF EN 12396-1 (Keppel)',
  'NF EN 12396-3',
  'NF12393'
] as const;

const codeMethodsAnalyseMethod = {
  'LC/MS/MS ou GC/MS/MS': 'Multi',
  'GC/MS/MS': 'Multi',
  'M.I. LC-MS/MS': 'Multi',
  'MI GC-MS/MS': 'Multi',
  'MI HPLC/UV': 'Mono',
  'MI LC-MS/MS': 'Multi',
  'MI LC-MS/MS screening': 'Multi',
  'MI M28 GC-MS/MS': 'Mono',
  'MI MO-PC-003': 'Multi',
  'MI MO-PC-019 LC-MS/MS': 'Mono',
  'MI MO-PC-02': 'Multi',
  'MI MO-PC-036': 'Multi',
  'MI MO-PC-044 LC-MS/MS': 'Mono',
  'MI MO-PC-047 LC-MS/MS': 'Mono',
  'MI MO-PC-049 LC-MS/MS': 'Mono',
  'MI MO-PC-058 LC-MS/MS': 'Mono',
  'MI MO-PC-065 LC-MS/MS': 'Multi',
  'MI MO-PC-067 LC-MS/MS': 'Mono',
  'MI MO-PC-068 LC-MS/MS': 'Mono',
  'MI MO-PC-073 LC-MS/MS': 'Mono',
  'MI MO-PC-076': 'Multi',
  'MI MO-PC-077': 'Multi',
  'MI MO-PC-079': 'Multi',
  'MI MO-PC-081 LC-MS/MS': 'Mono',
  'MI MO-PC-083 LC-MS/MS': 'Mono',
  'MI MO-PC-087 LC-MS/MS': 'Mono',
  'MI MS/MS': 'Multi',
  'NF EN 12393': 'Multi',
  'NF EN 12396-1 (Keppel)': 'Mono',
  'NF EN 12396-3': 'Mono',
  NF12393: 'Multi'
} as const satisfies Record<(typeof codeMethods)[number], AnalysisMethod>;

const capinovCodeEchantillonValidator = z.string().transform((l) => {
  const result = l
    .trim()
    .substring(0, l.length - 2)
    .trim()
    .replaceAll(' ', '-');

  if (result.endsWith('-')) {
    return result.substring(0, result.length - 1);
  }
  return result;
});
// Visible for testing
export const extractAnalyzes = (
  fileContent: Record<string, string>[]
): Omit<ExportAnalysis, 'pdfFile'>[] => {
  const fileValidator = z.array(
    z.object({
      LOT: capinovCodeEchantillonValidator,
      PARAMETRE_NOM: z.string(),
      RESULTAT_VALTEXTE: z.string(),
      RESULTAT_VALNUM: frenchNumberStringValidator,
      PARAMETRE_LIBELLE: z.string(),
      LIMITE_LQ: z.string(),
      CAS_NUMBER: z.string().transform((r) => (r === '' ? null : r)),
      TECHNIQUE: z.enum([...codeMethods, 'Calcul']),
      LMR_NUM: frenchNumberStringValidator.nullish(),
      // 16/04/2025
      ECHANT_DATE_DIFFUSION: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}/)
        .transform((date) => {
          const [d, m, y] = date.substring(0, 10).split('/');
          return `${y}-${m}-${d}`;
        })
        .pipe(maestroDate)
    })
  );

  const { data: resultatsData, error: resultatsError } =
    fileValidator.safeParse(
      fileContent.filter((row) => row.LOT !== '' && row.LOT !== undefined)
    );
  if (resultatsError) {
    throw new ExtractError(
      `Impossible d'extraire les données du fichier des résultats: ${resultatsError}`
    );
  }
  if (resultatsData.length === 0) {
    throw new ExtractError(
      `Aucune donnée trouvée dans le fichier de résultats`
    );
  }

  const resultsBySample = groupBy(resultatsData, 'LOT');
  const result: Omit<ExportAnalysis, 'pdfFile'>[] = [];

  for (const sampleReference in resultsBySample) {
    const analysis: Omit<ExportAnalysis, 'pdfFile'> = {
      sampleReference,
      notes: '',
      residues: []
    };

    for (const residue of resultsBySample[sampleReference]) {
      const isDetectable =
        residue.RESULTAT_VALTEXTE !== 'nd' && residue.RESULTAT_VALTEXTE !== '0';

      const result: ExportResultQuantifiable | ExportResultNonQuantifiable =
        !isDetectable
          ? { result_kind: 'ND' }
          : residue.RESULTAT_VALTEXTE === 'd, NQ'
            ? {
                result_kind: 'NQ'
              }
            : {
                result_kind: 'Q',
                result: residue.RESULTAT_VALNUM,
                lmr: residue.LMR_NUM ?? null
              };
      const previousResidu = analysis.residues[analysis.residues.length - 1];
      analysis.residues.push({
        ...result,
        label: residue.PARAMETRE_LIBELLE,
        casNumber: residue.CAS_NUMBER,
        analysisMethod:
          residue.TECHNIQUE === 'Calcul'
            ? previousResidu.analysisMethod
            : codeMethodsAnalyseMethod[residue.TECHNIQUE],
        codeSandre: null,
        analysisDate: residue.ECHANT_DATE_DIFFUSION
      });
    }

    result.push(analysis);
  }

  return result;
};

const exportDataFromEmail: ExportDataFromEmail = async (attachments) => {
  const csvFiles = attachments.filter(
    ({ contentType, filename }) =>
      contentType === 'text/csv' ||
      (contentType === 'text/plain' && filename?.endsWith('.csv'))
  );

  if (csvFiles?.length !== 1) {
    throw new ExtractError(
      `1 fichiers CSV doit être présent, trouvé ${csvFiles.length ?? 0} fichier en PJ`
    );
  }

  const csvContent = csvToJson(csvFiles[0].content.toString('latin1'), ';');
  const analyzes = extractAnalyzes(csvContent);

  const analyzesWithPdf: ExportAnalysis[] = [];

  for (const analysis of analyzes) {
    const pdfAttachment = attachments.find(
      ({ contentType }) => contentType === 'application/pdf'
    );

    if (pdfAttachment === undefined) {
      throw new ExtractError(
        `Aucun fichier pdf pour ${analysis.sampleReference}`
      );
    }

    const pdfFile: File = new File(
      [pdfAttachment.content],
      pdfAttachment.filename ?? ''
    );
    analyzesWithPdf.push({ ...analysis, pdfFile });
  }

  return analyzesWithPdf;
};

export const getAnalysisKeyByFileName = (filename: string): string => {
  if (filename.endsWith('.csv')) {
    //  Example: Capinov_Export_MAESTRO 2025_6.8603.1 20250901
    return filename.substring(
      filename.indexOf(' ') + 1,
      filename.lastIndexOf(' ')
    );
  }

  if (filename.endsWith('.pdf')) {
    const tokens = filename.split(' ');

    //  Example: 2025_6 8603 1  ...
    return `${tokens[0]}.${tokens[1]}.${tokens[2]}`;
  }

  return '';
};

export const capinovConf: LaboratoryConf = {
  exportDataFromEmail,
  ssd2IdByLabel: capinovReferential,
  unknownReferences,
  getAnalysisKey: (email) => {
    const attachment = email.attachments[0];

    const filename = attachment.filename;
    if (filename) {
      return getAnalysisKeyByFileName(filename);
    }

    return '';
  }
};
