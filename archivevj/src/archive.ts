export type ArchiveItem = { identifier: string; title?: string; description?: string | string[]; year?: string | number; creator?: string | string[]; };

const SEARCH = 'https://archive.org/advancedsearch.php';
const META = 'https://archive.org/metadata';

export async function searchArchive(query: string): Promise<ArchiveItem[]> {
  const q = `${query.trim()} AND mediatype:movies`;
  const params = new URLSearchParams({ q, 'fl[]': 'identifier,title,description,year,creator', rows: '30', page: '1', output: 'json' });
  const res = await fetch(`${SEARCH}?${params.toString()}`);
  if (!res.ok) throw new Error(`Archive search failed (${res.status})`);
  const json = await res.json();
  return json?.response?.docs ?? [];
}

export async function resolveArchiveVideo(identifier: string): Promise<string> {
  const res = await fetch(`${META}/${encodeURIComponent(identifier)}`);
  if (!res.ok) throw new Error(`Metadata request failed (${res.status})`);
  const data = await res.json();
  const files: Array<{name?:string; format?:string; size?:string}> = data?.files ?? [];
  const mp4 = files
    .filter(f => f.name && /\.mp4$/i.test(f.name))
    .filter(f => !/thumb|preview|sample/i.test(f.name!))
    .sort((a,b) => Number(a.size || Number.MAX_SAFE_INTEGER) - Number(b.size || Number.MAX_SAFE_INTEGER))[0];
  if (!mp4?.name) throw new Error('No MP4 video was found for this Archive item.');
  return `https://archive.org/download/${encodeURIComponent(identifier)}/${mp4.name.split('/').map(encodeURIComponent).join('/')}`;
}
