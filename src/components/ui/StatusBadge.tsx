import { cn } from "@/lib/utils";

type Status = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'PENDIENTE' | 'EN_EJECUCION' | 'TERMINADO' | 'PROCESADO' | 'RECHAZADO' | 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'INGRESO' | 'EGRESO';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  ACTIVO: { label: 'Activo', className: 'bg-success/10 text-success border-success/20' },
  INACTIVO: { label: 'Inactivo', className: 'bg-muted text-muted-foreground border-muted' },
  SUSPENDIDO: { label: 'Suspendido', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  PENDIENTE: { label: 'Pendiente', className: 'bg-warning/10 text-warning border-warning/20' },
  EN_EJECUCION: { label: 'En Ejecución', className: 'bg-primary/10 text-primary border-primary/20' },
  TERMINADO: { label: 'Terminado', className: 'bg-success/10 text-success border-success/20' },
  PROCESADO: { label: 'Procesado', className: 'bg-success/10 text-success border-success/20' },
  RECHAZADO: { label: 'Rechazado', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  ENTRADA: { label: 'Entrada', className: 'bg-success/10 text-success border-success/20' },
  SALIDA: { label: 'Salida', className: 'bg-accent/10 text-accent border-accent/20' },
  AJUSTE: { label: 'Ajuste', className: 'bg-warning/10 text-warning border-warning/20' },
  INGRESO: { label: 'Ingreso', className: 'bg-success/10 text-success border-success/20' },
  EGRESO: { label: 'Egreso', className: 'bg-accent/10 text-accent border-accent/20' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  
  return (
    <span className={cn(
      "inline-flex items-center font-medium rounded-full border",
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      config.className
    )}>
      {config.label}
    </span>
  );
}
