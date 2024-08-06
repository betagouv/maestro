import { z } from 'zod';

export const Analyte = z.enum(
  [
    'RF-00003331-PAR',
    'RF-00003368-PAR',
    'RF-00003376-PAR',
    'RF-1078-003-PPP',
    'RF-1078-004-PPP',
    'RF-1078-005-PPP',
    'RF-1078-006-PPP',
    'RF-1078-007-PPP',
    'RF-0303-002-PPP',
    'RF-0303-003-PPP',
    'RF-00003032-PAR',
    'RF-0044-001-PPP',
    'RF-00007625-PAR',
    'RF-00007626-PAR',
    'RF-0411-001-PPP',
    'RF-0009-001-PPP',
    'RF-0457-001-PPP',
    'RF-0047-001-PPP',
    'RF-0144-001-PPP',
    'RF-0632-001-PPP',
    'RF-0145-001-PPP',
    'RF-1036-001-PPP',
    'RF-00003323-PAR',
    'RF-00003324-PAR',
    'RF-00003325-PAR',
    'RF-0285-001-PPP',
    'RF-0016-002-PPP',
    'RF-0016-003-PPP',
    'RF-00003366-PAR',
    'RF-0371-001-PPP',
    'RF-0040-001-PPP',
    'RF-0065-002-PPP',
    'RF-0065-003-PPP',
    'RF-0068-001-PPP',
    'RF-0228-001-PPP',
    'RF-0011-002-PPP',
    'RF-0011-003-PPP',
    'RF-0011-004-PPP',
    'RF-0126-002-PPP',
    'RF-0126-003-PPP',
    'RF-0215-002-PPP',
    'RF-0215-003-PPP',
    'RF-00004665-PAR',
    'RF-00007584-PAR',
    'RF-0235-002-PPP',
    'RF-0235-003-PPP',
    'RF-0235-004-PPP',
    'RF-0235-006-PPP',
    'RF-0235-007-PPP',
    'RF-00004686-PAR',
    'RF-0061-001-PPP',
    'RF-00003348-PAR',
    'RF-00003349-PAR',
    'RF-0194-002-PPP',
    'RF-0221-001-PPP',
    'RF-0991-001-PPP',
    'RF-00004816-PAR',
    'RF-00007622-PAR',
    'RF-00007623-PAR',
    'RF-00000021-PAR',
    'RF-00007614-PAR',
    'RF-0163-002-PPP',
    'RF-00005776-PAR',
    'RF-00005777-PAR',
    'RF-00005778-PAR',
    'RF-0006-001-PPP',
    'RF-0007-001-PPP',
    'RF-00006186-PAR',
    'RF-0080-001-PPP',
    'RF-00000022-PAR',
    'RF-0197-002-PPP',
    'RF-0698-001-PPP',
    'RF-0699-001-PPP',
    'RF-00009870-PAR',
    'RF-0088-001-PPP',
    'RF-0823-001-PPP',
    'RF-0823-002-PPP',
    'RF-00011514-PAR',
    'RF-00011516-PAR',
    'RF-00011517-PAR',
    'RF-00005982-PAR',
    'RF-0069-001-PPP',
    'RF-0322-001-PPP',
    'RF-0356-001-PPP',
    'RF-0384-002-PPP',
    'RF-0384-004-PPP',
    'RF-0887-001-PPP',
    'RF-0887-002-PPP',
    'RF-00003328-PAR',
    'RF-00003329-PAR',
    'RF-0349-002-PPP',
    'RF-00002608-PAR',
    'RF-0409-001-PPP',
    'RF-00012804-PAR',
    'RF-0330-001-PPP',
    'RF-0070-002-PPP',
    'RF-0070-003-PPP',
    'RF-0128-002-PPP',
    'RF-0128-003-PPP',
    'RF-00002588-PAR',
    'RF-00004646-PAR',
    'RF-0010-002-PPP',
    'RF-0010-003-PPP',
    'RF-0020-002-PPP',
    'RF-0020-003-PPP',
    'RF-0020-004-PPP',
    'RF-0021-002-PPP',
    'RF-0021-003-PPP',
    'RF-0024-002-PPP',
    'RF-0024-003-PPP',
    'RF-0024-004-PPP',
    'RF-0992-001-PPP',
    'RF-0034-002-PPP',
    'RF-0034-003-PPP',
    'RF-0041-002-PPP',
    'RF-0041-003-PPP',
    'RF-0042-002-PPP',
    'RF-0042-003-PPP',
    'RF-0042-004-PPP',
    'RF-0075-003-PPP',
    'RF-0075-004-PPP',
    'RF-0096-002-PPP',
    'RF-0096-003-PPP',
    'RF-0096-004-PPP',
    'RF-0096-005-PPP',
    'RF-0096-006-PPP',
    'RF-0096-007-PPP',
    'RF-0096-009-PPP',
    'RF-00006227-PAR',
    'RF-00006240-PAR',
    'RF-0106-002-PPP',
    'RF-00000161-VET',
    'RF-0112-002-PPP',
    'RF-0112-003-PPP',
    'RF-0112-004-PPP',
    'RF-0112-005-PPP',
    'RF-00003320-PAR',
    'RF-00003339-PAR',
    'RF-00004632-PAR',
    'RF-00006293-PAR',
    'RF-0118-003-PPP',
    'RF-0790-001-PPP',
    'RF-0119-002-PPP',
    'RF-0119-003-PPP',
    'RF-0119-004-PPP',
    'RF-0119-005-PPP',
    'RF-0119-006-PPP',
    'RF-0119-007-PPP',
    'RF-0130-002-PPP',
    'RF-0130-003-PPP',
    'RF-00002838-PAR',
    'RF-00006758-PAR',
    'RF-00007610-PAR',
    'RF-00007611-PAR',
    'RF-00007612-PAR',
    'RF-0143-002-PPP',
    'RF-0149-002-PPP',
    'RF-0149-003-PPP',
    'RF-0149-004-PPP',
    'RF-0155-002-PPP',
    'RF-0155-003-PPP',
    'RF-0155-004-PPP',
    'RF-0167-002-PPP',
    'RF-0167-003-PPP',
    'RF-0173-002-PPP',
    'RF-0173-003-PPP',
    'RF-0173-004-PPP',
    'RF-0178-002-PPP',
    'RF-0178-003-PPP',
    'RF-0187-002-PPP',
    'RF-0187-003-PPP',
    'RF-0187-004-PPP',
    'RF-0187-005-PPP',
    'RF-0187-006-PPP',
    'RF-0187-007-PPP',
    'RF-0192-002-PPP',
    'RF-0192-003-PPP',
    'RF-00007615-PAR',
    'RF-0203-002-PPP',
    'RF-00001688-PAR',
    'RF-0223-002-PPP',
    'RF-00004675-PAR',
    'RF-1059-001-PPP',
    'RF-00003355-PAR',
    'RF-00003360-PAR',
    'RF-00003361-PAR',
    'RF-0231-001-PPP',
    'RF-0236-004-PPP',
    'RF-0236-005-PPP',
    'RF-0236-007-PPP',
    'RF-0236-008-PPP',
    'RF-00004677-PAR',
    'RF-0259-002-PPP',
    'RF-0266-002-PPP',
    'RF-0266-003-PPP',
    'RF-0271-002-PPP',
    'RF-0271-005-PPP',
    'RF-00004644-PAR',
    'RF-00004645-PAR',
    'RF-00007589-PAR',
    'RF-00007590-PAR',
    'RF-0291-002-PPP',
    'RF-0291-003-PPP',
    'RF-0291-004-PPP',
    'RF-00004672-PAR',
    'RF-00004673-PAR',
    'RF-0323-003-PPP',
    'RF-0323-004-PPP',
    'RF-0328-002-PPP',
    'RF-0328-003-PPP',
    'RF-0336-002-PPP',
    'RF-0336-003-PPP',
    'RF-0336-004-PPP',
    'RF-0336-005-PPP',
    'RF-0336-006-PPP',
    'RF-0336-007-PPP',
    'RF-00004648-PAR',
    'RF-0362-002-PPP',
    'RF-0374-002-PPP',
    'RF-0374-003-PPP',
    'RF-0374-004-PPP',
    'RF-0374-005-PPP',
    'RF-1066-002-PPP',
    'RF-1066-003-PPP',
    'RF-0376-002-PPP',
    'RF-0875-001-PPP',
    'RF-0383-002-PPP',
    'RF-0383-003-PPP',
    'RF-0393-002-PPP',
    'RF-0393-003-PPP',
    'RF-0425-002-PPP',
    'RF-0644-001-PPP',
    'RF-00003354-PAR',
    'RF-0440-002-PPP',
    'RF-0690-004-PPP',
    'RF-0690-005-PPP',
    'RF-00007489-PAR',
    'RF-00007495-PAR',
    'RF-00007627-PAR',
    'RF-00006819-PAR',
    'RF-00006827-PAR',
    'RF-0381-001-PPP',
    'RF-00007283-PAR',
    'RF-00007284-PAR',
  ],
  {
    errorMap: () => ({
      message: "Veuillez renseigner l'analyte.",
    }),
  }
);

export type Analyte = z.infer<typeof Analyte>;

export const AnalyteList: Analyte[] = Analyte.options;
