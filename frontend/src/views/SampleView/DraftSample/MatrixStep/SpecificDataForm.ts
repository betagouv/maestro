export type SpecificDataFormInputProps = {
  classes?: {
    container?: string[];
  };
};

export const SpecificDataForm: Record<
  string,
  Record<string, SpecificDataFormInputProps> | undefined
> = {
  PPV: {
    matrixDetails: { classes: { container: ['fr-col-sm-12', 'fr-pt-3w'] } }
  }
};
