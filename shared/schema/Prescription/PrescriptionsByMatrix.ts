//
// export const PrescriptionByMatrix = z.object({
//   programmingPlanId: z.string().uuid(),
//   context: Context,
//   matrix: Matrix,
//   stages: z.array(Stage),
//   regionalPrescriptions: z.array(RegionalPrescription),
// });
//
// export type RegionalPrescription = z.infer<typeof RegionalPrescription>;
// export type PrescriptionByMatrix = z.infer<typeof PrescriptionByMatrix>;
//
// export const genPrescriptionByMatrix = (
//   prescriptions: Prescription[],
//   samples: PartialSample[],
//   includedRegions: Region[]
// ): PrescriptionByMatrix[] =>
//   (prescriptions ?? [])
//     .reduce((acc, prescription) => {
//       if (
//         !acc.some(
//           (p) =>
//             p.programmingPlanId === prescription.programmingPlanId &&
//             p.context === prescription.context &&
//             p.matrix === prescription.matrix &&
//             _.isEqual(p.stages, prescription.stages)
//         )
//       ) {
//         acc.push({
//           programmingPlanId: prescription.programmingPlanId,
//           context: prescription.context,
//           matrix: prescription.matrix,
//           stages: prescription.stages,
//           regionalPrescriptions: includedRegions.map((region) => {
//             const regionalPrescription = prescriptions.find(
//               (p) =>
//                 p.programmingPlanId === prescription.programmingPlanId &&
//                 p.matrix === prescription.matrix &&
//                 _.isEqual(p.stages, prescription.stages) &&
//                 p.region === region
//             ) as Prescription;
//             const regionalSamples = samples.filter(
//               (sample) =>
//                 sample.programmingPlanId === prescription.programmingPlanId &&
//                 sample.matrix === prescription.matrix &&
//                 sample.stage !== undefined &&
//                 prescription.stages.includes(sample.stage) &&
//                 getSampleRegion(sample) === region
//             );
//
//             return {
//               prescriptionId: regionalPrescription.id,
//               sampleCount: regionalPrescription.sampleCount,
//               realizedSampleCount: regionalSamples.length,
//               region,
//               laboratoryId: regionalPrescription.laboratoryId,
//               comments: regionalPrescription.comments,
//             };
//           }),
//         });
//       }
//       return acc;
//     }, [] as PrescriptionByMatrix[])
//     .sort((a, b) =>
//       [
//         a.programmingPlanId,
//         MatrixLabels[a.matrix],
//         ...a.stages.map((_) => StageLabels[_]),
//       ]
//         .join()
//         .localeCompare(
//           [
//             b.programmingPlanId,
//             MatrixLabels[b.matrix],
//             ...b.stages.map((_) => StageLabels[_]),
//           ].join()
//         )
//     );
//
// export const matrixCompletionRate = (
//   prescriptionMatrix: PrescriptionByMatrix | PrescriptionByMatrix[],
//   region?: Region
// ) => {
//   const prescriptionsWithLimitedSentCount: PrescriptionByMatrix[] = (
//     Array.isArray(prescriptionMatrix)
//       ? prescriptionMatrix
//       : [prescriptionMatrix]
//   ).map((prescription) => ({
//     ...prescription,
//     regionalPrescriptions: prescription.regionalPrescriptions.map((data) => ({
//       ...data,
//       realizedSampleCount: Math.min(data.sampleCount, data.realizedSampleCount),
//     })),
//   }));
//
//   const totalSampleCount = _.sumBy(
//     prescriptionsWithLimitedSentCount,
//     (prescription) =>
//       region
//         ? prescription.regionalPrescriptions.find((_) => _.region === region)
//             ?.sampleCount ?? 0
//         : _.sumBy(prescription.regionalPrescriptions, 'sampleCount')
//   );
//
//   const totalRealizedSampleCount = _.sumBy(
//     prescriptionsWithLimitedSentCount,
//     (prescription) =>
//       region
//         ? prescription.regionalPrescriptions.find((_) => _.region === region)
//             ?.realizedSampleCount ?? 0
//         : _.sumBy(prescription.regionalPrescriptions, 'realizedSampleCount')
//   );
//
//   return totalSampleCount
//     ? Number(((totalRealizedSampleCount / totalSampleCount) * 100).toFixed(2))
//     : 100;
// };
//
// export const completionRate = (
//   prescriptions: Prescription[],
//   samples: PartialSample[],
//   region?: Region
// ): number => {
//   const prescriptionsByMatrix = genPrescriptionByMatrix(
//     prescriptions,
//     samples,
//     region ? [region] : RegionList
//   );
//   return matrixCompletionRate(prescriptionsByMatrix, region);
// };
