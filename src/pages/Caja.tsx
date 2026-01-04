import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCajaConsorcio, getCajaStats } from "@/hooks/useCajaConsorcio";
import { Search, Download, Calendar, Wallet, Loader2, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Caja() {
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>();
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>();
  const [pagadoA, setPagadoA] = useState("");
  const [tercerDestino, setTercerDestino] = useState("");
  const [concepto, setConcepto] = useState("");
  const [valorMin, setValorMin] = useState("");
  const [valorMax, setValorMax] = useState("");
  const [negocio, setNegocio] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: cajaData, isLoading, error } = useCajaConsorcio();

  const filteredMovs = (cajaData || []).filter(m => {
    // Búsqueda general
    const matchesSearch = searchTerm === "" || 
      (m.concepto?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (m.observaciones?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (m.pagado_a?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    // Filtro por fecha
    const movDate = m.fecha ? new Date(m.fecha) : null;
    const matchesFechaDesde = !fechaDesde || (movDate && movDate >= fechaDesde);
    const matchesFechaHasta = !fechaHasta || (movDate && movDate <= fechaHasta);

    // Filtros de texto
    const matchesPagadoA = pagadoA === "" || (m.pagado_a?.toLowerCase() || "").includes(pagadoA.toLowerCase());
    const matchesTercerDestino = tercerDestino === "" || (m.tercer_destino_giro?.toLowerCase() || "").includes(tercerDestino.toLowerCase());
    const matchesConcepto = concepto === "" || (m.concepto?.toLowerCase() || "").includes(concepto.toLowerCase());
    const matchesNegocio = negocio === "" || (m.negocio?.toLowerCase() || "").includes(negocio.toLowerCase());
    const matchesObservaciones = observaciones === "" || (m.observaciones?.toLowerCase() || "").includes(observaciones.toLowerCase());

    // Filtro por valor
    const valor = m.valor_num || 0;
    const matchesValorMin = valorMin === "" || valor >= parseFloat(valorMin);
    const matchesValorMax = valorMax === "" || valor <= parseFloat(valorMax);

    return matchesSearch && matchesFechaDesde && matchesFechaHasta && 
           matchesPagadoA && matchesTercerDestino && matchesConcepto && 
           matchesNegocio && matchesObservaciones && matchesValorMin && matchesValorMax;
  });

  const stats = getCajaStats(filteredMovs);
  const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`;

  const clearFilters = () => {
    setSearchTerm("");
    setFechaDesde(undefined);
    setFechaHasta(undefined);
    setPagadoA("");
    setTercerDestino("");
    setConcepto("");
    setValorMin("");
    setValorMax("");
    setNegocio("");
    setObservaciones("");
  };

  const hasActiveFilters = searchTerm || fechaDesde || fechaHasta || pagadoA || 
    tercerDestino || concepto || valorMin || valorMax || negocio || observaciones;

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
            <Button variant="secondary" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
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
                <p className="text-sm text-muted-foreground">Total Filtrado</p>
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
        <div className="stat-card space-y-4">
          {/* Search and Toggle */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Búsqueda rápida..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros avanzados
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t border-border">
              {/* Fecha Desde */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Fecha Desde</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fechaDesde && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {fechaDesde ? format(fechaDesde, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={fechaDesde}
                      onSelect={setFechaDesde}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Fecha Hasta */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Fecha Hasta</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fechaHasta && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {fechaHasta ? format(fechaHasta, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={fechaHasta}
                      onSelect={setFechaHasta}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Concepto */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Concepto</label>
                <Input
                  placeholder="Filtrar por concepto..."
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                />
              </div>

              {/* Pagado A */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Pagado A</label>
                <Input
                  placeholder="Filtrar por pagado a..."
                  value={pagadoA}
                  onChange={(e) => setPagadoA(e.target.value)}
                />
              </div>

              {/* Tercer Destino Giro */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tercer Destino Giro</label>
                <Input
                  placeholder="Filtrar por tercer destino..."
                  value={tercerDestino}
                  onChange={(e) => setTercerDestino(e.target.value)}
                />
              </div>

              {/* Negocio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Negocio</label>
                <Input
                  placeholder="Filtrar por negocio..."
                  value={negocio}
                  onChange={(e) => setNegocio(e.target.value)}
                />
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Observaciones</label>
                <Input
                  placeholder="Filtrar por observaciones..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </div>

              {/* Valor Mínimo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Valor Mínimo</label>
                <Input
                  type="number"
                  placeholder="Mínimo..."
                  value={valorMin}
                  onChange={(e) => setValorMin(e.target.value)}
                />
              </div>

              {/* Valor Máximo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Valor Máximo</label>
                <Input
                  type="number"
                  placeholder="Máximo..."
                  value={valorMax}
                  onChange={(e) => setValorMax(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="stat-card overflow-hidden p-0">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full min-w-[1200px]">
              <thead>
                {/* Filter Row */}
                <tr className="border-b border-border bg-muted/30">
                  <th className="py-2 px-4 min-w-[140px]">
                    <Input
                      type="date"
                      placeholder="Desde..."
                      value={fechaDesde ? format(fechaDesde, "yyyy-MM-dd") : ""}
                      onChange={(e) => setFechaDesde(e.target.value ? new Date(e.target.value) : undefined)}
                      className="h-8 text-xs"
                    />
                  </th>
                  <th className="py-2 px-4 min-w-[180px]">
                    <Input
                      placeholder="Concepto..."
                      value={concepto}
                      onChange={(e) => setConcepto(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </th>
                  <th className="py-2 px-4 min-w-[160px]">
                    <Input
                      placeholder="Pagado a..."
                      value={pagadoA}
                      onChange={(e) => setPagadoA(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </th>
                  <th className="py-2 px-4 min-w-[160px]">
                    <Input
                      placeholder="Tercer destino..."
                      value={tercerDestino}
                      onChange={(e) => setTercerDestino(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </th>
                  <th className="py-2 px-4 min-w-[140px]">
                    <Input
                      placeholder="Negocio..."
                      value={negocio}
                      onChange={(e) => setNegocio(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </th>
                  <th className="py-2 px-4 min-w-[180px]">
                    <Input
                      placeholder="Observaciones..."
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </th>
                  <th className="py-2 px-4 min-w-[120px]">
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={valorMin}
                        onChange={(e) => setValorMin(e.target.value)}
                        className="h-8 text-xs w-16"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={valorMax}
                        onChange={(e) => setValorMax(e.target.value)}
                        className="h-8 text-xs w-16"
                      />
                    </div>
                  </th>
                </tr>
                {/* Header Row */}
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">Concepto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">Pagado A</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">Tercer Destino</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">Negocio</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">Observaciones</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovs.map((mov) => (
                  <tr key={mov.registro_id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">
                          {mov.fecha ? new Date(mov.fecha).toLocaleDateString('es-CO') : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium max-w-[200px] truncate">{mov.concepto || '-'}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-[180px] truncate">{mov.pagado_a || '-'}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-[180px] truncate">{mov.tercer_destino_giro || '-'}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-[160px] truncate">{mov.negocio || '-'}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-[200px] truncate">{mov.observaciones || '-'}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
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
