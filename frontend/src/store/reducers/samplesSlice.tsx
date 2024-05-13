import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import fp from 'lodash';
import { defaultPerPage } from 'shared/schema/commons/Pagination';
import { FindSampleOptions } from 'shared/schema/Sample/FindSampleOptions';

type SamplesState = {
  findSampleOptions: FindSampleOptions;
};

const samplesSlice = createSlice({
  name: 'samples',
  initialState: {
    findSampleOptions: {
      page: 1,
      perPage: defaultPerPage,
      region: undefined,
      department: undefined,
      status: undefined,
      programmingPlanId: undefined,
    },
  } as SamplesState,
  reducers: {
    changeFindOptions: (
      state,
      action: PayloadAction<Partial<FindSampleOptions>>
    ) => {
      state.findSampleOptions = fp.omitBy(
        {
          ...state.findSampleOptions,
          ...action.payload,
        },
        fp.isNil
      );
    },
  },
});

export default samplesSlice;
