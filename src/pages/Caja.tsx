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
} from "recharts";
import { AlertTriangle, ChevronDown, TrendingDown, TrendingUp, Calendar } from "lucide-react";

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
  _source?: string; // To identify which table the row came from
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

function initials(name?: string) {
  const s = (name ?? "").trim();
  if (!s) return "—";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => (p[0] ?? "").toUpperCase()).join("");
}

function exportCsv(rows: CajaRow[], source: DataSource) {
  const headers = [
    "registro_id",
    "fecha",
    "pagado_a",
    "concepto",
    "negocio",
    "tipo_gasto",
    "subgasto",
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
  a.download = `caja_${source}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#d84c73",
  "#8dd1e1",
  "#a4de6c",
];

export default function Caja() {
  // Data sources
  const caja2025: any = useCajaConsorcio();
  const caja2024: any = useCajaConsorcio2024();

  // Data source selector
  const [dataSource, setDataSource] = useState<DataSource>("2025");

  // Get rows based on selected data source
  const rows: CajaRow[] = useMemo(() => {
    const rows2025: CajaRow[] = (caja2025?.data ?? []).map((r: any) => ({ ...r, _source: "2025" }));
    const rows2024: CajaRow[] = (caja2024?.data ?? []).map((r: any) => ({ ...r, _source: "2024" }));

    switch (dataSource) {
      case "2025":
        return rows2025;
      case "2024":
        return rows2024;
      case "todos":
        return [...rows2025, ...rows2024];
      default:
        return rows2025;
    }
  }, [caja2025?.data, caja2024?.data, dataSource]);

  const loading: boolean = Boolean(caja2025?.isLoading || caja2024?.isLoading);
  const error: any = caja2025?.error ?? caja2024?.error ?? null;
  
  const refetch = () => {
    caja2025?.refetch?.();
    caja2024?.refetch?.();
  };

  // Filters
  const [search, setSearch] = useState("");
  const [negocio, setNegocio] = useState("");
  const [tipoGasto, setTipoGasto] = useState("");
  const [subgasto, setSubgasto] = useState("");
  const [onlyNegatives, setOnlyNegatives] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [showCharts, setShowCharts] = useState(true);
  const [showTable, setShowTable] = useState(false);

  const onSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  // Reset page when data source changes
  const handleDataSourceChange = (value: string) => {
    setDataSource(value as DataSource);
    setPage(1);
  };

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

      const v = Number(r.valor_num ?? 0);
      if (onlyNegatives && !(Number.isFinite(v) && v < 0)) return false;

      if (fromMs !== null || toMs !== null) {
        const f = toDateMs(r.fecha);
        if (!f) return false;
        if (fromMs !== null && f < fromMs) return false;
        if (toMs !== null && f > toMs) return false;
      }

      if (!q) return true;
      const hay = `${r.registro_id ?? ""} ${r.fecha ?? ""} ${r.pagado_a ?? ""} ${
        r.concepto ?? ""
      } ${r.negocio ?? ""} ${r.tipo_gasto ?? ""} ${r.subgasto ?? ""} ${r.valor ?? ""} ${r.observaciones ?? ""}`.toLowerCase();
      return hay.includes(q);
    });

    const dir = sortDir === "asc" ? 1 : -1;

    out.sort((a, b) => {
      const cmpStr = (x?: string, y?: string) =>
        (x ?? "").localeCompare(y ?? "", "es", { sensitivity: "base" }) * dir;

      const cmpNum = (x?: number | null, y?: number | null) =>
        (Number(x ?? 0) - Number(y ?? 0)) * dir;

      const cmpDate = (x?: string, y?: string) => (toDateMs(x) - toDateMs(y)) * dir;

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
        case "tipo_gasto":
          return cmpStr(a.tipo_gasto, b.tipo_gasto);
        case "subgasto":
          return cmpStr(a.subgasto, b.subgasto);
        case "valor_num":
          return cmpNum(a.valor_num, b.valor_num) || cmpStr(a.registro_id, b.registro_id);
        default:
          return 0;
      }
    });

    return out;
  }, [rows, search, negocio, tipoGasto, subgasto, onlyNegatives, fromDate, toDate, sortKey, sortDir]);

  const stats = useMemo(() => {
    let ingresos = 0;
    let egresos = 0;
    let balance = 0;

    // Stats by month for comparison
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

    let currentMonthIngresos = 0;
    let currentMonthEgresos = 0;
    let prevMonthIngresos = 0;
    let prevMonthEgresos = 0;

    for (const r of filtered) {
      const v = Number(r.valor_num ?? 0);
      if (!Number.isFinite(v)) continue;
      balance += v;
      if (v >= 0) ingresos += v;
      else egresos += v;

      const mes = r.fecha?.slice(0, 7);
      if (mes === currentMonth) {
        if (v >= 0) currentMonthIngresos += v;
        else currentMonthEgresos += v;
      } else if (mes === prevMonth) {
        if (v >= 0) prevMonthIngresos += v;
        else prevMonthEgresos += v;
      }
    }

    const currentMonthResult = currentMonthIngresos + currentMonthEgresos;
    const prevMonthResult = prevMonthIngresos + prevMonthEgresos;

    // Calculate percentage changes
    const calcChange = (current: number, prev: number) => {
      if (prev === 0) return current !== 0 ? 100 : 0;
      return ((current - prev) / Math.abs(prev)) * 100;
    };

    return {
      count: filtered.length,
      ingresos,
      egresos,
      balance,
      currentMonthResult,
      ingresosChange: calcChange(currentMonthIngresos, prevMonthIngresos),
      egresosChange: calcChange(Math.abs(currentMonthEgresos), Math.abs(prevMonthEgresos)),
      balanceChange: calcChange(balance, balance - currentMonthResult + prevMonthResult),
      resultChange: calcChange(currentMonthResult, prevMonthResult),
    };
  }, [filtered]);

  // Chart data: Gastos por tipo_gasto
  const gastosPorTipo = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of filtered) {
      const v = Number(r.valor_num ?? 0);
      if (v >= 0) continue; // Solo egresos
      const key = r.tipo_gasto?.trim() || "";
      const displayName = key === "" ? "Clasificación pendiente" : key;
      map.set(displayName, (map.get(displayName) ?? 0) + Math.abs(v));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, isPending: name === "Clasificación pendiente" }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filtered]);

  // Chart data: Gastos por mes with cumulative balance
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
    
    // Calculate cumulative balance
    let cumulative = 0;
    return sorted.map((item) => {
      cumulative += item.ingresos - item.egresos;
      return { ...item, balanceAcumulado: cumulative };
    });
  }, [filtered]);

  // Chart data: Gastos por subgasto
  const gastosPorSubgasto = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of filtered) {
      const v = Number(r.valor_num ?? 0);
      if (v >= 0) continue;
      const key = r.subgasto?.trim() || "";
      const displayName = key === "" ? "Clasificación pendiente" : key;
      map.set(displayName, (map.get(displayName) ?? 0) + Math.abs(v));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, isPending: name === "Clasificación pendiente" }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
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
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Caja</CardTitle>
            <Tabs value={dataSource} onValueChange={handleDataSourceChange}>
              <TabsList>
                <TabsTrigger value="2025" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  2025
                </TabsTrigger>
                <TabsTrigger value="2024" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  2024
                </TabsTrigger>
                <TabsTrigger value="todos" className="flex items-center gap-1">
                  Todos
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showCharts ? "default" : "outline"}
              onClick={() => setShowCharts((v) => !v)}
            >
              {showCharts ? "Ocultar gráficos" : "Mostrar gráficos"}
            </Button>
            <Button variant="outline" onClick={() => exportCsv(filtered, dataSource)} disabled={loading}>
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={loading}
              title="Actualizar"
            >
              Actualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* KPIs - Reorganized with Balance first */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Balance - Primary KPI */}
            <Card className="shadow-none border-2 border-primary/30 bg-primary/5">
              <CardContent className="pt-6 pb-4">
                <div className="text-sm font-medium text-muted-foreground">Balance Total</div>
                <div className={`text-3xl font-bold mt-1 ${stats.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCOP(stats.balance)}
                </div>
                <div className={`flex items-center gap-1 text-sm mt-2 ${stats.balanceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.balanceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{stats.balanceChange >= 0 ? "▲" : "▼"} {Math.abs(stats.balanceChange).toFixed(1)}% vs mes anterior</span>
                </div>
              </CardContent>
            </Card>

            {/* Ingresos */}
            <Card className="shadow-none">
              <CardContent className="pt-6 pb-4">
                <div className="text-sm font-medium text-muted-foreground">Ingresos</div>
                <div className="text-3xl font-bold text-green-600 mt-1">{formatCOP(stats.ingresos)}</div>
                <div className={`flex items-center gap-1 text-sm mt-2 ${stats.ingresosChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.ingresosChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{stats.ingresosChange >= 0 ? "▲" : "▼"} {Math.abs(stats.ingresosChange).toFixed(1)}% vs mes anterior</span>
                </div>
              </CardContent>
            </Card>

            {/* Egresos */}
            <Card className="shadow-none">
              <CardContent className="pt-6 pb-4">
                <div className="text-sm font-medium text-muted-foreground">Egresos</div>
                <div className="text-3xl font-bold text-red-600 mt-1">{formatCOP(stats.egresos)}</div>
                <div className={`flex items-center gap-1 text-sm mt-2 ${stats.egresosChange <= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.egresosChange <= 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  <span>{stats.egresosChange <= 0 ? "▼" : "▲"} {Math.abs(stats.egresosChange).toFixed(1)}% vs mes anterior</span>
                </div>
              </CardContent>
            </Card>

            {/* Resultado del Mes */}
            <Card className="shadow-none">
              <CardContent className="pt-6 pb-4">
                <div className="text-sm font-medium text-muted-foreground">Resultado del Mes</div>
                <div className={`text-3xl font-bold mt-1 ${stats.currentMonthResult >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCOP(stats.currentMonthResult)}
                </div>
                <div className={`flex items-center gap-1 text-sm mt-2 ${stats.resultChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.resultChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{stats.resultChange >= 0 ? "▲" : "▼"} {Math.abs(stats.resultChange).toFixed(1)}% vs mes anterior</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts - Reduced height */}
          {showCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Gastos por mes with cumulative balance line */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Ingresos vs Egresos por Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  {gastosPorMes.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <ComposedChart data={gastosPorMes}>
                        <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                        <Tooltip
                          formatter={(value: number, name: string) => [formatCOP(value), name === "balanceAcumulado" ? "Balance Acumulado" : name]}
                          labelFormatter={(label) => `Mes: ${label}`}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="ingresos" fill="#22c55e" name="Ingresos" />
                        <Bar yAxisId="left" dataKey="egresos" fill="#ef4444" name="Egresos" />
                        <Line yAxisId="right" type="monotone" dataKey="balanceAcumulado" stroke="#3b82f6" strokeWidth={2} name="Balance Acumulado" dot={{ r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-muted-foreground">
                      Sin datos
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gastos por tipo - Top 5 with alert for pending */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top 5 Gastos por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  {gastosPorTipo.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={gastosPorTipo}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent, isPending }) =>
                            `${isPending ? "⚠️ " : ""}${name.slice(0, 10)}${name.length > 10 ? "..." : ""} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {gastosPorTipo.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.isPending ? "#f59e0b" : COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatCOP(value)} 
                          labelFormatter={(label) => label === "Clasificación pendiente" ? `⚠️ ${label}` : label}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-muted-foreground">
                      Sin egresos
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gastos por subgasto - Top 5 */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top 5 Gastos por Subgasto</CardTitle>
                </CardHeader>
                <CardContent>
                  {gastosPorSubgasto.length > 0 ? (
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={gastosPorSubgasto} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={({ x, y, payload }) => (
                            <g transform={`translate(${x},${y})`}>
                              <text x={0} y={0} dy={4} textAnchor="end" fill="#666" fontSize={10}>
                                {payload.value === "Clasificación pendiente" ? "⚠️ " : ""}
                                {payload.value.length > 16 ? payload.value.slice(0, 16) + "..." : payload.value}
                              </text>
                            </g>
                          )}
                          width={130}
                        />
                        <Tooltip formatter={(value: number) => formatCOP(value)} />
                        <Bar 
                          dataKey="value" 
                          name="Gasto"
                          fill="#8884d8"
                        >
                          {gastosPorSubgasto.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.isPending ? "#f59e0b" : "#8884d8"} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[140px] flex items-center justify-center text-muted-foreground">
                      Sin egresos
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Buscar</label>
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Negocio</label>
              <Input
                placeholder="Ej: Tienda..."
                value={negocio}
                onChange={(e) => { setNegocio(e.target.value); setPage(1); }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Tipo Gasto</label>
              <Input
                placeholder="Ej: Operativo..."
                value={tipoGasto}
                onChange={(e) => { setTipoGasto(e.target.value); setPage(1); }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Subgasto</label>
              <Input
                placeholder="Ej: Combustible..."
                value={subgasto}
                onChange={(e) => { setSubgasto(e.target.value); setPage(1); }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Desde</label>
              <input
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Hasta</label>
              <input
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                variant={onlyNegatives ? "default" : "outline"}
                onClick={() => { setOnlyNegatives((v) => !v); setPage(1); }}
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
                Fuente: {dataSource === "todos" ? "2024 + 2025" : dataSource}
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
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
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

      {/* Collapsible Table */}
      <Collapsible open={showTable} onOpenChange={setShowTable}>
        <Card>
          <CardHeader className="pb-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <CardTitle className="text-lg">Detalle de Movimientos</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{filtered.length} registros</span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${showTable ? "rotate-180" : ""}`} />
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
                                <div className="truncate max-w-[180px]">{r.pagado_a ?? "—"}</div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="max-w-[250px] truncate">{r.concepto ?? "—"}</TableCell>
                          <TableCell className="max-w-[140px] truncate">{r.negocio ?? "—"}</TableCell>
                          <TableCell className="max-w-[140px] truncate">
                            {hasPendingTipo ? (
                              <span className="flex items-center gap-1 text-amber-600">
                                <AlertTriangle className="h-3 w-3" />
                                Clasificación pendiente
                              </span>
                            ) : (
                              r.tipo_gasto
                            )}
                          </TableCell>
                          <TableCell className="max-w-[140px] truncate">
                            {hasPendingSubgasto ? (
                              <span className="flex items-center gap-1 text-amber-600">
                                <AlertTriangle className="h-3 w-3" />
                                Clasificación pendiente
                              </span>
                            ) : (
                              r.subgasto
                            )}
                          </TableCell>

                          <TableCell
                            className={[
                              "text-right font-medium whitespace-nowrap",
                              isNeg ? "text-red-600" : v > 0 ? "text-green-600" : "text-foreground",
                            ].join(" ")}
                            title={r.valor ?? undefined}
                          >
                            {Number.isFinite(v) ? formatCOP(v) : r.valor ?? "—"}
                          </TableCell>

                          <TableCell className="max-w-[280px] truncate">
                            {r.observaciones ?? "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {paged.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10">
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
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
