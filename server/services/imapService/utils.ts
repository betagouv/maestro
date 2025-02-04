import {parse} from 'csv-parse/sync'

export const csvToJson = (csv: string, separator: string): Record<string, string>[] => {
  return parse(csv, {columns: true, skip_empty_lines: true, skip_records_with_empty_values: true, delimiter: separator, })
};

