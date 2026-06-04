import { describe, expect, test } from 'vitest';
import { AppRouteLinks } from './AppRouteLinks';

describe('AppRouteLinks', () => {
  test('a route without param nor query builds its path', () => {
    expect(AppRouteLinks.DashboardRoute.link()).toBe('/');
    expect(AppRouteLinks.DocumentsRoute.link()).toBe('/documents');
  });

  test('a route with a single param builds the link', () => {
    expect(AppRouteLinks.SampleRoute.link('abc-123')).toBe(
      '/prelevements/abc-123'
    );
    expect(AppRouteLinks.SamplesByYearRoute.link(2025)).toBe(
      '/programmation/2025/prelevements'
    );
  });

  test('an optional param is dropped from the link when omitted', () => {
    expect(AppRouteLinks.AdminRoute.link('laboratoires')).toBe(
      '/admin/laboratoires'
    );
    expect(AppRouteLinks.AdminRoute.link('laboratoires', '42')).toBe(
      '/admin/laboratoires/42'
    );
  });

  test('appends a typed query', () => {
    expect(AppRouteLinks.ProgrammingRoute.link({ year: 2025 })).toBe(
      '/programmation?year=2025'
    );
    expect(AppRouteLinks.DocumentsRoute.link({ documentId: 'doc-1' })).toBe(
      '/documents?documentId=doc-1'
    );
  });

  test('appends a query after the path param', () => {
    expect(
      decodeURIComponent(
        AppRouteLinks.SamplesByYearRoute.link(2025, {
          statuses: ['Sent']
        })
      )
    ).toBe('/programmation/2025/prelevements?statuses=Sent');
  });
});
