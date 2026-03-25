import type { Analysis } from 'maestro-shared/schema/Analysis/Analysis';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import type { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import type { SachaResultats } from './sachaValidator';

export const processSachaRAI = (
  _rai: SachaResultats
): { analysis: Analysis; sampleItem: SampleItem; sample: SampleChecked } => {
  //FIXME EDI il faut transformer une RAI sacha en analysis
  return {} as {
    analysis: Analysis;
    sampleItem: SampleItem;
    sample: SampleChecked;
  };
};
