import { ExportDataFromEmail, IsSender, LaboratoryConf } from './index';


const isSender: IsSender = (_emailSender) => true

const exportDataFromEmail: ExportDataFromEmail = (email) => email


export const girpaConf: LaboratoryConf = {
  isSender,
  exportDataFromEmail
}