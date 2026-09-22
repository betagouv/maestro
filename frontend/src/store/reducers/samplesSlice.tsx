import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { isNil, omitBy } from 'lodash-es';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import type { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  getStoredListDisplay,
  type ListDisplay,
  setStoredListDisplay
} from 'src/store/localStorage';

type SamplesState = {
  sampleListDisplay: ListDisplay;
  findSampleOptions: Omit<FindSampleOptions, 'programmingPlanId'>;
};

const samplesSlice = createSlice({
  name: 'samples',
  initialState: {
    sampleListDisplay: getStoredListDisplay('sampleListDisplay'),
    findSampleOptions: {
      page: 1,
      perPage: defaultPerPage,
      region: undefined,
      department: undefined,
      status: undefined,
      programmingPlanId: undefined,
      contexts: undefined
    }
  } as SamplesState,
  reducers: {
    changeListDisplay: (state, action: PayloadAction<ListDisplay>) => {
      state.sampleListDisplay = action.payload;
      setStoredListDisplay('sampleListDisplay', action.payload);
    },
    changeFindOptions: (
      state,
      action: PayloadAction<Partial<FindSampleOptions>>
    ) => {
      state.findSampleOptions = omitBy(
        {
          ...state.findSampleOptions,
          ...action.payload
        },
        isNil
      );
    }
  }
});

export default samplesSlice;
