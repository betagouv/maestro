import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { isNil, omitBy } from 'lodash-es';
import { defaultPerPage } from 'maestro-shared/schema/commons/Pagination';
import type { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import {
  getStoredListDisplay,
  type ListDisplay,
  setStoredListDisplay
} from 'src/store/localStorage';
import { z } from 'zod';

const pendingSamples = JSON.parse(
  localStorage.getItem('pendingSamples') ?? '[]'
).reduce(
  (acc: Record<string, PartialSample | PartialSampleToCreate>, _: any) => {
    const sample = z
      .union([PartialSampleToCreate, PartialSample])
      .parse(omitBy(_, isNil));
    acc[sample.id] = sample;
    return acc;
  },
  {} as Record<string, PartialSample | PartialSampleToCreate>
);

type SamplesState = {
  sampleListDisplay: ListDisplay;
  findSampleOptions: Omit<FindSampleOptions, 'programmingPlanId'>;
  pendingSamples: Record<string, PartialSample | PartialSampleToCreate>;
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
    },
    pendingSamples
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
    }
  }
});

export default samplesSlice;
