import { giros, cajaMovs } from "@/data/mockData";
import { ArrowDownLeft, ArrowUpRight, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecentActivity() {
  // Combine and sort recent activities
  const activities = [
    ...giros.slice(0, 3).map(g => ({
      id: g.id,
      type: 'giro' as const,
      title: `Giro a ${g.contratistaNombre}`,
      subtitle: g.concepto,
      value: g.valor,
      date: g.fecha,
      isPositive: false,
    })),
    ...cajaMovs.slice(0, 3).map(c => ({
      id: c.id,
      type: 'caja' as const,
      title: c.concepto,
      subtitle: c.observaciones,
      value: c.valor,
      date: c.fecha,
      isPositive: c.tipo === 'INGRESO',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="stat-card">
      <h3 className="font-semibold mb-4">Actividad Reciente</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              activity.isPositive ? "bg-success/10" : "bg-accent/10"
            )}>
              {activity.isPositive ? (
                <ArrowDownLeft className="w-4 h-4 text-success" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-accent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.subtitle}</p>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-sm font-semibold",
                activity.isPositive ? "text-success" : "text-foreground"
              )}>
                {activity.isPositive ? '+' : '-'}${(activity.value / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(activity.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
