import { createContext } from 'react';
import * as addressApi from './address.service';
import * as analysisApi from './analysis.service';
import * as analysisDaiApi from './analysisDai.service';
import * as analysisRaiApi from './analysisRai.service';
import * as authApi from './auth.service';
import * as companyApi from './company.service';
import * as documentApi from './document.service';
import * as laboratoryApi from './laboratory.service';
import * as laboratoryResidueMappingApi from './laboratoryResidueMapping.service';
import * as localPrescriptionApi from './localPrescription.service';
import * as mascaradeApi from './mascarade.service';
import * as noticeApi from './notice.service';
import * as notificationApi from './notification.service';
import * as prescriptionApi from './prescription.service';
import * as programmingPlanApi from './programmingPlan.service';
import * as programmingProgrammingSubPlanFieldsApi from './programmingProgrammingSubPlanFields.service';
import * as regionApi from './region.service';
import * as sachaCommemoratifsApi from './sachaCommemoratifs.service';
import * as sampleApi from './sample.service';
import * as specificDataFieldsApi from './specificDataFields.service';
import * as userApi from './user.service';

export type ApiClient = typeof analysisApi &
  typeof analysisDaiApi &
  typeof analysisRaiApi &
  typeof addressApi &
  typeof authApi &
  typeof companyApi &
  typeof documentApi &
  typeof laboratoryApi &
  typeof laboratoryResidueMappingApi &
  typeof mascaradeApi &
  typeof notificationApi &
  typeof prescriptionApi &
  typeof programmingPlanApi &
  typeof programmingProgrammingSubPlanFieldsApi &
  typeof specificDataFieldsApi &
  typeof regionApi &
  typeof localPrescriptionApi &
  typeof sachaCommemoratifsApi &
  typeof sampleApi &
  typeof userApi &
  typeof noticeApi;

export const apiClient: ApiClient = {
  ...addressApi,
  ...authApi,
  ...analysisApi,
  ...analysisDaiApi,
  ...analysisRaiApi,
  ...companyApi,
  ...documentApi,
  ...laboratoryApi,
  ...laboratoryResidueMappingApi,
  ...mascaradeApi,
  ...notificationApi,
  ...prescriptionApi,
  ...programmingPlanApi,
  ...programmingProgrammingSubPlanFieldsApi,
  ...specificDataFieldsApi,
  ...localPrescriptionApi,
  ...regionApi,
  ...noticeApi,
  ...sachaCommemoratifsApi,
  ...sampleApi,
  ...userApi
};

export const ApiClientContext = createContext<ApiClient>(undefined as never);
