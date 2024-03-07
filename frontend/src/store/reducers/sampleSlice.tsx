import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
import { DraftSampleStep1 } from 'shared/schema/Sample';

const SamplesKey = 'samples';

const samples = JSON.parse(localStorage.getItem(SamplesKey) ?? '[]');

type SampleState = {
  samples: DraftSampleStep1[];
};

const sampleSlice = createSlice({
  name: 'sample',
  initialState: { samples },
  reducers: {
    saveSample: (state, action) => {
      state.samples = _.uniqBy([action.payload, ...state.samples], 'resytalId');
      localStorage.setItem(SamplesKey, JSON.stringify(state.samples));
    },
  },
});

export default sampleSlice;
