import { describe, expect, test } from 'vitest';
import { noticesRepository } from './noticesRepository';

describe('notices', () => {
  test('find and update', async () => {
    let noticeRoot = await noticesRepository.findByType('root');

    expect(noticeRoot).toEqual({
      type: 'root',
      title: null,
      description: null
    });

    await noticesRepository.update({
      type: 'root',
      title: 'title',
      description: 'description'
    });

    noticeRoot = await noticesRepository.findByType('root');
    expect(noticeRoot).toEqual({
      type: 'root',
      title: 'title',
      description: 'description'
    });
  });
});
