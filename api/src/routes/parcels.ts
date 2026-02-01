import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import * as parcelService from "../services/parcelService";

const app = new Hono<{ Variables: Record<string, any> }>();

// Schema for Tile Coordinates
const tileSchema = z.object({
  z: z.coerce.number().int().min(0).max(30),
  x: z.coerce.number().int().min(0),
  y: z.coerce.number().int().min(0),
});

// Simple authentication middleware (allows guests, marks guest in context)
async function isAuthenticated(c: any, next: any) {
  // Check for Authorization header
  const authHeader = c.req.header("Authorization");
  const user = authHeader ? true : false; // Simplified: if header present, authenticated
  c.set("user", user);
  if (!user) {
    c.set("isGuest", true);
  } else {
    c.set("isGuest", false);
  }
  return next();
}

app.get("/", async (c) => {
  try {
    const data = await parcelService.getParcelsList();
    return c.json(data);
  } catch (err) {
    console.error("List Error:", err);
    return c.json({ error: "Database error" }, 500);
  }
});

app.get("/export", isAuthenticated, async (c) => {
  try {
    const qp = c.req.query();
    const isGuest = c.get("isGuest") as boolean;
    if (isGuest) {
      return c.json({ error: "Forbidden" }, 403);
    }
    const parseNum = (v: string | undefined) => {
      if (!v) return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    };

    const filter: any = {};
    if (qp.county) filter.county = String(qp.county);
    const minPrice = parseNum(qp.minPrice as string | undefined);
    const maxPrice = parseNum(qp.maxPrice as string | undefined);
    const minSize = parseNum(qp.minSize as string | undefined);
    const maxSize = parseNum(qp.maxSize as string | undefined);

    if (minPrice != null) filter.minPrice = minPrice;
    if (maxPrice != null) filter.maxPrice = maxPrice;
    if (minSize != null) filter.minSize = minSize;
    if (maxSize != null) filter.maxSize = maxSize;

    const rows = await parcelService.getParcelsForExport(filter);

    // Helper to escape CSV
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      if (
        s.includes('"') ||
        s.includes(",") ||
        s.includes("\n") ||
        s.includes("\r")
      ) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const headers = [
      "sl_uuid",
      "address",
      "county",
      "sqft",
      "total_value",
      "formatted_value",
    ];
    const csvRows = [headers.join(",")];
    for (const r of rows) {
      const row = [
        r.sl_uuid,
        r.address,
        r.county,
        r.sqft,
        r.total_value,
        r.formatted_value,
      ]
        .map(escapeCsv)
        .join(",");
      csvRows.push(row);
    }
    const csv = csvRows.join("\r\n");

    return c.body(csv, 200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="parcels.csv"',
    });
  } catch (err) {
    console.error("Export Error:", err);
    return c.json({ error: "Export failed" }, 500);
  }
});

// (authentication middleware defined above)

// Using zValidator provides automatic 400 errors if params are invalid
app.get(
  "/:z/:x/:y",
  isAuthenticated,
  zValidator("param", tileSchema),
  async (c) => {
    const { z, x, y } = c.req.valid("param");
    const isGuest = c.get("isGuest") as boolean;

    try {
      // Parse optional filter query params
      const qp = c.req.query();
      const parseNum = (v: string | undefined) => {
        if (!v) return null;
        const n = Number(v);
        return Number.isNaN(n) ? null : n;
      };

      const filter: any = isGuest ? { county: "dallas" } : {};
      console.log("-----filter ", filter, isGuest)
      // Allow overriding county via query param if present
      if (qp.county) filter.county = String(qp.county);
      const minPrice = parseNum(qp.minPrice as string | undefined);
      const maxPrice = parseNum(qp.maxPrice as string | undefined);
      const minSize = parseNum(qp.minSize as string | undefined);
      const maxSize = parseNum(qp.maxSize as string | undefined);

      if (minPrice != null) filter.minPrice = minPrice;
      if (maxPrice != null) filter.maxPrice = maxPrice;
      if (minSize != null) filter.minSize = minSize;
      if (maxSize != null) filter.maxSize = maxSize;

      const { mvt, mvtSize } = await parcelService.getParcelTile(
        z,
        x,
        y,
        filter,
      );

      console.log(
        `Tile Request: ${z}/${x}/${y} | Size: ${mvtSize} | Guest: ${isGuest}`,
      );

      if (!mvt || mvtSize === 0) {
        return c.body(null, 204);
      }

      return c.body(mvt, 200, {
        "Content-Type": "application/vnd.mapbox-vector-tile",
        "Cache-Control": "public, max-age=3600",
      });
    } catch (err) {
      console.error(`MVT Generation Error (${z}/${x}/${y}):`, err);
      return c.json({ error: "Failed to generate tile" }, 500);
    }
  },
);

export default app;
