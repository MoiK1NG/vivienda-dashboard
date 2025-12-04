import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { contratistas } from "@/data/mockData";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, Phone, Mail, Building2, Eye, MoreVertical } from "lucide-react";

export default function Contratistas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS");

  const filteredContratistas = contratistas.filter(c => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nit.includes(searchTerm) ||
      c.contacto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFilter === "TODOS" || c.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Contratistas</h1>
            <p className="text-muted-foreground">Gestión de contratistas y proveedores</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            + Nuevo Contratista
          </button>
        </div>

        {/* Filters */}
        <div className="stat-card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre, NIT o contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="SUSPENDIDO">Suspendido</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="stat-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Contratista</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">NIT</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Contacto</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Proyectos</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Total Girado</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredContratistas.map((contratista) => (
                  <tr key={contratista.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium">{contratista.nombre}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{contratista.nit}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium">{contratista.contacto}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contratista.telefono}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {contratista.proyectosActivos} activos
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium">{formatCurrency(contratista.totalGirado)}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={contratista.estado} size="sm" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredContratistas.length === 0 && (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground">No se encontraron contratistas</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
