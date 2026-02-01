import * as parcelService from '../../services/parcelService';
import db from '../../db';

jest.mock('../../db');

describe('Parcel Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getParcelsList', () => {
    it('should return a list of parcels', async () => {
      const mockRows = [
        {
          sl_uuid: 'uuid-1',
          address: '123 Main St',
          county: 'dallas',
          sqft: 5000,
          total_value: 500000,
          geometry: {},
        },
        {
          sl_uuid: 'uuid-2',
          address: '456 Oak Ave',
          county: 'dallas',
          sqft: 3000,
          total_value: 300000,
          geometry: {},
        },
      ];

      (db.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      const result = await parcelService.getParcelsList();

      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no parcels found', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await parcelService.getParcelsList();

      expect(result).toEqual([]);
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should throw error when database query fails', async () => {
      const dbError = new Error('Database connection failed');
      (db.query as jest.Mock).mockRejectedValue(dbError);

      await expect(parcelService.getParcelsList()).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('getParcelsForExport', () => {
    it('should fetch parcels without filters', async () => {
      const mockRows = [
        {
          sl_uuid: 'uuid-1',
          address: '123 Main St',
          county: 'dallas',
          sqft: 5000,
          total_value: 500000,
          formatted_value: '500,000',
        },
      ];

      (db.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      const result = await parcelService.getParcelsForExport();

      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledWith(expect.any(String), [
        null,
        null,
        null,
        null,
        null,
        null,
      ]);
    });

    it('should apply county filter', async () => {
      const mockRows = [
        {
          sl_uuid: 'uuid-1',
          county: 'travis',
          sqft: 5000,
          total_value: 500000,
          formatted_value: '500,000',
        },
      ];

      (db.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      const result = await parcelService.getParcelsForExport({
        county: 'travis',
      });

      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledWith(expect.any(String), [
        'travis',
        null,
        null,
        null,
        null,
        null,
      ]);
    });

    it('should apply price range filters', async () => {
      const mockRows: any[] = [];

      (db.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      await parcelService.getParcelsForExport({
        minPrice: 250000,
        maxPrice: 750000,
      });

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [
        null,
        250000,
        750000,
        null,
        null,
        null,
      ]);
    });

    it('should apply size range filters', async () => {
      const mockRows: any[] = [];

      (db.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      await parcelService.getParcelsForExport({
        minSize: 2000,
        maxSize: 8000,
      });

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [
        null,
        null,
        null,
        2000,
        8000,
        null,
      ]);
    });

    it('should apply all filters together', async () => {
      const mockRows: any[] = [];

      (db.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      await parcelService.getParcelsForExport({
        county: 'dallas',
        minPrice: 200000,
        maxPrice: 800000,
        minSize: 1500,
        maxSize: 7500,
      });

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [
        'dallas',
        200000,
        800000,
        1500,
        7500,
        null,
      ]);
    });

    it('should apply search query filter', async () => {
      const mockRows: any[] = [];

      (db.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      await parcelService.getParcelsForExport({
        searchQuery: 'main street',
      });

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [
        null,
        null,
        null,
        null,
        null,
        'main street',
      ]);
    });

    it('should apply search query with other filters', async () => {
      const mockRows: any[] = [];

      (db.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      await parcelService.getParcelsForExport({
        county: 'dallas',
        minPrice: 250000,
        searchQuery: 'oak avenue',
      });

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [
        'dallas',
        250000,
        null,
        null,
        null,
        'oak avenue',
      ]);
    });
  });

  describe('getParcelTile', () => {
    it('should use clustering for zoom level <= 13', async () => {
      const mockTile = { mvt: Buffer.from('tile data') };

      (db.query as jest.Mock).mockResolvedValue({ rows: [mockTile] });

      const result = await parcelService.getParcelTile(13, 1000, 2000);

      expect(result.mvt).toBeDefined();
      // Verify CLUSTER_TILE_SQL is used by checking for clustering-related SQL keywords
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('ST_ClusterDBSCAN'), [
        13,
        1000,
        2000,
        null,
        null,
        null,
        null,
        null,
        null,
      ]);
    });

    it('should use individual parcels for zoom level > 13', async () => {
      const mockTile = { mvt: Buffer.from('tile data') };

      (db.query as jest.Mock).mockResolvedValue({ rows: [mockTile] });

      const result = await parcelService.getParcelTile(14, 1000, 2000);

      expect(result.mvt).toBeDefined();
      expect(db.query).toHaveBeenCalledWith(
        expect.not.stringContaining('CLUSTER'),
        [14, 1000, 2000, null, null, null, null, null, null]
      );
    });

    it('should calculate mvt size correctly', async () => {
      const tileBuffer = Buffer.from('tile data here');

      (db.query as jest.Mock).mockResolvedValue({
        rows: [{ mvt: tileBuffer }],
      });

      const result = await parcelService.getParcelTile(10, 500, 500);

      expect(result.mvtSize).toBeGreaterThan(0);
      expect(result.mvtSize).toBe(tileBuffer.length);
    });

    it('should return 0 size when mvt is null', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ mvt: null }] });

      const result = await parcelService.getParcelTile(10, 500, 500);

      expect(result.mvtSize).toBe(0);
    });

    it('should convert maxPrice 10000000 to null', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ mvt: null }] });

      await parcelService.getParcelTile(13, 1000, 2000, { maxPrice: 10000000 });

      const callArgs = (db.query as jest.Mock).mock.calls[0][1];
      expect(callArgs[5]).toBeNull();
    });

    it('should convert maxSize 10000 to null', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ mvt: null }] });

      await parcelService.getParcelTile(13, 1000, 2000, { maxSize: 10000 });

      const callArgs = (db.query as jest.Mock).mock.calls[0][1];
      expect(callArgs[7]).toBeNull();
    });

    it('should apply county filter', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ mvt: null }] });

      await parcelService.getParcelTile(13, 1000, 2000, { county: 'travis' });

      const callArgs = (db.query as jest.Mock).mock.calls[0][1];
      expect(callArgs[3]).toBe('travis');
    });

    it('should handle all filter parameters', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ mvt: null }] });

      await parcelService.getParcelTile(15, 1000, 2000, {
        county: 'dallas',
        minPrice: 300000,
        maxPrice: 900000,
        minSize: 3000,
        maxSize: 8000,
      });

      const callArgs = (db.query as jest.Mock).mock.calls[0][1];
      expect(callArgs).toEqual([
        15,
        1000,
        2000,
        'dallas',
        300000,
        900000,
        3000,
        8000,
        null,
      ]);
    });

    it('should apply search query filter for tiles', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ mvt: null }] });

      await parcelService.getParcelTile(13, 1000, 2000, { searchQuery: 'main' });

      const callArgs = (db.query as jest.Mock).mock.calls[0][1];
      expect(callArgs[8]).toBe('main');
    });

    it('should apply search query with all filters for tiles', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ mvt: null }] });

      await parcelService.getParcelTile(12, 500, 1500, {
        county: 'travis',
        minPrice: 150000,
        maxPrice: 750000,
        minSize: 2500,
        maxSize: 9000,
        searchQuery: 'oak',
      });

      const callArgs = (db.query as jest.Mock).mock.calls[0][1];
      expect(callArgs).toEqual([
        12,
        500,
        1500,
        'travis',
        150000,
        750000,
        2500,
        9000,
        'oak',
      ]);
    });
  });
});
