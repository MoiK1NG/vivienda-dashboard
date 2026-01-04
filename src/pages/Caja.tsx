import React, { useMemo, useState } from "react";
import { useCajaConsorcio } from "@/hooks/useCajaConsorcio";

// Si tienes componentes UI (shadcn) en tu repo, úsalos.
// Si alguno no existe, puedes reemplazar por <div>, <button>, <input> sin problema.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CajaRow = {
  registro_id?: string;
  fecha?: string; // "YYYY-MM-DD"
  pagado_a?: string;
  concepto?: string;
  valor?: string; // texto (opcional)
  valor_num?: number | null;
  negocio?: string;
  observaciones?: string;
  updated_at?: string;
};

function toDateMs(yyyyMmDd?: string): number | null {
  if (!yyyyMmDd) return null;
  // Forzamos medianoche UTC para comparación consistente
  const iso = `${yyyyMmDd}T00:00:00.000Z`;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
}

function formatCOP(n: number): string {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    // fallback
    const sign = n < 0 ? "-" : "";
    const abs = Math.abs(n);
    return `${sign}$${abs.toLocaleString("es-CO")}`;
  }
}

function safeLower(v: unknown): string {
  return (v ?? "").toString().toLowerCase();
}

function downloadCSV(filename: string, rows: CajaRow[]) {
  const headers = [
    "registro_id",
    "fecha",
    "pagado_a",
    "concepto",
    "negocio",
    "valor_num",
    "valor",
    "observaciones",
    "updated_at",
  ];

  const escape = (value: unknown) => {
    const s = (value ?? "").toString();
    // CSV escaping: wrap in quotes if needed, escape internal quotes
    const needsQuotes = /[",\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const val =
            h === "valor_num"
              ? (r.valor_num ?? "").toString()
              : (r as any)[h];
          return escape(val);
        })
        .join(",")
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Caja() {
  // Ajusta esto si tu hook devuelve otro nombre:
  // Ej: const { data, isLoading, error } = useCajaConsorcio();
  const { data, isLoading, error } = useCajaConsorcio() as {
    data?: CajaRow[];
    isLoading?: boolean;
    error?: any;
  };

  const rows = (data ?? []) as CajaRow[];

  // -------------------------
  // UI State
  // -------------------------
  const [search, setSearch] = useState("");
  const [negocio, setNegocio] = useState<string>("ALL");
  const [onlyNegatives, setOnlyNegatives] = useState(false);

  // Rango de fechas (input type="date")
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Orden
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Reset page cuando cambian filtros
  React.useEffect(() => {
    setPage(1);
  }, [search, negocio, onlyNegatives, fromDate, toDate, sortDir, pageSize]);

  // -------------------------
  // Derived: options
  // -------------------------
  const negocios = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      const n = (r.negocio ?? "").trim();
      if (n) set.add(n);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // -------------------------
  // Filtering + sorting
  // -------------------------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromMs = fromDate ? toDateMs(fromDate) : null;
    const toMs = toDate ? toDateMs(toDate) : null;

    const out = rows.filter((r) => {
      // negocio
      if (negocio !== "ALL" && (r.negocio ?? "") !== negocio) return false;

      // negativos
      if (onlyNegatives && !((r.valor_num ?? 0) < 0)) return false;

      // rango de fechas
      if (fromMs !== null || toMs !== null) {
        const ms = toDateMs(r.fecha);
        if (ms === null) return false;
        if (fromMs !== null && ms < fromMs) return false;
        if (toMs !== null && ms > toMs) return false;
      }

      // búsqueda libre
      if (!q) return true;
      const hay = [
        r.registro_id,
        r.fecha,
        r.pagado_a,
        r.concepto,
        r.negocio,
        r.observaciones,
        r.valor,
      ]
        .map(safeLower)
        .join(" ");
      return hay.includes(q);
    });

    // ordenar por fecha (y fallback por registro_id)
    out.sort((a, b) => {
      const am = toDateMs(a.fecha) ?? 0;
      const bm = toDateMs(b.fecha) ?? 0;
      const diff = am - bm;
      if (diff !== 0) return sortDir === "asc" ? diff : -diff;
      const ar = (a.registro_id ?? "").localeCompare(b.registro_id ?? "");
      return sortDir === "asc" ? ar : -ar;
    });

    return out;
  }, [rows, search, negocio, onlyNegatives, fromDate, toDate, sortDir]);

  // -------------------------
  // KPIs (sobre filtrado)
  // -------------------------
  const stats = useMemo(() => {
    let ingresos = 0;
    let egresos = 0;
    let balance = 0;

    for (const r of filtered) {
      const v = Number(r.valor_num ?? 0);
      if (!Number.isFinite(v)) continue;
      balance += v;
      if (v >= 0) ingresos += v;
      else egresos += v; // negativo
    }

    return {
      count: filtered.length,
      ingresos,
      egresos, // negativo
      balance,
    };
  }, [filtered]);

  // -------------------------
  // Pagination
  // -------------------------
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  // -------------------------
  // UI
  // -------------------------
  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Caja</CardTitle>
          </CardHeader>
          <CardContent>Cargando datos…</CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Caja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-red-600">
              Error cargando la información desde Supabase.
            </div>
            <pre className="text-xs whitespace-pre-wrap break-words bg-muted p-3 rounded">
              {String(error?.message ?? error)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header + KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Balance</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCOP(stats.balance)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCOP(stats.ingresos)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Egresos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCOP(stats.egresos)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Movimientos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats.count.toLocaleString("es-CO")}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Caja Consorcio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground">Buscar</label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="concepto, pagado a, negocio, observaciones…"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Negocio</label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                value={negocio}
                onChange={(e) => setNegocio(e.target.value)}
              >
                <option value="ALL">Todos</option>
                {negocios.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Desde</label>
              <input
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Hasta</label>
              <input
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                variant={sortDir === "desc" ? "default" : "outline"}
                onClick={() => setSortDir("desc")}
              >
                Fecha ↓
              </Button>
              <Button
                variant={sortDir === "asc" ? "default" : "outline"}
                onClick={() => setSortDir("asc")}
              >
                Fecha ↑
              </Button>

              <Button
                variant={onlyNegatives ? "default" : "outline"}
                onClick={() => setOnlyNegatives((v) => !v)}
              >
                Solo egresos
              </Button>

              <Badge variant="secondary">
                Mostrando {paged.length} de {filtered.length}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={25}>25 / pág</option>
                <option value={50}>50 / pág</option>
                <option value={100}>100 / pág</option>
                <option value={200}>200 / pág</option>
              </select>

              <Button
                variant="outline"
                onClick={() =>
                  downloadCSV(
                    `caja_consorcio_${new Date()
                      .toISOString()
                      .slice(0, 10)}.csv`,
                    filtered
                  )
                }
              >
                Exportar CSV
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setNegocio("ALL");
                  setOnlyNegatives(false);
                  setFromDate("");
                  setToDate("");
                  setSortDir("desc");
                  setPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-4">
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Pagado a</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Negocio</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Obs.</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paged.map((r, idx) => {
                  const v = Number(r.valor_num ?? 0);
                  const isNeg = Number.isFinite(v) && v < 0;

                  return (
                    <TableRow key={r.registro_id ?? `${idx}`}>
                      <TableCell className="whitespace-nowrap">
                        {r.fecha ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {r.pagado_a ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate">
                        {r.concepto ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">
                        {r.negocio ?? "—"}
                      </TableCell>
                      <TableCell
                        className={[
                          "text-right font-medium whitespace-nowrap",
                          isNeg ? "text-red-600" : "text-foreground",
                        ].join(" ")}
                        title={r.valor ?? undefined}
                      >
                        {Number.isFinite(v) ? formatCOP(v) : (r.valor ?? "—")}
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate">
                        {r.observaciones ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      No hay movimientos con esos filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4 gap-2">
            <div className="text-sm text-muted-foreground">
              Página {safePage} de {totalPages}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setPage(1)}
              >
                « Primero
              </Button>
              <Button
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹ Anterior
              </Button>
              <Button
                variant="outline"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente ›
              </Button>
              <Button
                variant="outline"
                disabled={safePage >= totalPages}
                onClick={() => setPage(totalPages)}
              >
                Último »
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
