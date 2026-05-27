import type { MaestroDate } from 'maestro-shared/utils/date';
import { describe, expect, test } from 'vitest';
import { computeAnalysisStatus } from './sampleController';

describe('computeAnalysisStatus', () => {
  const noAnalysis = undefined;
  const noReportDocs: string[] = [];
  const oneReportDoc = ['doc-id'];

  test('should return the current analysis status when isAdmissible is null and receiptDate is unchanged', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: null, receiptDate: null },
        null,
        { status: 'Analysis', compliance: null },
        noReportDocs
      )
    ).toBe('Analysis');
  });

  test('should return Sent when isAdmissible is null, receiptDate is unchanged and no analysis exists', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: null, receiptDate: null },
        null,
        noAnalysis,
        noReportDocs
      )
    ).toBe('Sent');
  });

  test('should return NotAdmissible when isAdmissible is undefined and analysis is NotAdmissible (no change)', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: undefined, receiptDate: undefined },
        null,
        { status: 'NotAdmissible', compliance: null },
        noReportDocs
      )
    ).toBe('NotAdmissible');
  });

  test('should return Sent when resetting admissibility (null) from NotAdmissible without receiptDate', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: null, receiptDate: undefined },
        null,
        { status: 'NotAdmissible', compliance: null },
        noReportDocs
      )
    ).toBe('Sent');
  });

  test('should return Analysis when resetting admissibility (null) from NotAdmissible with receiptDate and no report document', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: null, receiptDate: '2026-01-15' as MaestroDate },
        null,
        { status: 'NotAdmissible', compliance: null },
        noReportDocs
      )
    ).toBe('Analysis');
  });

  test('should return InReview when resetting admissibility (null) from NotAdmissible with receiptDate and a report document', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: null, receiptDate: '2026-01-15' as MaestroDate },
        null,
        { status: 'NotAdmissible', compliance: null },
        oneReportDoc
      )
    ).toBe('InReview');
  });

  test('should return Completed when resetting admissibility (null) from NotAdmissible with receiptDate and compliance', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: null, receiptDate: '2026-01-15' as MaestroDate },
        null,
        { status: 'NotAdmissible', compliance: true },
        noReportDocs
      )
    ).toBe('Completed');
  });

  test('should return NotAdmissible when isAdmissible is false', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: false, receiptDate: '2026-01-15' as MaestroDate },
        null,
        { status: 'Sent', compliance: null },
        noReportDocs
      )
    ).toBe('NotAdmissible');
  });

  test('should return NotAdmissible when isAdmissible is false and no analysis exists', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: false, receiptDate: '2026-01-15' as MaestroDate },
        null,
        noAnalysis,
        noReportDocs
      )
    ).toBe('NotAdmissible');
  });

  test('should return Sent when isAdmissible is true and no analysis exists', () => {
    expect(
      computeAnalysisStatus(
        {
          isAdmissible: true,
          receiptDate: '2026-01-15' as MaestroDate as MaestroDate
        },
        null,
        noAnalysis,
        noReportDocs
      )
    ).toBe('Sent');
  });

  test('should return Analysis when transitioning from Sent to admissible without report document', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: true, receiptDate: '2026-01-15' as MaestroDate },
        null,
        { status: 'Sent', compliance: null },
        noReportDocs
      )
    ).toBe('Analysis');
  });

  test('should return InReview when transitioning from Sent to admissible with a report document', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: true, receiptDate: '2026-01-15' as MaestroDate },
        null,
        { status: 'Sent', compliance: null },
        oneReportDoc
      )
    ).toBe('InReview');
  });

  test('should return Analysis when transitioning from NotAdmissible to admissible without report document', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: true, receiptDate: '2026-01-15' as MaestroDate },
        null,
        { status: 'NotAdmissible', compliance: null },
        noReportDocs
      )
    ).toBe('Analysis');
  });

  test('should return Completed when transitioning from NotAdmissible to admissible with compliance', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: true, receiptDate: '2026-01-15' as MaestroDate },
        null,
        { status: 'NotAdmissible', compliance: true },
        noReportDocs
      )
    ).toBe('Completed');
  });

  test('should return Completed when transitioning from Sent to admissible with compliance', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: true, receiptDate: '2026-01-15' as MaestroDate },
        null,
        { status: 'Sent', compliance: true },
        noReportDocs
      )
    ).toBe('Completed');
  });

  test('should return the current status when isAdmissible is true but status is not NotAdmissible or Sent', () => {
    expect(
      computeAnalysisStatus(
        { isAdmissible: true, receiptDate: '2026-01-15' as MaestroDate },
        null,
        { status: 'Analysis', compliance: null },
        noReportDocs
      )
    ).toBe('Analysis');

    expect(
      computeAnalysisStatus(
        { isAdmissible: true, receiptDate: '2026-01-15' as MaestroDate },
        null,
        { status: 'InReview', compliance: null },
        noReportDocs
      )
    ).toBe('InReview');

    expect(
      computeAnalysisStatus(
        { isAdmissible: true, receiptDate: '2026-01-15' as MaestroDate },
        null,
        { status: 'Completed', compliance: true },
        noReportDocs
      )
    ).toBe('Completed');
  });
});
