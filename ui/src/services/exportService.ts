import { API_BASE_URL } from '../env';
import type { Filters } from '../types/filters';

function appendIfPresent(params: URLSearchParams, key: string, value: number | null | undefined) {
  if (value != null) params.set(key, String(value));
}

export async function exportParcelsCSV(filters: Filters, token?: string) {
  const params = new URLSearchParams();
  appendIfPresent(params, 'minPrice', filters.minPrice as number | null | undefined);
  appendIfPresent(params, 'maxPrice', filters.maxPrice as number | null | undefined);
  appendIfPresent(params, 'minSize', filters.minSize as number | null | undefined);
  appendIfPresent(params, 'maxSize', filters.maxSize as number | null | undefined);

  const url = `${API_BASE_URL}/parcels/export${params.toString() ? `?${params.toString()}` : ''}`;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);

  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') || '';
  function pad(n: number) {
    return String(n).padStart(2, '0');
  }

  function timestampString(d = new Date()) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(
      d.getHours(),
    )}-${pad(d.getMinutes())}`;
  }

  const ts = timestampString();

  let filename = '';
  const match = disposition.match(/filename\*=UTF-8''(.+)|filename="([^"]+)"|filename=(.+)/);
  if (match) {
    filename = decodeURIComponent(match[1] || match[2] || match[3] || '');
    const extIndex = filename.lastIndexOf('.');
    if (extIndex !== -1) {
      filename = `${filename.slice(0, extIndex)}-${ts}${filename.slice(extIndex)}`;
    } else {
      filename = `${filename}-${ts}.csv`;
    }
  } else {
    filename = `parcels-${ts}.csv`;
  }

  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export default exportParcelsCSV;
