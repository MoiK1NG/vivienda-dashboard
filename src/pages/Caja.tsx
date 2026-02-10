"use client";

import React, { useMemo, useState } from "react";
import { useCajaConsorcio } from "@/hooks/useCajaConsorcio";
import { useCajaConsorcio2024 } from "@/hooks/useCajaConsorcio2024";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Line,
  ComposedChart,
  CartesianGrid,
} from "recharts";
import {
  AlertTriangle,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Download,
  RefreshCw,
  Search,
  Filter,
  Building2,
  Tag,
  Layers,
  X,
} from "lucide-react";

type CajaRow = {
  registro_id?: string;
  fecha?: string;
  pagado_a?: string;
  concepto?: string;
  valor?: string;
  valor_num?: number | null;
  negocio?: string;
  observaciones?: string;
  tipo_gasto?: string;
  subgasto?: string;
  updated_at?: string;
  _source?: string;
};

type SortKey =
  | "registro_id"
  | "fecha"
  | "pagado_a"
  | "concepto"
  | "negocio"
  | "valor_num"
  | "tipo_gasto"
  | "subgasto";

type DataSource = "2025" | "2024" | "todos";

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

function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function initials(name?: string) {
  const s = (name ?? "").trim();
  if (!s) return "—";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => (p[0] ?? "").toUpperCase()).join("");
}

