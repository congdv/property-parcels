import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportParcelsCSV } from './exportService';
import * as envModule from '../env';

vi.mock('../env');

// Mock URL methods
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('exportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (envModule as any).API_BASE_URL = 'http://api.example.com';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('exportParcelsCSV', () => {
    it('should construct URL with filter parameters', async () => {
      const mockBlob = new Blob(['test data']);
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: {
          get: vi.fn().mockReturnValue('attachment; filename="parcels.csv"'),
        },
      } as any;

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const filters = {
        minPrice: 100000,
        maxPrice: 500000,
        minSize: 1000,
        maxSize: 5000,
      };

      await exportParcelsCSV(filters);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('minPrice=100000'),
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('maxPrice=500000'),
        expect.any(Object),
      );
    });

    it('should only include non-null filter parameters', async () => {
      const mockBlob = new Blob(['test data']);
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: {
          get: vi.fn().mockReturnValue(''),
        },
      } as any;

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const filters = {
        minPrice: 100000,
        maxPrice: null,
        minSize: undefined,
        maxSize: 5000,
      };

      await exportParcelsCSV(filters);

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('minPrice=100000');
      expect(callUrl).toContain('maxSize=5000');
      expect(callUrl).not.toContain('maxPrice');
      expect(callUrl).not.toContain('minSize');
    });

    it('should include authorization header when token is provided', async () => {
      const mockBlob = new Blob(['test data']);
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: {
          get: vi.fn().mockReturnValue(''),
        },
      } as any;

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const filters = {};
      const token = 'test-token-123';

      await exportParcelsCSV(filters, token);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer test-token-123',
          },
        }),
      );
    });

    it('should not include authorization header when token is not provided', async () => {
      const mockBlob = new Blob(['test data']);
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: {
          get: vi.fn().mockReturnValue(''),
        },
      } as any;

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const filters = {};

      await exportParcelsCSV(filters);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {},
        }),
      );
    });

    it('should throw error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        blob: vi.fn(),
        headers: {
          get: vi.fn(),
        },
      } as any;

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const filters = {};

      await expect(exportParcelsCSV(filters)).rejects.toThrow('Export failed: 401');
    });

    it('should trigger file download with correct filename', async () => {
      const mockBlob = new Blob(['test data']);
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: {
          get: vi.fn().mockReturnValue('attachment; filename="data.csv"'),
        },
      } as any;

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const filters = {};

      // Mock DOM elements
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        remove: vi.fn(),
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink as any);

      await exportParcelsCSV(filters);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
    });

    it('should handle filename from content-disposition header', async () => {
      const mockBlob = new Blob(['test data']);
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: {
          get: vi.fn().mockReturnValue('attachment; filename="custom-parcels.csv"'),
        },
      } as any;

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const filters = {};

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        remove: vi.fn(),
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink as any);

      await exportParcelsCSV(filters);

      expect(mockLink.download).toMatch(/custom-parcels-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.csv/);
    });
  });
});
