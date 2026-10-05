import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

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

const CAMPO = 'w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm';

export function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-600">{etiqueta}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CAMPO} ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${CAMPO} ${props.className ?? ''}`} />;
}

export function Boton({
  variante = 'primario',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'secundario' | 'peligro' }) {
  const estilos = {
    primario: 'bg-sky-600 text-white hover:bg-sky-700',
    secundario: 'border border-slate-300 bg-white hover:bg-slate-100',
    peligro: 'border border-red-300 bg-white text-red-700 hover:bg-red-50',
  };
  return (
    <button
      type="button"
      {...props}
      className={`rounded px-3 py-1.5 text-sm disabled:opacity-50 ${estilos[variante]} ${props.className ?? ''}`}
    />
  );
}

export function Modal({ titulo, onCerrar, children }: { titulo: string; onCerrar: () => void; children: ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="fixed inset-0 z-10 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4"
      onClick={onCerrar}
    >
      <div className="mt-8 w-full max-w-lg rounded-lg bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button onClick={onCerrar} aria-label="Cerrar" className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Tabla({ columnas, children }: { columnas: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {columnas.map((c) => (
              <th key={c} className="px-3 py-2 font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Paginador({
  page,
  limit,
  total,
  onCambiar,
}: {
  page: number;
  limit: number;
  total: number;
  onCambiar: (page: number) => void;
}) {
  const paginas = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span>{total} resultado{total === 1 ? '' : 's'}</span>
      <div className="flex items-center gap-2">
        <Boton variante="secundario" disabled={page <= 1} onClick={() => onCambiar(page - 1)}>‹</Boton>
        <span>Página {page} de {paginas}</span>
        <Boton variante="secundario" disabled={page >= paginas} onClick={() => onCambiar(page + 1)}>›</Boton>
      </div>
    </div>
  );
}

export const mensajeError = (e: unknown, defecto: string): string => (e instanceof Error ? e.message : defecto);

/** Convierte un campo de texto en `undefined` si está vacío (los DTO opcionales no aceptan ''). */
export const textoOpcional = (v: string): string | undefined => (v.trim() === '' ? undefined : v.trim());

export const ETIQUETA_SERVICIO = { ENERGIA: 'Energía', AGUA: 'Agua' } as const;
