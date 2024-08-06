import { z } from 'zod';
export const SimpleResidue = z.enum(
  [
    'RF-00000024-PAR',
    'RF-00001407-PAR',
    'RF-00001408-PAR',
    'RF-00001409-PAR',
    'RF-00001410-PAR',
    'RF-00001575-PAR',
    'RF-00001576-PAR',
    'RF-00001604-PAR',
    'RF-00001608-PAR',
    'RF-00001694-PAR',
    'RF-00001703-PAR',
    'RF-00001825-PAR',
    'RF-00002580-PAR',
    'RF-00014257-PAR',
    'RF-00002593-PAR',
    'RF-00002596-PAR',
    'RF-00002607-PAR',
    'RF-00002609-PAR',
    'RF-00002610-PAR',
    'RF-00002611-PAR',
    'RF-00002612-PAR',
    'RF-00002835-PAR',
    'RF-00003031-PAR',
    'RF-00003040-PAR',
    'RF-00003327-PAR',
    'RF-00003336-PAR',
    'RF-00003356-PAR',
    'RF-00003357-PAR',
    'RF-00003362-PAR',
    'RF-00003378-PAR',
    'RF-00003386-PAR',
    'RF-00003683-PAR',
    'RF-00003707-PAR',
    'RF-00003742-PAR',
    'RF-00003744-PAR',
    'RF-00004266-PAR',
    'RF-00004538-PAR',
    'RF-00004656-PAR',
    'RF-00004660-PAR',
    'RF-00004662-PAR',
    'RF-00004664-PAR',
    'RF-00004668-PAR',
    'RF-00004671-PAR',
    'RF-00004678-PAR',
    'RF-00004679-PAR',
    'RF-0061-001-PPP',
    'RF-00004728-PAR',
    'RF-00004758-PAR',
    'RF-00004827-PAR',
    'RF-00004850-PAR',
    'RF-00004913-PAR',
    'RF-00005711-PAR',
    'RF-00005713-PAR',
    'RF-00005716-PAR',
    'RF-00005717-PAR',
    'RF-00005719-PAR',
    'RF-00005720-PAR',
    'RF-00005721-PAR',
    'RF-00005725-PAR',
    'RF-00005727-PAR',
    'RF-00005775-PAR',
    'RF-00005781-PAR',
    'RF-00005782-PAR',
    'RF-00005783-PAR',
    'RF-00005784-PAR',
    'RF-00006322-PAR',
    'RF-00006994-PAR',
    'RF-00007585-PAR',
    'RF-0088-001-PPP',
    'RF-00007594-PAR',
    'RF-00007634-PAR',
    'RF-00007693-PAR',
    'RF-00007714-PAR',
    'RF-00007749-PAR',
    'RF-00008038-PAR',
    'RF-00008056-PAR',
    'RF-00008085-PAR',
    'RF-00008156-PAR',
    'RF-00008184-PAR',
    'RF-00008325-PAR',
    'RF-00008425-PAR',
    'RF-00008451-PAR',
    'RF-00008596-PAR',
    'RF-00008597-PAR',
    'RF-00008598-PAR',
    'RF-00008601-PAR',
    'RF-00008893-PAR',
    'RF-00008904-PAR',
    'RF-00008948-PAR',
    'RF-00008949-PAR',
    'RF-00008987-PAR',
    'RF-00009174-PAR',
    'RF-00009184-PAR',
    'RF-00009274-PAR',
    'RF-00009360-PAR',
    'RF-00009395-PAR',
    'RF-00009403-PAR',
    'RF-00009486-PAR',
    'RF-00009487-PAR',
    'RF-00009593-PAR',
    'RF-00009781-PAR',
    'RF-00009800-PAR',
    'RF-00009913-PAR',
    'RF-0001-001-PPP',
    'RF-00010022-PAR',
    'RF-00010068-PAR',
    'RF-00010217-PAR',
    'RF-00010219-PAR',
    'RF-00010235-PAR',
    'RF-00010250-PAR',
    'RF-00010369-PAR',
    'RF-00010380-PAR',
    'RF-00010416-PAR',
    'RF-00010739-PAR',
    'RF-00010786-PAR',
    'RF-00011505-PAR',
    'RF-00011518-PAR',
    'RF-00011519-PAR',
    'RF-00011560-PAR',
    'RF-00011592-PAR',
    'RF-00011881-PAR',
    'RF-00012043-PAR',
    'RF-00012044-PAR',
    'RF-00012045-PAR',
    'RF-00012046-PAR',
    'RF-00012047-PAR',
    'RF-00012362-PAR',
    'RF-00012370-PAR',
    'RF-00012800-PAR',
    'RF-00012801-PAR',
    'RF-00012802-PAR',
    'RF-0002-001-PPP',
    'RF-0003-001-PPP',
    'RF-0004-001-PPP',
    'RF-0005-001-PPP',
    'RF-0012-001-PPP',
    'RF-0013-001-PPP',
    'RF-0014-001-PPP',
    'RF-0015-001-PPP',
    'RF-0017-001-PPP',
    'RF-0018-001-PPP',
    'RF-0019-001-PPP',
    'RF-0022-001-PPP',
    'RF-0023-001-PPP',
    'RF-0025-001-PPP',
    'RF-0026-001-PPP',
    'RF-0027-001-PPP',
    'RF-0028-001-PPP',
    'RF-0029-001-PPP',
    'RF-0030-001-PPP',
    'RF-0031-001-PPP',
    'RF-0032-001-PPP',
    'RF-0033-001-PPP',
    'RF-0035-001-PPP',
    'RF-0036-001-PPP',
    'RF-0037-001-PPP',
    'RF-0038-001-PPP',
    'RF-0039-001-PPP',
    'RF-0045-001-PPP',
    'RF-0046-001-PPP',
    'RF-0048-001-PPP',
    'RF-0049-001-PPP',
    'RF-0050-001-PPP',
    'RF-0051-001-PPP',
    'RF-0052-001-PPP',
    'RF-0054-001-PPP',
    'RF-0055-001-PPP',
    'RF-0056-001-PPP',
    'RF-0057-001-PPP',
    'RF-0058-001-PPP',
    'RF-0059-001-PPP',
    'RF-0060-001-PPP',
    'RF-0062-001-PPP',
    'RF-0067-001-PPP',
    'RF-0071-001-PPP',
    'RF-0072-001-PPP',
    'RF-0073-001-PPP',
    'RF-0074-001-PPP',
    'RF-0076-001-PPP',
    'RF-0077-001-PPP',
    'RF-0078-001-PPP',
    'RF-0079-001-PPP',
    'RF-0082-001-PPP',
    'RF-0083-001-PPP',
    'RF-0084-001-PPP',
    'RF-0085-001-PPP',
    'RF-0086-003-PPP',
    'RF-0087-001-PPP',
    'RF-0089-001-PPP',
    'RF-0090-001-PPP',
    'RF-0091-001-PPP',
    'RF-0092-001-PPP',
    'RF-0093-001-PPP',
    'RF-0094-001-PPP',
    'RF-0095-001-PPP',
    'RF-0097-001-PPP',
    'RF-0098-001-PPP',
    'RF-0098-002-PPP',
    'RF-0099-001-PPP',
    'RF-0100-001-PPP',
    'RF-0101-001-PPP',
    'RF-0102-001-PPP',
    'RF-0103-001-PPP',
    'RF-0104-001-PPP',
    'RF-0105-001-PPP',
    'RF-0107-001-PPP',
    'RF-0108-001-PPP',
    'RF-0111-001-PPP',
    'RF-0113-001-PPP',
    'RF-0114-001-PPP',
    'RF-0115-001-PPP',
    'RF-0116-001-PPP',
    'RF-0120-001-PPP',
    'RF-0121-001-PPP',
    'RF-0122-001-PPP',
    'RF-0123-001-PPP',
    'RF-0124-001-PPP',
    'RF-0125-001-PPP',
    'RF-0127-001-PPP',
    'RF-0129-001-PPP',
    'RF-0132-001-PPP',
    'RF-0133-001-PPP',
    'RF-0134-001-PPP',
    'RF-0135-001-PPP',
    'RF-0136-001-PPP',
    'RF-0137-002-PPP',
    'RF-0138-001-PPP',
    'RF-0139-002-PPP',
    'RF-0139-003-PPP',
    'RF-0140-001-PPP',
    'RF-0141-001-PPP',
    'RF-0142-001-PPP',
    'RF-0146-001-PPP',
    'RF-0147-001-PPP',
    'RF-0150-001-PPP',
    'RF-0151-001-PPP',
    'RF-0151-005-PPP',
    'RF-0152-002-PPP',
    'RF-0153-001-PPP',
    'RF-0154-001-PPP',
    'RF-0156-001-PPP',
    'RF-0157-001-PPP',
    'RF-0158-001-PPP',
    'RF-0159-001-PPP',
    'RF-0160-001-PPP',
    'RF-0161-001-PPP',
    'RF-0162-001-PPP',
    'RF-0164-001-PPP',
    'RF-0165-001-PPP',
    'RF-0166-001-PPP',
    'RF-0168-001-PPP',
    'RF-0169-001-PPP',
    'RF-0170-001-PPP',
    'RF-0171-001-PPP',
    'RF-0172-001-PPP',
    'RF-0174-001-PPP',
    'RF-0175-001-PPP',
    'RF-0177-001-PPP',
    'RF-0179-001-PPP',
    'RF-0180-001-PPP',
    'RF-0181-001-PPP',
    'RF-0182-001-PPP',
    'RF-0183-001-PPP',
    'RF-0184-001-PPP',
    'RF-0185-001-PPP',
    'RF-0186-001-PPP',
    'RF-0193-001-PPP',
    'RF-0195-001-PPP',
    'RF-0196-001-PPP',
    'RF-0198-001-PPP',
    'RF-0199-001-PPP',
    'RF-0200-001-PPP',
    'RF-0201-002-PPP',
    'RF-0202-001-PPP',
    'RF-0204-001-PPP',
    'RF-0205-001-PPP',
    'RF-0206-001-PPP',
    'RF-0207-001-PPP',
    'RF-0208-001-PPP',
    'RF-0209-001-PPP',
    'RF-0210-001-PPP',
    'RF-0212-001-PPP',
    'RF-0213-001-PPP',
    'RF-0216-001-PPP',
    'RF-0217-001-PPP',
    'RF-0218-001-PPP',
    'RF-0219-001-PPP',
    'RF-0220-001-PPP',
    'RF-0222-001-PPP',
    'RF-0224-001-PPP',
    'RF-0226-001-PPP',
    'RF-0227-001-PPP',
    'RF-0229-001-PPP',
    'RF-0230-001-PPP',
    'RF-0234-001-PPP',
    'RF-0237-001-PPP',
    'RF-0238-001-PPP',
    'RF-0239-002-PPP',
    'RF-0241-001-PPP',
    'RF-00013472-PAR',
    'RF-0243-001-PPP',
    'RF-0245-001-PPP',
    'RF-0247-001-PPP',
    'RF-0248-001-PPP',
    'RF-0249-001-PPP',
    'RF-0250-001-PPP',
    'RF-0251-001-PPP',
    'RF-0252-001-PPP',
    'RF-0254-001-PPP',
    'RF-0255-001-PPP',
    'RF-0256-001-PPP',
    'RF-0257-001-PPP',
    'RF-0258-001-PPP',
    'RF-0260-001-PPP',
    'RF-0262-001-PPP',
    'RF-0263-001-PPP',
    'RF-0264-001-PPP',
    'RF-0265-001-PPP',
    'RF-0267-001-PPP',
    'RF-0272-001-PPP',
    'RF-0273-001-PPP',
    'RF-0274-002-PPP',
    'RF-0277-001-PPP',
    'RF-0278-003-PPP',
    'RF-0281-001-PPP',
    'RF-0282-001-PPP',
    'RF-0284-001-PPP',
    'RF-0286-001-PPP',
    'RF-0287-001-PPP',
    'RF-0288-001-PPP',
    'RF-0289-001-PPP',
    'RF-0290-001-PPP',
    'RF-0293-002-PPP',
    'RF-0293-003-PPP',
    'RF-0294-001-PPP',
    'RF-0295-001-PPP',
    'RF-0296-001-PPP',
    'RF-0298-001-PPP',
    'RF-0299-001-PPP',
    'RF-0300-001-PPP',
    'RF-0301-001-PPP',
    'RF-0304-001-PPP',
    'RF-0305-001-PPP',
    'RF-0306-001-PPP',
    'RF-0307-001-PPP',
    'RF-0310-001-PPP',
    'RF-0311-001-PPP',
    'RF-0312-001-PPP',
    'RF-00013630-PAR',
    'RF-0315-001-PPP',
    'RF-0316-001-PPP',
    'RF-0317-001-PPP',
    'RF-0318-001-PPP',
    'RF-0319-001-PPP',
    'RF-0320-001-PPP',
    'RF-0321-001-PPP',
    'RF-0324-001-PPP',
    'RF-0326-001-PPP',
    'RF-0327-001-PPP',
    'RF-0329-001-PPP',
    'RF-0331-001-PPP',
    'RF-0332-001-PPP',
    'RF-0333-001-PPP',
    'RF-0334-001-PPP',
    'RF-0335-001-PPP',
    'RF-0337-001-PPP',
    'RF-0338-002-PPP',
    'RF-0339-001-PPP',
    'RF-0342-001-PPP',
    'RF-0343-001-PPP',
    'RF-0344-001-PPP',
    'RF-0345-001-PPP',
    'RF-0346-001-PPP',
    'RF-0347-002-PPP',
    'RF-0348-001-PPP',
    'RF-0350-001-PPP',
    'RF-0351-001-PPP',
    'RF-0352-001-PPP',
    'RF-0353-001-PPP',
    'RF-0354-001-PPP',
    'RF-0355-001-PPP',
    'RF-0357-001-PPP',
    'RF-0358-001-PPP',
    'RF-0359-001-PPP',
    'RF-0360-001-PPP',
    'RF-0361-001-PPP',
    'RF-0363-001-PPP',
    'RF-0364-001-PPP',
    'RF-0365-001-PPP',
    'RF-0366-001-PPP',
    'RF-0367-001-PPP',
    'RF-0369-001-PPP',
    'RF-0370-001-PPP',
    'RF-0372-001-PPP',
    'RF-0373-001-PPP',
    'RF-0375-001-PPP',
    'RF-0377-001-PPP',
    'RF-0378-001-PPP',
    'RF-0379-001-PPP',
    'RF-0380-001-PPP',
    'RF-0382-001-PPP',
    'RF-0385-001-PPP',
    'RF-0386-001-PPP',
    'RF-0387-001-PPP',
    'RF-0389-001-PPP',
    'RF-0390-001-PPP',
    'RF-0391-001-PPP',
    'RF-00013247-PAR',
    'RF-0394-001-PPP',
    'RF-0395-001-PPP',
    'RF-0397-001-PPP',
    'RF-0398-001-PPP',
    'RF-0399-001-PPP',
    'RF-0400-001-PPP',
    'RF-0401-001-PPP',
    'RF-0403-001-PPP',
    'RF-0404-001-PPP',
    'RF-0405-001-PPP',
    'RF-0406-001-PPP',
    'RF-0407-001-PPP',
    'RF-00013463-PAR',
    'RF-0410-001-PPP',
    'RF-0412-002-PPP',
    'RF-0413-001-PPP',
    'RF-00013608-PAR',
    'RF-0415-001-PPP',
    'RF-0416-001-PPP',
    'RF-0417-001-PPP',
    'RF-0418-001-PPP',
    'RF-0419-001-PPP',
    'RF-0420-001-PPP',
    'RF-0422-001-PPP',
    'RF-0423-001-PPP',
    'RF-0424-001-PPP',
    'RF-0426-001-PPP',
    'RF-0428-003-PPP',
    'RF-0430-001-PPP',
    'RF-0431-001-PPP',
    'RF-0432-001-PPP',
    'RF-0433-001-PPP',
    'RF-0434-001-PPP',
    'RF-0435-001-PPP',
    'RF-0436-001-PPP',
    'RF-0437-001-PPP',
    'RF-0438-001-PPP',
    'RF-0439-001-PPP',
    'RF-0441-001-PPP',
    'RF-0442-001-PPP',
    'RF-0444-001-PPP',
    'RF-0445-001-PPP',
    'RF-0446-001-PPP',
    'RF-0447-001-PPP',
    'RF-0448-001-PPP',
    'RF-0450-003-PPP',
    'RF-0451-001-PPP',
    'RF-0452-001-PPP',
    'RF-0453-001-PPP',
    'RF-0458-001-PPP',
    'RF-0460-001-PPP',
    'RF-0461-001-PPP',
    'RF-0462-001-PPP',
    'RF-0463-001-PPP',
    'RF-0464-001-PPP',
    'RF-0465-001-PPP',
    'RF-0467-001-PPP',
    'RF-0470-001-PPP',
    'RF-0472-001-PPP',
    'RF-0473-001-PPP',
    'RF-0474-001-PPP',
    'RF-0475-001-PPP',
    'RF-0482-001-PPP',
    'RF-0483-001-PPP',
    'RF-0484-001-PPP',
    'RF-0485-001-PPP',
    'RF-0487-001-PPP',
    'RF-0489-001-PPP',
    'RF-0490-001-PPP',
    'RF-0491-001-PPP',
    'RF-0493-001-PPP',
    'RF-0494-001-PPP',
    'RF-0495-001-PPP',
    'RF-0496-001-PPP',
    'RF-0497-001-PPP',
    'RF-0499-001-PPP',
    'RF-0500-001-PPP',
    'RF-0501-001-PPP',
    'RF-0503-001-PPP',
    'RF-0504-001-PPP',
    'RF-0505-001-PPP',
    'RF-0506-001-PPP',
    'RF-0507-001-PPP',
    'RF-0508-001-PPP',
    'RF-0510-001-PPP',
    'RF-0511-001-PPP',
    'RF-0512-001-PPP',
    'RF-0515-001-PPP',
    'RF-0516-001-PPP',
    'RF-0517-001-PPP',
    'RF-0518-001-PPP',
    'RF-0519-001-PPP',
    'RF-0521-001-PPP',
    'RF-0522-001-PPP',
    'RF-0525-001-PPP',
    'RF-0528-001-PPP',
    'RF-0529-001-PPP',
    'RF-0535-001-PPP',
    'RF-0537-001-PPP',
    'RF-0538-001-PPP',
    'RF-0539-001-PPP',
    'RF-0540-001-PPP',
    'RF-0541-001-PPP',
    'RF-0544-001-PPP',
    'RF-0546-001-PPP',
    'RF-0547-001-PPP',
    'RF-0549-001-PPP',
    'RF-0550-001-PPP',
    'RF-0553-001-PPP',
    'RF-0554-001-PPP',
    'RF-0556-001-PPP',
    'RF-0557-001-PPP',
    'RF-0558-001-PPP',
    'RF-0561-001-PPP',
    'RF-0564-001-PPP',
    'RF-0566-001-PPP',
    'RF-0570-001-PPP',
    'RF-0571-001-PPP',
    'RF-0572-001-PPP',
    'RF-0573-001-PPP',
    'RF-0576-001-PPP',
    'RF-0580-001-PPP',
    'RF-0583-001-PPP',
    'RF-0584-001-PPP',
    'RF-0589-001-PPP',
    'RF-0594-002-PPP',
    'RF-0595-001-PPP',
    'RF-0596-001-PPP',
    'RF-0597-001-PPP',
    'RF-0599-001-PPP',
    'RF-0600-001-PPP',
    'RF-0603-001-PPP',
    'RF-0607-001-PPP',
    'RF-0608-001-PPP',
    'RF-0610-001-PPP',
    'RF-0612-001-PPP',
    'RF-0614-001-PPP',
    'RF-0615-001-PPP',
    'RF-0617-001-PPP',
    'RF-0618-001-PPP',
    'RF-0619-001-PPP',
    'RF-0620-001-PPP',
    'RF-0621-001-PPP',
    'RF-0622-001-PPP',
    'RF-0623-001-PPP',
    'RF-0624-001-PPP',
    'RF-0626-001-PPP',
    'RF-0627-001-PPP',
    'RF-0629-001-PPP',
    'RF-0630-001-PPP',
    'RF-0631-001-PPP',
    'RF-0633-001-PPP',
    'RF-0636-001-PPP',
    'RF-0637-001-PPP',
    'RF-0638-001-PPP',
    'RF-0640-001-PPP',
    'RF-0641-001-PPP',
    'RF-0645-001-PPP',
    'RF-0646-001-PPP',
    'RF-0647-001-PPP',
    'RF-00014212-PAR',
    'RF-0652-001-PPP',
    'RF-0654-001-PPP',
    'RF-0656-001-PPP',
    'RF-0657-001-PPP',
    'RF-0658-001-PPP',
    'RF-0659-001-PPP',
    'RF-0660-001-PPP',
    'RF-0664-001-PPP',
    'RF-0665-001-PPP',
    'RF-0668-001-PPP',
    'RF-0671-001-PPP',
    'RF-0672-001-PPP',
    'RF-0676-001-PPP',
    'RF-0677-001-PPP',
    'RF-0678-001-PPP',
    'RF-0680-001-PPP',
    'RF-0682-001-PPP',
    'RF-0683-001-PPP',
    'RF-0684-001-PPP',
    'RF-0685-002-PPP',
    'RF-0687-001-PPP',
    'RF-0688-001-PPP',
    'RF-0689-001-PPP',
    'RF-0691-001-PPP',
    'RF-0696-001-PPP',
    'RF-0697-001-PPP',
    'RF-0700-001-PPP',
    'RF-0702-001-PPP',
    'RF-0706-001-PPP',
    'RF-0707-001-PPP',
    'RF-0709-001-PPP',
    'RF-0710-001-PPP',
    'RF-0714-001-PPP',
    'RF-0717-001-PPP',
    'RF-0718-001-PPP',
    'RF-0719-001-PPP',
    'RF-0723-001-PPP',
    'RF-0724-001-PPP',
    'RF-0725-001-PPP',
    'RF-0726-001-PPP',
    'RF-0727-001-PPP',
    'RF-0729-001-PPP',
    'RF-0732-001-PPP',
    'RF-0737-001-PPP',
    'RF-0738-001-PPP',
    'RF-0739-001-PPP',
    'RF-0740-001-PPP',
    'RF-0743-001-PPP',
    'RF-0744-001-PPP',
    'RF-0745-001-PPP',
    'RF-0746-001-PPP',
    'RF-0749-001-PPP',
    'RF-0751-001-PPP',
    'RF-0752-001-PPP',
    'RF-0753-001-PPP',
    'RF-0754-001-PPP',
    'RF-0756-001-PPP',
    'RF-0758-001-PPP',
    'RF-0760-001-PPP',
    'RF-0762-001-PPP',
    'RF-0763-001-PPP',
    'RF-0764-001-PPP',
    'RF-0765-001-PPP',
    'RF-0766-001-PPP',
    'RF-0768-001-PPP',
    'RF-0770-001-PPP',
    'RF-0771-001-PPP',
    'RF-0772-001-PPP',
    'RF-0773-001-PPP',
    'RF-0774-001-PPP',
    'RF-0776-001-PPP',
    'RF-0778-001-PPP',
    'RF-0779-001-PPP',
    'RF-0780-001-PPP',
    'RF-0781-001-PPP',
    'RF-0782-001-PPP',
    'RF-0783-001-PPP',
    'RF-0786-001-PPP',
    'RF-00014532-PAR',
    'RF-0792-001-PPP',
    'RF-0793-001-PPP',
    'RF-0794-001-PPP',
    'RF-0795-001-PPP',
    'RF-0797-001-PPP',
    'RF-0798-001-PPP',
    'RF-0799-001-PPP',
    'RF-0800-001-PPP',
    'RF-0803-001-PPP',
    'RF-0804-001-PPP',
    'RF-0805-001-PPP',
    'RF-0809-001-PPP',
    'RF-0810-001-PPP',
    'RF-0812-001-PPP',
    'RF-0817-001-PPP',
    'RF-0819-001-PPP',
    'RF-0820-001-PPP',
    'RF-0821-001-PPP',
    'RF-0822-001-PPP',
    'RF-0835-001-PPP',
    'RF-0839-001-PPP',
    'RF-0840-001-PPP',
    'RF-0841-001-PPP',
    'RF-0842-001-PPP',
    'RF-0845-001-PPP',
    'RF-0846-001-PPP',
    'RF-0847-001-PPP',
    'RF-0848-001-PPP',
    'RF-0851-001-PPP',
    'RF-0852-001-PPP',
    'RF-0854-001-PPP',
    'RF-0855-001-PPP',
    'RF-0857-001-PPP',
    'RF-0859-001-PPP',
    'RF-0860-001-PPP',
    'RF-0862-001-PPP',
    'RF-0863-001-PPP',
    'RF-0864-001-PPP',
    'RF-0866-001-PPP',
    'RF-0867-001-PPP',
    'RF-0868-001-PPP',
    'RF-0869-001-PPP',
    'RF-0870-001-PPP',
    'RF-0872-001-PPP',
    'RF-0873-001-PPP',
    'RF-0876-001-PPP',
    'RF-0877-001-PPP',
    'RF-0878-001-PPP',
    'RF-0879-001-PPP',
    'RF-0880-001-PPP',
    'RF-0882-001-PPP',
    'RF-0883-001-PPP',
    'RF-0885-001-PPP',
    'RF-0886-001-PPP',
    'RF-0893-001-PPP',
    'RF-0894-001-PPP',
    'RF-0895-001-PPP',
    'RF-0897-001-PPP',
    'RF-0899-001-PPP',
    'RF-0901-001-PPP',
    'RF-0903-001-PPP',
    'RF-0905-001-PPP',
    'RF-0906-001-PPP',
    'RF-0908-001-PPP',
    'RF-0909-001-PPP',
    'RF-0911-001-PPP',
    'RF-0912-001-PPP',
    'RF-0916-001-PPP',
    'RF-0919-001-PPP',
    'RF-0920-001-PPP',
    'RF-0922-001-PPP',
    'RF-0923-001-PPP',
    'RF-0927-001-PPP',
    'RF-0928-001-PPP',
    'RF-0929-001-PPP',
    'RF-0932-001-PPP',
    'RF-0933-001-PPP',
    'RF-0936-001-PPP',
    'RF-0937-001-PPP',
    'RF-0938-001-PPP',
    'RF-0940-001-PPP',
    'RF-0941-001-PPP',
    'RF-0942-001-PPP',
    'RF-0943-001-PPP',
    'RF-0944-001-PPP',
    'RF-0947-001-PPP',
    'RF-0948-001-PPP',
    'RF-0954-001-PPP',
    'RF-0956-001-PPP',
    'RF-0957-001-PPP',
    'RF-0958-001-PPP',
    'RF-0959-001-PPP',
    'RF-0960-001-PPP',
    'RF-0967-001-PPP',
    'RF-0968-001-PPP',
    'RF-0969-001-PPP',
    'RF-0970-001-PPP',
    'RF-0971-001-PPP',
    'RF-0972-001-PPP',
    'RF-0974-001-PPP',
    'RF-0981-001-PPP',
    'RF-1004-001-PPP',
    'RF-1009-001-PPP',
    'RF-1020-001-PPP',
    'RF-1042-001-PPP',
    'RF-1043-001-PPP',
    'RF-1046-001-PPP',
    'RF-1055-001-PPP',
    'RF-1056-001-PPP',
    'RF-1057-001-PPP',
    'RF-1062-001-PPP',
    'RF-1071-001-PPP',
    'RF-00009238-PAR',
    'RF-00012298-PAR',
    'RF-00013414-PAR',
    'RF-00013741-PAR',
    'RF-00014144-PAR',
    'RF-00014213-PAR',
    'RF-00014255-PAR',
    'RF-00014535-PAR',
    'RF-00014542-PAR',
    'RF-00014543-PAR',
    'RF-00014544-PAR',
    'RF-00014552-PAR',
  ],
  {
    errorMap: () => ({
      message: 'Veuillez renseigner le résidu.',
    }),
  }
);
export type SimpleResidue = z.infer<typeof SimpleResidue>;

export const SimpleResidueList = SimpleResidue.options;
