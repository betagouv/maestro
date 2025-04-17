import carbone from 'carbone';
import { AnalysisRequestData } from 'maestro-shared/schema/Analysis/AnalysisRequestData';
import { templatePath } from '../../templates/templates';

const generateAnalysisRequestExcel = async (data: AnalysisRequestData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    carbone.render(
      templatePath('analysisRequest'),
      data,
      {
        convertTo: 'xlsx'
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result as Buffer);
        }
      }
    );
  });
};

export default {
  generateAnalysisRequestExcel
};
