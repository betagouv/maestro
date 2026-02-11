import { Analysis } from 'maestro-shared/schema/Analysis/Analysis';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { SachaResultats } from './sachaValidator';

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
