import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProjectStatusChart } from "@/components/dashboard/ProjectStatusChart";
import { DisbursementsChart } from "@/components/dashboard/DisbursementsChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { 
  getProjectStats, 
  getTotalGirado, 
  getInventarioValor, 
  getSaldoCaja 
} from "@/data/mockData";
import { Home, Banknote, Package, Wallet } from "lucide-react";

export default function Dashboard() {
  const projectStats = getProjectStats();
  const totalGirado = getTotalGirado();
  const inventarioValor = getInventarioValor();
  const saldoCaja = getSaldoCaja();

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de operaciones</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Proyectos Activos"
            value={projectStats.activos}
            subtitle={`${projectStats.total} proyectos en total`}
            icon={<Home className="w-5 h-5" />}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Girado"
            value={formatCurrency(totalGirado)}
            subtitle="Este mes"
            icon={<Banknote className="w-5 h-5" />}
            variant="accent"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Valor Inventario"
            value={formatCurrency(inventarioValor)}
            subtitle="8 tipos de materiales"
            icon={<Package className="w-5 h-5" />}
            variant="warning"
          />
          <StatCard
            title="Saldo en Caja"
            value={formatCurrency(saldoCaja)}
            subtitle="Disponible"
            icon={<Wallet className="w-5 h-5" />}
            variant="success"
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DisbursementsChart />
          <ProjectStatusChart />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          
          {/* Quick Stats */}
          <div className="stat-card">
            <h3 className="font-semibold mb-4">Resumen de Proyectos</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                <span className="text-sm">En Ejecución</span>
                <span className="font-semibold text-primary">{projectStats.activos}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/5">
                <span className="text-sm">Terminados</span>
                <span className="font-semibold text-success">{projectStats.terminados}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/5">
                <span className="text-sm">Pendientes</span>
                <span className="font-semibold text-warning">{projectStats.pendientes}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
                <span className="text-sm">Suspendidos</span>
                <span className="font-semibold text-destructive">{projectStats.suspendidos}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
