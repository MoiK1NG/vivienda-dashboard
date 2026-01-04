import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCajaConsorcio, getCajaStats } from "@/hooks/useCajaConsorcio";
import { Search, Download, Calendar, Wallet, Loader2 } from "lucide-react";

export default function Caja() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: cajaData, isLoading, error } = useCajaConsorcio();

  const filteredMovs = (cajaData || []).filter(m => {
    const matchesSearch = 
      (m.concepto?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (m.observaciones?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (m.pagado_a?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = getCajaStats(cajaData || []);
  const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="stat-card text-center py-12">
          <p className="text-destructive">Error al cargar los datos: {error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Caja Consorcio</h1>
            <p className="text-muted-foreground">Movimientos del consorcio</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="stat-card bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Movimientos</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(stats.total)}</p>
              </div>
            </div>
          </div>
          <div className="stat-card bg-gradient-to-br from-secondary/50 to-secondary/30">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-muted">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registros</p>
                <p className="text-xl font-bold">{stats.count}</p>
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
                placeholder="Buscar por concepto, observaciones o pagado a..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="stat-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Concepto</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Pagado A</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Observaciones</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovs.map((mov) => (
                  <tr key={mov.registro_id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {mov.fecha ? new Date(mov.fecha).toLocaleDateString('es-CO') : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium max-w-xs truncate">{mov.concepto || '-'}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground max-w-xs truncate">{mov.pagado_a || '-'}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground max-w-xs truncate">{mov.observaciones || '-'}</td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(mov.valor_num || 0)}
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
