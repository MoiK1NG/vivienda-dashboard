import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { viviendas, contratistas } from "@/data/mockData";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, Filter, Eye, MapPin, Calendar, User, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function Proyectos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS");
  const [contratistaFilter, setContratistaFilter] = useState<string>("TODOS");

  const filteredProyectos = viviendas.filter(v => {
    const matchesSearch = v.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.beneficiario.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFilter === "TODOS" || v.estado === estadoFilter;
    const matchesContratista = contratistaFilter === "TODOS" || v.contratista.id === contratistaFilter;
    return matchesSearch && matchesEstado && matchesContratista;
  });

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Proyectos</h1>
            <p className="text-muted-foreground">Gestión de viviendas y obras</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            + Nuevo Proyecto
          </button>
        </div>

        {/* Filters */}
        <div className="stat-card">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por código, dirección o beneficiario..."
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
                <option value="EN_EJECUCION">En Ejecución</option>
                <option value="TERMINADO">Terminado</option>
                <option value="SUSPENDIDO">Suspendido</option>
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

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProyectos.map((proyecto) => (
            <div key={proyecto.id} className="stat-card group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold">{proyecto.codigo}</p>
                  <StatusBadge status={proyecto.estado} size="sm" />
                </div>
                <button className="p-2 rounded-lg bg-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{proyecto.direccion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{proyecto.beneficiario.nombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {new Date(proyecto.fechaInicio).toLocaleDateString('es-CO')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Avance financiero</span>
                  <span className="text-sm font-medium">{proyecto.avance}%</span>
                </div>
                <Progress value={proyecto.avance} className="h-2" />
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Girado: {formatCurrency(proyecto.totalGirado)}</span>
                  <span>Presupuesto: {formatCurrency(proyecto.presupuesto)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">Contratista</p>
                <p className="text-sm font-medium">{proyecto.contratista.nombre}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredProyectos.length === 0 && (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground">No se encontraron proyectos</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
