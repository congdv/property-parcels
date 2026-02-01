import { Hono } from 'hono';
import { HonoRequest } from 'hono';
import app from '../../routes/parcels';
import * as parcelService from '../../services/parcelService';

jest.mock('../../services/parcelService');

describe('Parcel Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return list of parcels', async () => {
      const mockParcels = [
        {
          sl_uuid: 'uuid-1',
          address: '123 Main St',
          county: 'dallas',
          sqft: 5000,
          total_value: 500000,
        },
      ];

      (parcelService.getParcelsList as jest.Mock).mockResolvedValue(
        mockParcels
      );

      const req = new Request('http://localhost/');
      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockParcels);
      expect(parcelService.getParcelsList).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on database error', async () => {
      (parcelService.getParcelsList as jest.Mock).mockRejectedValue(
        new Error('DB Error')
      );

      const req = new Request('http://localhost/');
      const res = await app.fetch(req);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({ error: 'Database error' });
    });
  });

  describe('GET /export', () => {
    it('should return 403 for guests', async () => {
      const req = new Request('http://localhost/export');
      const res = await app.fetch(req);

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data).toEqual({ error: 'Forbidden' });
    });

    it('should return CSV for authenticated users', async () => {
      const mockParcels = [
        {
          sl_uuid: 'uuid-1',
          address: '123 Main St',
          county: 'dallas',
          sqft: 5000,
          total_value: 500000,
          formatted_value: '500,000',
        },
        {
          sl_uuid: 'uuid-2',
          address: '456 Oak Ave',
          county: 'dallas',
          sqft: 3000,
          total_value: 300000,
          formatted_value: '300,000',
        },
      ];

      (parcelService.getParcelsForExport as jest.Mock).mockResolvedValue(
        mockParcels
      );

      const req = new Request('http://localhost/export', {
        headers: { Authorization: 'Bearer token' },
      });
      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe(
        'text/csv; charset=utf-8'
      );
      const csv = await res.text();
      expect(csv).toContain('sl_uuid,address,county,sqft,total_value');
      expect(csv).toContain('uuid-1,123 Main St,dallas');
      expect(csv).toContain('uuid-2,456 Oak Ave,dallas');
    });

    it('should handle CSV with special characters', async () => {
      const mockParcels = [
        {
          sl_uuid: 'uuid-1',
          address: '123 "Quoted" St, With Comma',
          county: 'dallas',
          sqft: 5000,
          total_value: 500000,
          formatted_value: '500,000',
        },
      ];

      (parcelService.getParcelsForExport as jest.Mock).mockResolvedValue(
        mockParcels
      );

      const req = new Request('http://localhost/export', {
        headers: { Authorization: 'Bearer token' },
      });
      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const csv = await res.text();
      expect(csv).toContain('"123 ""Quoted"" St, With Comma"');
    });

    it('should apply filters from query params', async () => {
      (parcelService.getParcelsForExport as jest.Mock).mockResolvedValue([]);

      const req = new Request(
        'http://localhost/export?county=dallas&minPrice=250000&maxPrice=750000',
        {
          headers: { Authorization: 'Bearer token' },
        }
      );
      const res = await app.fetch(req);

      expect(parcelService.getParcelsForExport).toHaveBeenCalledWith(
        expect.objectContaining({
          county: 'dallas',
          minPrice: 250000,
          maxPrice: 750000,
        })
      );
    });

    it('should return 500 on export error', async () => {
      (parcelService.getParcelsForExport as jest.Mock).mockRejectedValue(
        new Error('Export failed')
      );

      const req = new Request('http://localhost/export', {
        headers: { Authorization: 'Bearer token' },
      });
      const res = await app.fetch(req);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({ error: 'Export failed' });
    });
  });

  describe('GET /:z/:x/:y', () => {
    it('should return 204 when no tile data', async () => {
      (parcelService.getParcelTile as jest.Mock).mockResolvedValue({
        mvt: null,
        mvtSize: 0,
      });

      const req = new Request('http://localhost/10/500/500', {
        headers: { Authorization: 'Bearer token' },
      });
      const res = await app.fetch(req);

      expect(res.status).toBe(204);
    });

    it('should return tile with correct headers for authenticated user', async () => {
      const tileBuffer = Buffer.from('tile data');

      (parcelService.getParcelTile as jest.Mock).mockResolvedValue({
        mvt: tileBuffer,
        mvtSize: tileBuffer.length,
      });

      const req = new Request('http://localhost/10/500/500', {
        headers: { Authorization: 'Bearer token' },
      });
      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe(
        'application/vnd.mapbox-vector-tile'
      );
      expect(res.headers.get('Cache-Control')).toBe('public, max-age=3600');
    });

    it('should restrict guest users to dallas county', async () => {
      (parcelService.getParcelTile as jest.Mock).mockResolvedValue({
        mvt: null,
        mvtSize: 0,
      });

      const req = new Request('http://localhost/10/500/500');
      const res = await app.fetch(req);

      // Should be called with dallas county for guest
      expect(parcelService.getParcelTile).toHaveBeenCalledWith(
        10,
        500,
        500,
        expect.objectContaining({ county: 'dallas' })
      );
    });

    it('should accept query filters from authenticated users', async () => {
      (parcelService.getParcelTile as jest.Mock).mockResolvedValue({
        mvt: null,
        mvtSize: 0,
      });

      const req = new Request(
        'http://localhost/10/500/500?minPrice=250000&maxPrice=750000&minSize=2000&maxSize=8000',
        {
          headers: { Authorization: 'Bearer token' },
        }
      );
      const res = await app.fetch(req);

      expect(parcelService.getParcelTile).toHaveBeenCalledWith(
        10,
        500,
        500,
        expect.objectContaining({
          minPrice: 250000,
          maxPrice: 750000,
          minSize: 2000,
          maxSize: 8000,
        })
      );
    });

    it('should validate tile coordinates', async () => {
      const req = new Request('http://localhost/invalid/x/y', {
        headers: { Authorization: 'Bearer token' },
      });
      const res = await app.fetch(req);

      expect(res.status).toBe(400);
    });

    it('should allow zoom 0-30', async () => {
      (parcelService.getParcelTile as jest.Mock).mockResolvedValue({
        mvt: null,
        mvtSize: 0,
      });

      // Test zoom 0
      let req = new Request('http://localhost/0/0/0', {
        headers: { Authorization: 'Bearer token' },
      });
      let res = await app.fetch(req);
      expect(res.status).not.toBe(400);

      // Test zoom 30
      req = new Request('http://localhost/30/500/500', {
        headers: { Authorization: 'Bearer token' },
      });
      res = await app.fetch(req);
      expect(res.status).not.toBe(400);
    });

    it('should reject zoom > 30', async () => {
      const req = new Request('http://localhost/31/500/500', {
        headers: { Authorization: 'Bearer token' },
      });
      const res = await app.fetch(req);

      expect(res.status).toBe(400);
    });

    it('should return 500 on service error', async () => {
      (parcelService.getParcelTile as jest.Mock).mockRejectedValue(
        new Error('Tile generation failed')
      );

      const req = new Request('http://localhost/10/500/500', {
        headers: { Authorization: 'Bearer token' },
      });
      const res = await app.fetch(req);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({ error: 'Failed to generate tile' });
    });

    it('should allow country override for authenticated users', async () => {
      (parcelService.getParcelTile as jest.Mock).mockResolvedValue({
        mvt: null,
        mvtSize: 0,
      });

      const req = new Request(
        'http://localhost/10/500/500?county=travis',
        {
          headers: { Authorization: 'Bearer token' },
        }
      );
      const res = await app.fetch(req);

      expect(parcelService.getParcelTile).toHaveBeenCalledWith(
        10,
        500,
        500,
        expect.objectContaining({ county: 'travis' })
      );
    });
  });
});
