export type SachaError =
  | { kind: 'xml-invalid'; fileName: string; detail: string }
  | { kind: 'no-results'; fileName: string }
  | {
      kind: 'no-laboratory';
      fileName: string;
      sampleId: string;
      itemNumber: number;
      copyNumber: number;
    };
