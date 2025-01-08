import { describe, expect, test, vi } from 'vitest';
import documentService from '../documentService';

describe('loadIconSyles', () => {
  test('should replace icon paths with base64 encoded images', async () => {
    const initialStyle = 'url(../icons/test/fr-warning-fill.svg)';
    const icons = ['warning-fill'];

    vi.spyOn(documentService, 'imageUrlToBase64').mockResolvedValue(
      'data:image/svg+xml;base64,mockedBase64String'
    );

    const result = await documentService.loadIconSyles(initialStyle, icons);

    expect(result).toContain('data:image/svg+xml;base64,');
  });

  test('should handle multiple icons', async () => {
    const initialStyle =
      'url(../icons/warning-fill.svg) url(../icons/test/user-line.svg)';
    const icons = ['warning-fill', 'user-line'];
    const result = await documentService.loadIconSyles(initialStyle, icons);

    expect(result).toContain('data:image/svg+xml;base64,');
    expect(result).toContain('data:image/svg+xml;base64,');
  });

  test('should return initial style if no icons are found', async () => {
    const initialStyle = 'url(../icons/test/non-existent-icon.svg)';
    const icons = ['warning-fill'];
    const result = await documentService.loadIconSyles(initialStyle, icons);

    expect(result).toBe(initialStyle);
  });

  test('should throw an error if image conversion fails', async () => {
    const initialStyle = 'url(../icons/test/warning-fill.svg)';
    const icons = ['warning-fill'];

    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    await expect(
      documentService.loadIconSyles(initialStyle, icons)
    ).rejects.toThrow('Erreur lors de la conversion : Network error');
  });
});