function exportCsv(rows: CajaRow[], source: DataSource) {
  const headers = [
    "registro_id", "fecha", "pagado_a", "concepto", "negocio",
    "tipo_gasto", "subgasto", "valor_num", "observaciones", "updated_at",
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
  a.download = `caja_${source}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const CHART_COLORS = [
  "hsl(217, 91%, 60%)",   // primary blue
  "hsl(25, 95%, 53%)",    // accent orange
  "hsl(142, 76%, 36%)",   // success green
  "hsl(262, 83%, 58%)",   // purple
  "hsl(340, 75%, 55%)",   // pink
  "hsl(190, 80%, 45%)",   // teal
  "hsl(38, 92%, 50%)",    // warning yellow
  "hsl(0, 84%, 60%)",     // red
];

const MONTHS = [
  { label: "Ene", value: "01" },
  { label: "Feb", value: "02" },
  { label: "Mar", value: "03" },
  { label: "Abr", value: "04" },
  { label: "May", value: "05" },
  { label: "Jun", value: "06" },
  { label: "Jul", value: "07" },
  { label: "Ago", value: "08" },
  { label: "Sep", value: "09" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dic", value: "12" },
];

export default function Caja() {
  const caja2025: any = useCajaConsorcio();
  const caja2024: any = useCajaConsorcio2024();

  const [dataSource, setDataSource] = useState<DataSource>("2025");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const rows: CajaRow[] = useMemo(() => {
    const rows2025: CajaRow[] = (caja2025?.data ?? []).map((r: any) => ({ ...r, _source: "2025" }));
    const rows2024: CajaRow[] = (caja2024?.data ?? []).map((r: any) => ({ ...r, _source: "2024" }));
    switch (dataSource) {
      case "2025": return rows2025;
      case "2024": return rows2024;
      case "todos": return [...rows2025, ...rows2024];
      default: return rows2025;
    }
  }, [caja2025?.data, caja2024?.data, dataSource]);

  const loading = Boolean(caja2025?.isLoading || caja2024?.isLoading);
  const error: any = caja2025?.error ?? caja2024?.error ?? null;
  const refetch = () => { caja2025?.refetch?.(); caja2024?.refetch?.(); };

  // Filters
  const [search, setSearch] = useState("");
  const [negocio, setNegocio] = useState("");
  const [tipoGasto, setTipoGasto] = useState("");
  const [subgasto, setSubgasto] = useState("");
  const [onlyNegatives, setOnlyNegatives] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showTable, setShowTable] = useState(false);

  const onSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const handleDataSourceChange = (value: string) => {
    setDataSource(value as DataSource);
    setPage(1);
    setSelectedMonth("");
  };

  const hasActiveFilters = search || negocio || tipoGasto || subgasto || onlyNegatives || fromDate || toDate || selectedMonth;

  const clearAllFilters = () => {
    setSearch(""); setNegocio(""); setTipoGasto(""); setSubgasto("");
    setOnlyNegatives(false); setFromDate(""); setToDate(""); setSelectedMonth("");
    setPage(1);
  };

  // Unique values for filter chips
  const uniqueNegocios = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) { if (r.negocio?.trim()) set.add(r.negocio.trim()); }
    return Array.from(set).sort();
  }, [rows]);

  const uniqueTiposGasto = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) { if (r.tipo_gasto?.trim()) set.add(r.tipo_gasto.trim()); }
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const neg = negocio.trim().toLowerCase();
    const tg = tipoGasto.trim().toLowerCase();
    const sg = subgasto.trim().toLowerCase();
    const fromMs = fromDate ? toDateMs(fromDate) : null;
    const toMs = toDate ? toDateMs(toDate) : null;

    const out = (rows ?? []).filter((r) => {
      if (neg && !(r.negocio ?? "").toLowerCase().includes(neg)) return false;
      if (tg && !(r.tipo_gasto ?? "").toLowerCase().includes(tg)) return false;
      if (sg && !(r.subgasto ?? "").toLowerCase().includes(sg)) return false;
      
      // Month filter
      if (selectedMonth) {
        const rowMonth = r.fecha?.slice(5, 7);
        if (rowMonth !== selectedMonth) return false;
      }

      const v = Number(r.valor_num ?? 0);
      if (onlyNegatives && !(Number.isFinite(v) && v < 0)) return false;

      if (fromMs !== null || toMs !== null) {
        const f = toDateMs(r.fecha);
        if (!f) return false;
        if (fromMs !== null && f < fromMs) return false;
        if (toMs !== null && f > toMs) return false;
      }

      if (!q) return true;
      const hay = `${r.registro_id ?? ""} ${r.fecha ?? ""} ${r.pagado_a ?? ""} ${r.concepto ?? ""} ${r.negocio ?? ""} ${r.tipo_gasto ?? ""} ${r.subgasto ?? ""} ${r.valor ?? ""} ${r.observaciones ?? ""}`.toLowerCase();
      return hay.includes(q);
    });

    const dir = sortDir === "asc" ? 1 : -1;
    out.sort((a, b) => {
      const cmpStr = (x?: string, y?: string) => (x ?? "").localeCompare(y ?? "", "es", { sensitivity: "base" }) * dir;
      const cmpNum = (x?: number | null, y?: number | null) => (Number(x ?? 0) - Number(y ?? 0)) * dir;
      const cmpDate = (x?: string, y?: string) => (toDateMs(x) - toDateMs(y)) * dir;
      switch (sortKey) {
        case "registro_id": return cmpStr(a.registro_id, b.registro_id);
        case "fecha": return cmpDate(a.fecha, b.fecha) || cmpStr(a.registro_id, b.registro_id);
        case "pagado_a": return cmpStr(a.pagado_a, b.pagado_a);
        case "concepto": return cmpStr(a.concepto, b.concepto);
        case "negocio": return cmpStr(a.negocio, b.negocio);
        case "tipo_gasto": return cmpStr(a.tipo_gasto, b.tipo_gasto);
        case "subgasto": return cmpStr(a.subgasto, b.subgasto);
        case "valor_num": return cmpNum(a.valor_num, b.valor_num) || cmpStr(a.registro_id, b.registro_id);
        default: return 0;
      }
    });
    return out;
  }, [rows, search, negocio, tipoGasto, subgasto, onlyNegatives, fromDate, toDate, sortKey, sortDir, selectedMonth]);

  const stats = useMemo(() => {
    let ingresos = 0;
    let egresos = 0;
    let balance = 0;
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    let currentMonthIngresos = 0, currentMonthEgresos = 0, prevMonthIngresos = 0, prevMonthEgresos = 0;

    for (const r of filtered) {
      const v = Number(r.valor_num ?? 0);
      if (!Number.isFinite(v)) continue;
      balance += v;
      if (v >= 0) ingresos += v;
      else egresos += v;
      const mes = r.fecha?.slice(0, 7);
      if (mes === currentMonth) { if (v >= 0) currentMonthIngresos += v; else currentMonthEgresos += v; }
      else if (mes === prevMonth) { if (v >= 0) prevMonthIngresos += v; else prevMonthEgresos += v; }
    }

    const currentMonthResult = currentMonthIngresos + currentMonthEgresos;
    const prevMonthResult = prevMonthIngresos + prevMonthEgresos;
    const calcChange = (current: number, prev: number) => {
      if (prev === 0) return current !== 0 ? 100 : 0;
      return ((current - prev) / Math.abs(prev)) * 100;
    };

    return {
      count: filtered.length,
      ingresos, egresos, balance, currentMonthResult,
      ingresosChange: calcChange(currentMonthIngresos, prevMonthIngresos),
      egresosChange: calcChange(Math.abs(currentMonthEgresos), Math.abs(prevMonthEgresos)),
      balanceChange: calcChange(balance, balance - currentMonthResult + prevMonthResult),
      resultChange: calcChange(currentMonthResult, prevMonthResult),
    };
  }, [filtered]);

  // Chart data
  const gastosPorTipo = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of filtered) {
      const v = Number(r.valor_num ?? 0);
      if (v >= 0) continue;
      const key = r.tipo_gasto?.trim() || "";
      const displayName = key === "" ? "Clasificación pendiente" : key;
      map.set(displayName, (map.get(displayName) ?? 0) + Math.abs(v));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, isPending: name === "Clasificación pendiente" }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filtered]);

  const gastosPorMes = useMemo(() => {
    const map = new Map<string, { ingresos: number; egresos: number }>();
    for (const r of filtered) {
      const v = Number(r.valor_num ?? 0);
      if (!Number.isFinite(v)) continue;
      const mes = r.fecha?.slice(0, 7) || "Sin fecha";
      const current = map.get(mes) ?? { ingresos: 0, egresos: 0 };
      if (v >= 0) current.ingresos += v;
      else current.egresos += Math.abs(v);
      map.set(mes, current);
    }
    const sorted = Array.from(map.entries())
      .map(([mes, data]) => ({ mes, ...data }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
    let cumulative = 0;
    return sorted.map((item) => {
      cumulative += item.ingresos - item.egresos;
      return { ...item, balanceAcumulado: cumulative };
    });
  }, [filtered]);

  const gastosPorNegocio = useMemo(() => {
    const map = new Map<string, { ingresos: number; egresos: number }>();
    for (const r of filtered) {
      const v = Number(r.valor_num ?? 0);
      if (!Number.isFinite(v)) continue;
      const key = r.negocio?.trim() || "Sin negocio";
      const current = map.get(key) ?? { ingresos: 0, egresos: 0 };
      if (v >= 0) current.ingresos += v;
      else current.egresos += Math.abs(v);
      map.set(key, current);
    }
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data, total: data.ingresos + data.egresos }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [filtered]);

  const flujoCajaSemanal = useMemo(() => {
    const map = new Map<string, { ingresos: number; egresos: number }>();
    for (const r of filtered) {
      const v = Number(r.valor_num ?? 0);
      if (!Number.isFinite(v) || !r.fecha) continue;
      const date = new Date(r.fecha);
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
      const weekKey = `${date.getFullYear()}-S${String(weekNum).padStart(2, "0")}`;
      const current = map.get(weekKey) ?? { ingresos: 0, egresos: 0 };
      if (v >= 0) current.ingresos += v;
      else current.egresos += Math.abs(v);
      map.set(weekKey, current);
    }
    return Array.from(map.entries())
      .map(([semana, data]) => ({ semana, ...data, neto: data.ingresos - data.egresos }))
      .sort((a, b) => a.semana.localeCompare(b.semana))
      .slice(-12);
  }, [filtered]);

  // Top pagados (like "productos más vendidos" in reference)
  const topPagados = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of filtered) {
      const v = Number(r.valor_num ?? 0);
      if (v >= 0 || !r.pagado_a?.trim()) continue;
      const key = r.pagado_a.trim();
      map.set(key, (map.get(key) ?? 0) + Math.abs(v));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const SortHead = ({ label, k, className }: { label: string; k: SortKey; className?: string }) => {
    const active = sortKey === k;
    const arrow = active ? (sortDir === "asc" ? "↑" : "↓") : "";
    return (
      <TableHead className={className}>
        <button type="button" className="flex items-center gap-2 select-none hover:underline" onClick={() => onSort(k)} title="Ordenar">
          <span>{label}</span>
          <span className="text-xs opacity-70">{arrow}</span>
        </button>
      </TableHead>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader><CardTitle>Caja</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-destructive">Error cargando la información.</div>
            <pre className="text-xs whitespace-pre-wrap break-words bg-muted p-3 rounded">{String(error?.message ?? error)}</pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  const periodLabel = dataSource === "todos" ? "2024-2025" : dataSource;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Panel Financiero {periodLabel}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} movimientos · Actualizado en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={dataSource} onValueChange={handleDataSourceChange}>
            <TabsList className="bg-secondary">
              <TabsTrigger value="2025" className="text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="h-3 w-3" /> 2025
              </TabsTrigger>
              <TabsTrigger value="2024" className="text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="h-3 w-3" /> 2024
              </TabsTrigger>
              <TabsTrigger value="todos" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Todos
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(v => !v)} className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">!</span>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCsv(filtered, dataSource)} disabled={loading} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Month filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {MONTHS.map((m) => (
          <button
            key={m.value}
            onClick={() => { setSelectedMonth(prev => prev === m.value ? "" : m.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedMonth === m.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {m.label}
          </button>
        ))}
        {selectedMonth && (
          <button
            onClick={() => setSelectedMonth("")}
            className="px-2 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Limpiar
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardContent className="pt-5 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Search className="h-3 w-3" /> Buscar
                </label>
                <Input placeholder="Palabra clave..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Negocio
                </label>
                <select
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                  value={negocio}
                  onChange={(e) => { setNegocio(e.target.value); setPage(1); }}
                >
                  <option value="">Todos</option>
                  {uniqueNegocios.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Tipo Gasto
                </label>
                <select
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                  value={tipoGasto}
                  onChange={(e) => { setTipoGasto(e.target.value); setPage(1); }}
                >
                  <option value="">Todos</option>
                  {uniqueTiposGasto.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Subgasto
                </label>
                <Input placeholder="Ej: Combustible..." value={subgasto} onChange={(e) => { setSubgasto(e.target.value); setPage(1); }} className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Desde
                </label>
                <input className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs" type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Hasta
                </label>
                <input className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs" type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant={onlyNegatives ? "default" : "outline"}
                size="sm"
                onClick={() => { setOnlyNegatives(v => !v); setPage(1); }}
                className="text-xs h-7"
              >
                Solo egresos
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-7 text-destructive hover:text-destructive">
                  <X className="h-3 w-3 mr-1" /> Limpiar filtros
                </Button>
              )}
              <div className="ml-auto">
                <Badge variant="secondary" className="text-xs">
                  {filtered.length} / {(rows ?? []).length} registros
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Balance Total */}
        <div className="rounded-xl p-4 bg-primary/10 border border-primary/20 relative overflow-hidden">
          <div className="absolute top-3 right-3 p-2 rounded-lg bg-primary/20">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">Balance Total</p>
          <p className={`text-xl md:text-2xl font-bold mt-1 ${stats.balance >= 0 ? "text-success" : "text-destructive"}`}>
            {formatCompact(stats.balance)}
          </p>
          <div className={`flex items-center gap-1 text-xs mt-2 ${stats.balanceChange >= 0 ? "text-success" : "text-destructive"}`}>
            {stats.balanceChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            <span>{Math.abs(stats.balanceChange).toFixed(1)}% vs mes anterior</span>
          </div>
        </div>

        {/* Ingresos */}
        <div className="rounded-xl p-4 bg-success/10 border border-success/20 relative overflow-hidden">
          <div className="absolute top-3 right-3 p-2 rounded-lg bg-success/20">
            <ArrowUpRight className="h-5 w-5 text-success" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">Ingresos</p>
          <p className="text-xl md:text-2xl font-bold text-success mt-1">{formatCompact(stats.ingresos)}</p>
          <div className={`flex items-center gap-1 text-xs mt-2 ${stats.ingresosChange >= 0 ? "text-success" : "text-destructive"}`}>
            {stats.ingresosChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            <span>{Math.abs(stats.ingresosChange).toFixed(1)}% vs mes anterior</span>
          </div>
        </div>

        {/* Egresos */}
        <div className="rounded-xl p-4 bg-destructive/10 border border-destructive/20 relative overflow-hidden">
          <div className="absolute top-3 right-3 p-2 rounded-lg bg-destructive/20">
            <ArrowDownRight className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">Egresos</p>
          <p className="text-xl md:text-2xl font-bold text-destructive mt-1">{formatCompact(stats.egresos)}</p>
          <div className={`flex items-center gap-1 text-xs mt-2 ${stats.egresosChange <= 0 ? "text-success" : "text-destructive"}`}>
            {stats.egresosChange <= 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            <span>{Math.abs(stats.egresosChange).toFixed(1)}% vs mes anterior</span>
          </div>
        </div>

        {/* Resultado del Mes */}
        <div className="rounded-xl p-4 bg-accent/10 border border-accent/20 relative overflow-hidden">
          <div className="absolute top-3 right-3 p-2 rounded-lg bg-accent/20">
            <BarChart3 className="h-5 w-5 text-accent" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">Resultado del Mes</p>
          <p className={`text-xl md:text-2xl font-bold mt-1 ${stats.currentMonthResult >= 0 ? "text-success" : "text-destructive"}`}>
            {formatCompact(stats.currentMonthResult)}
          </p>
          <div className={`flex items-center gap-1 text-xs mt-2 ${stats.resultChange >= 0 ? "text-success" : "text-destructive"}`}>
            {stats.resultChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            <span>{Math.abs(stats.resultChange).toFixed(1)}% vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ingresos vs Egresos por Mes — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Ingresos vs Egresos por Mes</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {gastosPorMes.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={gastosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={{ stroke: "hsl(var(--border))" }} />
                  <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => formatCompact(v)} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => formatCompact(v)} axisLine={false} />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatCOP(value), name === "balanceAcumulado" ? "Balance Acumulado" : name]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="ingresos" fill="hsl(var(--success))" name="Ingresos" radius={[3, 3, 0, 0]} />
                  <Bar yAxisId="left" dataKey="egresos" fill="hsl(var(--destructive))" name="Egresos" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="balanceAcumulado" stroke="hsl(var(--primary))" strokeWidth={2} name="Balance Acumulado" dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Sin datos</div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Pagos — like "productos más vendidos" */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Top 5 Mayores Pagos</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {topPagados.length > 0 ? (
              <div className="space-y-3">
                {topPagados.map((item, i) => {
                  const maxVal = topPagados[0]?.value ?? 1;
                  const pct = (item.value / maxVal) * 100;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-medium truncate max-w-[60%]" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-muted-foreground font-mono">{formatCompact(item.value)}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">Sin egresos</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second row of charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Gastos por Tipo */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {gastosPorTipo.length > 0 ? (
              <div className="space-y-2.5">
                {gastosPorTipo.map((item, i) => {
                  const maxVal = gastosPorTipo[0]?.value ?? 1;
                  const pct = (item.value / maxVal) * 100;
                  return (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-medium truncate max-w-[60%] ${item.isPending ? "text-warning" : "text-foreground"}`}>
                            {item.isPending && "⚠️ "}{item.name}
                          </span>
                          <span className="text-muted-foreground font-mono">{formatCompact(item.value)}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: item.isPending ? "hsl(var(--warning))" : CHART_COLORS[i % CHART_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">Sin egresos</div>
            )}
          </CardContent>
        </Card>

        {/* Distribución por Negocio */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Distribución por Negocio</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {gastosPorNegocio.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={gastosPorNegocio} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} tickFormatter={(v) => formatCompact(v)} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} width={80} axisLine={false} />
                  <Tooltip
                    formatter={(value: number) => formatCOP(value)}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                  />
                  <Bar dataKey="ingresos" fill="hsl(var(--success))" name="Ingresos" stackId="a" radius={[0, 3, 3, 0]} />
                  <Bar dataKey="egresos" fill="hsl(var(--destructive))" name="Egresos" stackId="a" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Sin datos</div>
            )}
          </CardContent>
        </Card>

        {/* Flujo de Caja Semanal */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Flujo Semanal (12 sem)</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {flujoCajaSemanal.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={flujoCajaSemanal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="semana" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }} axisLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} tickFormatter={(v) => formatCompact(v)} axisLine={false} />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatCOP(value), name === "neto" ? "Balance Neto" : name === "ingresos" ? "Ingresos" : "Egresos"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                  />
                  <Bar dataKey="ingresos" fill="hsl(var(--success))" name="Ingresos" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="egresos" fill="hsl(var(--destructive))" name="Egresos" radius={[2, 2, 0, 0]} />
                  <Line type="monotone" dataKey="neto" stroke="hsl(var(--primary))" strokeWidth={2} name="Balance Neto" dot={{ r: 2, fill: "hsl(var(--primary))" }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Sin datos</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Collapsible Table */}
      <Collapsible open={showTable} onOpenChange={setShowTable}>
        <Card>
          <CardHeader className="pb-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <CardTitle className="text-base">Detalle de Movimientos</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{filtered.length} registros</Badge>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showTable ? "rotate-180" : ""}`} />
                </div>
              </Button>
            </CollapsibleTrigger>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-2">
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[1400px]">
                  <TableHeader>
                    <TableRow>
                      <SortHead label="Registro" k="registro_id" />
                      <SortHead label="Fecha" k="fecha" />
                      <SortHead label="Pagado a" k="pagado_a" />
                      <SortHead label="Concepto" k="concepto" />
                      <SortHead label="Negocio" k="negocio" />
                      <SortHead label="Tipo Gasto" k="tipo_gasto" />
                      <SortHead label="Subgasto" k="subgasto" />
                      <SortHead label="Valor" k="valor_num" className="text-right" />
                      <TableHead>Obs.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((r, idx) => {
                      const v = Number(r.valor_num ?? 0);
                      const isNeg = Number.isFinite(v) && v < 0;
                      const hasPendingTipo = !r.tipo_gasto?.trim();
                      const hasPendingSubgasto = !r.subgasto?.trim();
                      return (
                        <TableRow key={r.registro_id ?? String(idx)}>
                          <TableCell className="whitespace-nowrap font-mono text-xs">{r.registro_id ?? "—"}</TableCell>
                          <TableCell className="whitespace-nowrap text-xs">{r.fecha ?? "—"}</TableCell>
                          <TableCell title={r.pagado_a ?? ""}>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                {initials(r.pagado_a)}
                              </div>
                              <span className="truncate max-w-[160px] text-xs">{r.pagado_a ?? "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate text-xs">{r.concepto ?? "—"}</TableCell>
                          <TableCell className="max-w-[120px] truncate text-xs">{r.negocio ?? "—"}</TableCell>
                          <TableCell className="max-w-[120px] truncate text-xs">
                            {hasPendingTipo ? (
                              <span className="flex items-center gap-1 text-warning">
                                <AlertTriangle className="h-3 w-3" /> Pendiente
                              </span>
                            ) : r.tipo_gasto}
                          </TableCell>
                          <TableCell className="max-w-[120px] truncate text-xs">
                            {hasPendingSubgasto ? (
                              <span className="flex items-center gap-1 text-warning">
                                <AlertTriangle className="h-3 w-3" /> Pendiente
                              </span>
                            ) : r.subgasto}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium whitespace-nowrap text-xs ${isNeg ? "text-destructive" : v > 0 ? "text-success" : "text-foreground"}`}
                            title={r.valor ?? undefined}
                          >
                            {Number.isFinite(v) ? formatCOP(v) : r.valor ?? "—"}
                          </TableCell>
                          <TableCell className="max-w-[250px] truncate text-xs">{r.observaciones ?? "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                    {paged.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                          {loading ? "Cargando movimientos..." : "No hay movimientos con esos filtros."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4 gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Por página</label>
                  <select
                    className="h-7 rounded-md border border-input bg-background px-2 text-xs"
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  >
                    {[25, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 text-xs" disabled={safePage <= 1} onClick={() => setPage(1)}>«</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</Button>
                  <span className="text-xs text-muted-foreground px-2">{safePage} / {totalPages}</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs" disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" disabled={safePage >= totalPages} onClick={() => setPage(totalPages)}>»</Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
