import { createContext } from 'react';
import * as addressApi from './address.service';
import * as analysisApi from './analysis.service';
import * as authApi from './auth.service';
import * as companyApi from './company.service';
import * as documentApi from './document.service';
import * as laboratoryApi from './laboratory.service';
import * as notificationApi from './notification.service';
import * as prescriptionApi from './prescription.service';
import * as programmingPlanApi from './programmingPlan.service';
import * as regionApi from './region.service';
import * as regionalPrescriptionApi from './regionalPrescription.service';
import * as sampleApi from './sample.service';
import * as userApi from './user.service';

export type ApiClient = typeof analysisApi &
  typeof addressApi &
  typeof authApi &
  typeof companyApi &
  typeof documentApi &
  typeof laboratoryApi &
  typeof notificationApi &
  typeof prescriptionApi &
  typeof programmingPlanApi &
  typeof regionApi &
  typeof regionalPrescriptionApi &
  typeof sampleApi &
  typeof userApi;

export const apiClient: ApiClient = {
  ...addressApi,
  ...authApi,
  ...analysisApi,
  ...companyApi,
  ...documentApi,
  ...laboratoryApi,
  ...notificationApi,
  ...prescriptionApi,
  ...programmingPlanApi,
  ...regionalPrescriptionApi,
  ...regionApi,
  ...sampleApi,
  ...userApi
};

export const ApiClientContext = createContext<ApiClient>(undefined as never);
