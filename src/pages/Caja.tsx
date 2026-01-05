"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCajaConsorcio } from "@/hooks/useCajaConsorcio";

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
  valor?: string;
  valor_num?: number | null;
  negocio?: string;
  observaciones?: string;
  updated_at?: string;
};

type SortKey =
  | "registro_id"
  | "fecha"
  | "pagado_a"
  | "concepto"
  | "negocio"
  | "valor_num";

function toDateMs(yyyyMmDd?: string): number {
  if (!yyyyMmDd) return 0;
  const ms = Date.parse(`${yyyyMmDd}T00:00:00.000Z`);
  return Number.isFinite(ms) ? ms : 0;
}

function formatCOP(n: number): string {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    const sign = n < 0 ? "-" : "";
    const abs = Math.abs(n);
    return `${sign}$${abs.toLocaleString("es-CO")}`;
  }
}

function initials(name?: string) {
  const s = (name ?? "").trim();
  if (!s) return "—";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => (p[0] ?? "").toUpperCase()).join("");
}

function exportCsv(rows: CajaRow[]) {
  const headers = [
    "registro_id",
    "fecha",
    "pagado_a",
    "concepto",
    "negocio",
    "valor_num",
    "observaciones",
    "updated_at",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const val = (r as any)[h] ?? "";
          const s = String(val).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(",")
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `caja_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Caja() {
  // ✅ Normalización del hook para que NO “desaparezcan” los datos
  const caja: any = useCajaConsorcio();

  const rows: CajaRow[] = (caja?.rows ?? caja?.data ?? caja?.caja ?? []) as CajaRow[];
  const loading: boolean = Boolean(
    caja?.loading ?? caja?.isLoading ?? caja?.isFetching ?? caja?.fetching
  );
  const error: any = caja?.error ?? caja?.err ?? null;
  const refetch: (() => void) | undefined = caja?.refetch ?? caja?.reload ?? caja?.refresh;

  // -------------------------
  // UI state
  // -------------------------
  const [search, setSearch] = useState("");
  const [negocio, setNegocio] = useState("");
  const [onlyNegatives, setOnlyNegatives] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const onSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, negocio, onlyNegatives, fromDate, toDate, sortKey, sortDir, pageSize]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const neg = negocio.trim().toLowerCase();
    const fromMs = fromDate ? toDateMs(fromDate) : null;
    const toMs = toDate ? toDateMs(toDate) : null;

    const out = (rows ?? []).filter((r) => {
      // negocio (si escriben algo)
      if (neg && (r.negocio ?? "").toLowerCase() !== neg) return false;

      // negativos
      const v = Number(r.valor_num ?? 0);
      if (onlyNegatives && !(Number.isFinite(v) && v < 0)) return false;

      // fecha
      if (fromMs !== null || toMs !== null) {
        const f = toDateMs(r.fecha);
        if (!f) return false;
        if (fromMs !== null && f < fromMs) return false;
        if (toMs !== null && f > toMs) return false;
      }

      // búsqueda
      if (!q) return true;
      const hay = `${r.registro_id ?? ""} ${r.fecha ?? ""} ${r.pagado_a ?? ""} ${
        r.concepto ?? ""
      } ${r.negocio ?? ""} ${r.valor ?? ""} ${r.observaciones ?? ""}`.toLowerCase();
      return hay.includes(q);
    });

    // sort
    const dir = sortDir === "asc" ? 1 : -1;

    out.sort((a, b) => {
      const cmpStr = (x?: string, y?: string) =>
        (x ?? "").localeCompare(y ?? "", "es", { sensitivity: "base" }) * dir;

      const cmpNum = (x?: number | null, y?: number | null) =>
        (Number(x ?? 0) - Number(y ?? 0)) * dir;

      const cmpDate = (x?: string, y?: string) =>
        (toDateMs(x) - toDateMs(y)) * dir;

      switch (sortKey) {
        case "registro_id":
          return cmpStr(a.registro_id, b.registro_id);
        case "fecha":
          return cmpDate(a.fecha, b.fecha) || cmpStr(a.registro_id, b.registro_id);
        case "pagado_a":
          return cmpStr(a.pagado_a, b.pagado_a);
        case "concepto":
          return cmpStr(a.concepto, b.concepto);
        case "negocio":
          return cmpStr(a.negocio, b.negocio);
        case "valor_num":
          return cmpNum(a.valor_num, b.valor_num) || cmpStr(a.registro_id, b.registro_id);
        default:
          return 0;
      }
    });

    return out;
  }, [rows, search, negocio, onlyNegatives, fromDate, toDate, sortKey, sortDir]);

  const stats = useMemo(() => {
    let ingresos = 0;
    let egresos = 0;
    let balance = 0;

    for (const r of filtered) {
      const v = Number(r.valor_num ?? 0);
      if (!Number.isFinite(v)) continue;
      balance += v;
      if (v >= 0) ingresos += v;
      else egresos += v;
    }

    return { count: filtered.length, ingresos, egresos, balance };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const SortHead = ({
    label,
    k,
    className,
  }: {
    label: string;
    k: SortKey;
    className?: string;
  }) => {
    const active = sortKey === k;
    const arrow = active ? (sortDir === "asc" ? "↑" : "↓") : "";
    return (
      <TableHead className={className}>
        <button
          type="button"
          className="flex items-center gap-2 select-none hover:underline"
          onClick={() => onSort(k)}
          title="Ordenar"
        >
          <span>{label}</span>
          <span className="text-xs opacity-70">{arrow}</span>
        </button>
      </TableHead>
    );
  };

  // -------------------------
  // UI
  // -------------------------
  
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Caja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-red-600">Error cargando la información.</div>
            <pre className="text-xs whitespace-pre-wrap break-words bg-muted p-3 rounded">
              {String(error?.message ?? error)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Caja</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => exportCsv(filtered)} disabled={loading}>
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => (refetch ? refetch() : undefined)}
              disabled={loading || !refetch}
              title={!refetch ? "Tu hook no expone refetch()" : "Actualizar"}
            >
              Actualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card className="shadow-none">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Movimientos</div>
                <div className="text-2xl font-bold">{stats.count}</div>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Ingresos</div>
                <div className="text-2xl font-bold">{formatCOP(stats.ingresos)}</div>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Egresos</div>
                <div className="text-2xl font-bold">{formatCOP(stats.egresos)}</div>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Balance</div>
                <div className="text-2xl font-bold">{formatCOP(stats.balance)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Buscar</label>
              <Input
                placeholder="Buscar por registro, pagado a, concepto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Negocio</label>
              <Input
                placeholder="Ej: Tienda, Administración..."
                value={negocio}
                onChange={(e) => setNegocio(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Desde</label>
              <input
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
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
                variant={onlyNegatives ? "default" : "outline"}
                onClick={() => setOnlyNegatives((v) => !v)}
              >
                Solo egresos
              </Button>

              <Badge variant="outline">
                Orden: <span className="ml-1 font-medium">{sortKey}</span>{" "}
                <span className="ml-1 opacity-70">{sortDir === "asc" ? "↑" : "↓"}</span>
              </Badge>

              <Badge variant="secondary">
                Página {safePage} / {totalPages}
              </Badge>

              <Badge variant="secondary">
                Filtrados: {filtered.length} / {(rows ?? []).length}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Por página</label>
              <select
                className="h-10 rounded-md border bg-background px-2 text-sm"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {[25, 50, 100, 200].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHead label="Registro" k="registro_id" />
                  <SortHead label="Fecha" k="fecha" />
                  <SortHead label="Pagado a" k="pagado_a" />
                  <SortHead label="Concepto" k="concepto" />
                  <SortHead label="Negocio" k="negocio" />
                  <SortHead label="Valor" k="valor_num" className="text-right" />
                  <TableHead>Obs.</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paged.map((r, idx) => {
                  const v = Number(r.valor_num ?? 0);
                  const isNeg = Number.isFinite(v) && v < 0;

                  return (
                    <TableRow key={r.registro_id ?? String(idx)}>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        {r.registro_id ?? "—"}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">{r.fecha ?? "—"}</TableCell>

                      <TableCell title={r.pagado_a ?? ""}>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0">
                            {initials(r.pagado_a)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate max-w-[220px]">{r.pagado_a ?? "—"}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="max-w-[320px] truncate">{r.concepto ?? "—"}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{r.negocio ?? "—"}</TableCell>

                      <TableCell
                        className={[
                          "text-right font-medium whitespace-nowrap",
                          isNeg ? "text-red-600" : "text-foreground",
                        ].join(" ")}
                        title={r.valor ?? undefined}
                      >
                        {Number.isFinite(v) ? formatCOP(v) : r.valor ?? "—"}
                      </TableCell>

                      <TableCell className="max-w-[320px] truncate">
                        {r.observaciones ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {loading ? "Cargando movimientos..." : "No hay movimientos con esos filtros."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 gap-2">
            <div className="text-sm text-muted-foreground">{loading ? "Cargando..." : "Listo"}</div>

            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={safePage <= 1} onClick={() => setPage(1)}>
                « Primero
              </Button>
              <Button
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹ Anterior
              </Button>

              <span className="text-sm">
                {safePage} / {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente ›
              </Button>
              <Button variant="outline" disabled={safePage >= totalPages} onClick={() => setPage(totalPages)}>
                Último »
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
