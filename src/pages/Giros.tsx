import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { giros, contratistas } from "@/data/mockData";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, Calendar, Download, Filter } from "lucide-react";

export default function Giros() {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS");
  const [contratistaFilter, setContratistaFilter] = useState<string>("TODOS");

  const filteredGiros = giros.filter(g => {
    const matchesSearch = g.contratistaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.proyectoCodigo && g.proyectoCodigo.includes(searchTerm));
    const matchesEstado = estadoFilter === "TODOS" || g.estado === estadoFilter;
    const matchesContratista = contratistaFilter === "TODOS" || g.contratistaId === contratistaFilter;
    return matchesSearch && matchesEstado && matchesContratista;
  });

  const totalGiros = filteredGiros.reduce((sum, g) => sum + g.valor, 0);
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Giros</h1>
            <p className="text-muted-foreground">Control de desembolsos a contratistas</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              + Nuevo Giro
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="stat-card bg-gradient-to-r from-accent/10 to-accent/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total en giros filtrados</p>
              <p className="text-3xl font-bold text-accent">{formatCurrency(totalGiros)}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{filteredGiros.length}</p>
                <p className="text-xs text-muted-foreground">Giros</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{filteredGiros.filter(g => g.estado === 'PROCESADO').length}</p>
                <p className="text-xs text-muted-foreground">Procesados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="stat-card">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por contratista, concepto o proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="PROCESADO">Procesado</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>
              <select
                value={contratistaFilter}
                onChange={(e) => setContratistaFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="TODOS">Todos los contratistas</option>
                {contratistas.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
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
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Contratista</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Proyecto</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Concepto</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Medio</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Valor</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredGiros.map((giro) => (
                  <tr key={giro.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(giro.fecha).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium">{giro.contratistaNombre}</td>
                    <td className="py-4 px-6">
                      {giro.proyectoCodigo ? (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                          {giro.proyectoCodigo}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{giro.concepto}</td>
                    <td className="py-4 px-6 text-sm">{giro.medio}</td>
                    <td className="py-4 px-6 text-right font-semibold">{formatCurrency(giro.valor)}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={giro.estado} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredGiros.length === 0 && (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground">No se encontraron giros</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
