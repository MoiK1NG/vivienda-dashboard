import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { cajaMovs, getSaldoCaja } from "@/data/mockData";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, ArrowDownLeft, ArrowUpRight, Download, Calendar, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Caja() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("TODOS");

  const filteredMovs = cajaMovs.filter(m => {
    const matchesSearch = m.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.observaciones.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === "TODOS" || m.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  const saldoCaja = getSaldoCaja();
  const totalIngresos = cajaMovs.filter(m => m.tipo === 'INGRESO').reduce((sum, m) => sum + m.valor, 0);
  const totalEgresos = cajaMovs.filter(m => m.tipo === 'EGRESO').reduce((sum, m) => sum + m.valor, 0);
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Caja</h1>
            <p className="text-muted-foreground">Movimientos de ingresos y egresos</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              + Nuevo Movimiento
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card bg-gradient-to-br from-success/10 to-success/5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/20">
                <ArrowDownLeft className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Ingresos</p>
                <p className="text-xl font-bold text-success">{formatCurrency(totalIngresos)}</p>
              </div>
            </div>
          </div>
          <div className="stat-card bg-gradient-to-br from-accent/10 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent/20">
                <ArrowUpRight className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Egresos</p>
                <p className="text-xl font-bold text-accent">{formatCurrency(totalEgresos)}</p>
              </div>
            </div>
          </div>
          <div className="stat-card bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Actual</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(saldoCaja)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="stat-card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por concepto u observaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="INGRESO">Ingresos</option>
              <option value="EGRESO">Egresos</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="stat-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Concepto</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Medio</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Observaciones</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovs.map((mov) => (
                  <tr key={mov.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(mov.fecha).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={mov.tipo} size="sm" />
                    </td>
                    <td className="py-4 px-6 font-medium max-w-xs truncate">{mov.concepto}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{mov.medio}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground max-w-xs truncate">{mov.observaciones}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={cn(
                        "font-semibold",
                        mov.tipo === 'INGRESO' ? 'text-success' : 'text-accent'
                      )}>
                        {mov.tipo === 'INGRESO' ? '+' : '-'}{formatCurrency(mov.valor)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredMovs.length === 0 && (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground">No se encontraron movimientos</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
