import type { ReactNode } from 'react';

export function ErrorBanner({ mensaje }: { mensaje: string }) {
  return (
    <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {mensaje}
    </p>
  );
}

export function Badge({ tono, children }: { tono: 'amber' | 'green' | 'red' | 'sky' | 'slate'; children: ReactNode }) {
  const tonos = {
    amber: 'bg-amber-100 text-amber-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    sky: 'bg-sky-100 text-sky-800',
    slate: 'bg-slate-100 text-slate-700',
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tonos[tono]}`}>{children}</span>;
}

export function Foto({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return <span className="text-xs text-slate-400">Sin foto</span>;
  return (
    <a href={src} target="_blank" rel="noreferrer">
      <img src={src} alt={alt} loading="lazy" className="h-14 w-14 rounded border border-slate-200 object-cover" />
    </a>
  );
}

export const fechaCorta = (iso: string): string =>
  new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
