import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { inventarioItems, inventarioMovs } from "@/data/mockData";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, Package, AlertTriangle, TrendingUp, TrendingDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Inventario() {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<'items' | 'movimientos'>('items');

  const filteredItems = inventarioItems.filter(item =>
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMovs = inventarioMovs.filter(mov =>
    mov.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mov.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValor = inventarioItems.reduce((sum, item) => sum + (item.cantidad * item.costo), 0);
  const itemsBajoMinimo = inventarioItems.filter(item => item.cantidad <= item.minimo).length;
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Inventario</h1>
            <p className="text-muted-foreground">Control de materiales y movimientos</p>
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
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inventario</p>
                <p className="text-xl font-bold">{formatCurrency(totalValor)}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipos de Material</p>
                <p className="text-xl font-bold">{inventarioItems.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-xl",
                itemsBajoMinimo > 0 ? "bg-warning/10" : "bg-success/10"
              )}>
                <AlertTriangle className={cn(
                  "w-5 h-5",
                  itemsBajoMinimo > 0 ? "text-warning" : "text-success"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bajo Mínimo</p>
                <p className="text-xl font-bold">{itemsBajoMinimo} items</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle & Filters */}
        <div className="stat-card">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex bg-secondary rounded-lg p-1">
              <button
                onClick={() => setView('items')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  view === 'items' ? "bg-card shadow-sm" : "hover:bg-card/50"
                )}
              >
                Stock Actual
              </button>
              <button
                onClick={() => setView('movimientos')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  view === 'movimientos' ? "bg-card shadow-sm" : "hover:bg-card/50"
                )}
              >
                Movimientos
              </button>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por SKU o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {view === 'items' ? (
          <div className="stat-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">SKU</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Descripción</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Unidad</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Cantidad</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Mínimo</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Costo Unit.</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Valor Total</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono">
                          {item.sku}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium">{item.descripcion}</td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">{item.unidad}</td>
                      <td className="py-4 px-6 text-right font-medium">{item.cantidad.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right text-sm text-muted-foreground">{item.minimo.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right text-sm">{formatCurrency(item.costo)}</td>
                      <td className="py-4 px-6 text-right font-semibold">{formatCurrency(item.cantidad * item.costo)}</td>
                      <td className="py-4 px-6 text-center">
                        {item.cantidad <= item.minimo ? (
                          <span className="px-2 py-1 bg-warning/10 text-warning rounded-full text-xs font-medium">
                            Bajo
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="stat-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">SKU</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Descripción</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Cantidad</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Costo Unit.</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovs.map((mov) => (
                    <tr key={mov.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="py-4 px-6 text-sm">
                        {new Date(mov.fecha).toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={mov.tipo} size="sm" />
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono">
                          {mov.sku}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">{mov.descripcion}</td>
                      <td className="py-4 px-6 text-right font-medium">
                        <span className={cn(
                          mov.tipo === 'ENTRADA' ? 'text-success' : mov.tipo === 'SALIDA' ? 'text-accent' : ''
                        )}>
                          {mov.tipo === 'ENTRADA' ? '+' : mov.tipo === 'SALIDA' ? '-' : ''}{mov.cantidad}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-sm">{formatCurrency(mov.costoUnit)}</td>
                      <td className="py-4 px-6 text-right font-semibold">{formatCurrency(mov.cantidad * mov.costoUnit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
