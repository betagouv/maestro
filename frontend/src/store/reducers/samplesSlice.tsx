import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import fp from 'lodash';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  PartialSample,
  PartialSampleToCreate,
} from 'maestro-shared/schema/Sample/Sample';
import { SampleListDisplay } from 'src/views/SampleListView/SampleListView';
import { z } from 'zod';
const pendingSamples = JSON.parse(
  localStorage.getItem('pendingSamples') ?? '[]'
).reduce(
  (acc: Record<string, PartialSample | PartialSampleToCreate>, _: any) => {
    const sample = z
      .union([PartialSampleToCreate, PartialSample])
      .parse(fp.omitBy(_, fp.isNil));
    acc[sample.id] = sample;
    return acc;
  },
  {} as Record<string, PartialSample | PartialSampleToCreate>
);

type SamplesState = {
  sampleListDisplay: SampleListDisplay;
  findSampleOptions: Omit<FindSampleOptions, 'programmingPlanId'>;
  pendingSamples: Record<string, PartialSample | PartialSampleToCreate>;
};

const samplesSlice = createSlice({
  name: 'samples',
  initialState: {
    sampleListDisplay: 'cards',
    findSampleOptions: {
      page: 1,
      perPage: defaultPerPage,
      region: undefined,
      department: undefined,
      status: undefined,
      programmingPlanId: undefined,
      context: undefined,
    },
    pendingSamples,
  } as SamplesState,
  reducers: {
    changeListDisplay: (state, action: PayloadAction<SampleListDisplay>) => {
      state.sampleListDisplay = action.payload;
    },
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
    addPendingSample: (
      state,
      action: PayloadAction<PartialSample | PartialSampleToCreate>
    ) => {
      state.pendingSamples[action.payload.id] = action.payload;
      localStorage.setItem(
        'pendingSamples',
        JSON.stringify(Object.values(state.pendingSamples))
      );
    },
    removePendingSample: (state, action: PayloadAction<string>) => {
      state.pendingSamples = Object.entries(state.pendingSamples).reduce(
        (acc, [key, value]) => {
          if (key !== action.payload) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, PartialSample | PartialSampleToCreate>
      );
      localStorage.setItem(
        'pendingSamples',
        JSON.stringify(Object.values(state.pendingSamples))
      );
    },
  },
});

export default samplesSlice;
