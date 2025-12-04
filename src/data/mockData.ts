// Mock data for the housing improvement management system

export interface Contratista {
  id: string;
  nombre: string;
  nit: string;
  contacto: string;
  telefono: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  proyectosActivos: number;
  totalGirado: number;
}

export interface Beneficiario {
  id: string;
  nombre: string;
  documento: string;
  telefono: string;
}

export interface Vivienda {
  id: string;
  codigo: string;
  direccion: string;
  beneficiario: Beneficiario;
  contratista: Contratista;
  estado: 'PENDIENTE' | 'EN_EJECUCION' | 'TERMINADO' | 'SUSPENDIDO';
  fechaInicio: string;
  fechaFin: string | null;
  presupuesto: number;
  totalGirado: number;
  avance: number;
}

export interface Giro {
  id: string;
  contratistaId: string;
  contratistaNombre: string;
  proyectoId: string | null;
  proyectoCodigo: string | null;
  fecha: string;
  concepto: string;
  valor: number;
  medio: 'TRANSFERENCIA' | 'CHEQUE' | 'EFECTIVO';
  estado: 'PENDIENTE' | 'PROCESADO' | 'RECHAZADO';
}

export interface InventarioItem {
  id: string;
  sku: string;
  descripcion: string;
  unidad: string;
  costo: number;
  cantidad: number;
  minimo: number;
}

export interface InventarioMov {
  id: string;
  fecha: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  proyectoId: string | null;
  contratistaId: string | null;
  sku: string;
  descripcion: string;
  cantidad: number;
  costoUnit: number;
}

export interface CajaMov {
  id: string;
  fecha: string;
  tipo: 'INGRESO' | 'EGRESO';
  concepto: string;
  proyectoId: string | null;
  contratistaId: string | null;
  valor: number;
  medio: 'TRANSFERENCIA' | 'CHEQUE' | 'EFECTIVO';
  observaciones: string;
}

// Sample Contractors
export const contratistas: Contratista[] = [
  { id: '1', nombre: 'Construcciones López S.A.S', nit: '900123456-1', contacto: 'Carlos López', telefono: '3001234567', estado: 'ACTIVO', proyectosActivos: 5, totalGirado: 125000000 },
  { id: '2', nombre: 'Obras Civiles del Norte', nit: '900234567-2', contacto: 'María García', telefono: '3012345678', estado: 'ACTIVO', proyectosActivos: 3, totalGirado: 87500000 },
  { id: '3', nombre: 'Mejoras y Acabados Ltda', nit: '900345678-3', contacto: 'Pedro Martínez', telefono: '3023456789', estado: 'ACTIVO', proyectosActivos: 4, totalGirado: 92000000 },
  { id: '4', nombre: 'Constructora Familiar', nit: '900456789-4', contacto: 'Ana Rodríguez', telefono: '3034567890', estado: 'SUSPENDIDO', proyectosActivos: 0, totalGirado: 45000000 },
  { id: '5', nombre: 'Soluciones Habitacionales', nit: '900567890-5', contacto: 'Luis Hernández', telefono: '3045678901', estado: 'ACTIVO', proyectosActivos: 6, totalGirado: 156000000 },
];

// Sample Beneficiaries
export const beneficiarios: Beneficiario[] = [
  { id: '1', nombre: 'Juan Pérez', documento: '1001234567', telefono: '3101234567' },
  { id: '2', nombre: 'María Sánchez', documento: '1002345678', telefono: '3102345678' },
  { id: '3', nombre: 'Carlos Gómez', documento: '1003456789', telefono: '3103456789' },
  { id: '4', nombre: 'Ana López', documento: '1004567890', telefono: '3104567890' },
  { id: '5', nombre: 'Pedro Ruiz', documento: '1005678901', telefono: '3105678901' },
];

// Sample Houses/Projects
export const viviendas: Vivienda[] = [
  { id: '1', codigo: 'VIV-001', direccion: 'Calle 10 #5-20, Barrio Centro', beneficiario: beneficiarios[0], contratista: contratistas[0], estado: 'EN_EJECUCION', fechaInicio: '2024-01-15', fechaFin: null, presupuesto: 25000000, totalGirado: 15000000, avance: 60 },
  { id: '2', codigo: 'VIV-002', direccion: 'Carrera 8 #12-45, Barrio Norte', beneficiario: beneficiarios[1], contratista: contratistas[1], estado: 'TERMINADO', fechaInicio: '2023-10-01', fechaFin: '2024-02-28', presupuesto: 30000000, totalGirado: 30000000, avance: 100 },
  { id: '3', codigo: 'VIV-003', direccion: 'Calle 15 #20-30, Barrio Sur', beneficiario: beneficiarios[2], contratista: contratistas[2], estado: 'EN_EJECUCION', fechaInicio: '2024-02-01', fechaFin: null, presupuesto: 22000000, totalGirado: 8000000, avance: 35 },
  { id: '4', codigo: 'VIV-004', direccion: 'Carrera 3 #8-15, Barrio Oriente', beneficiario: beneficiarios[3], contratista: contratistas[0], estado: 'PENDIENTE', fechaInicio: '2024-04-01', fechaFin: null, presupuesto: 28000000, totalGirado: 0, avance: 0 },
  { id: '5', codigo: 'VIV-005', direccion: 'Calle 22 #15-60, Barrio Occidente', beneficiario: beneficiarios[4], contratista: contratistas[4], estado: 'EN_EJECUCION', fechaInicio: '2024-01-20', fechaFin: null, presupuesto: 35000000, totalGirado: 28000000, avance: 80 },
  { id: '6', codigo: 'VIV-006', direccion: 'Carrera 12 #5-30, Barrio Central', beneficiario: beneficiarios[0], contratista: contratistas[2], estado: 'TERMINADO', fechaInicio: '2023-08-15', fechaFin: '2024-01-10', presupuesto: 20000000, totalGirado: 20000000, avance: 100 },
  { id: '7', codigo: 'VIV-007', direccion: 'Calle 5 #25-40, Barrio Nuevo', beneficiario: beneficiarios[1], contratista: contratistas[4], estado: 'EN_EJECUCION', fechaInicio: '2024-03-01', fechaFin: null, presupuesto: 32000000, totalGirado: 12000000, avance: 45 },
  { id: '8', codigo: 'VIV-008', direccion: 'Carrera 18 #10-25, Barrio Popular', beneficiario: beneficiarios[2], contratista: contratistas[0], estado: 'SUSPENDIDO', fechaInicio: '2024-01-10', fechaFin: null, presupuesto: 26000000, totalGirado: 10000000, avance: 25 },
];

// Sample Disbursements
export const giros: Giro[] = [
  { id: '1', contratistaId: '1', contratistaNombre: 'Construcciones López S.A.S', proyectoId: '1', proyectoCodigo: 'VIV-001', fecha: '2024-01-20', concepto: 'Anticipo de obra', valor: 7500000, medio: 'TRANSFERENCIA', estado: 'PROCESADO' },
  { id: '2', contratistaId: '1', contratistaNombre: 'Construcciones López S.A.S', proyectoId: '1', proyectoCodigo: 'VIV-001', fecha: '2024-02-15', concepto: 'Segundo desembolso', valor: 7500000, medio: 'TRANSFERENCIA', estado: 'PROCESADO' },
  { id: '3', contratistaId: '2', contratistaNombre: 'Obras Civiles del Norte', proyectoId: '2', proyectoCodigo: 'VIV-002', fecha: '2023-10-10', concepto: 'Anticipo', valor: 15000000, medio: 'CHEQUE', estado: 'PROCESADO' },
  { id: '4', contratistaId: '2', contratistaNombre: 'Obras Civiles del Norte', proyectoId: '2', proyectoCodigo: 'VIV-002', fecha: '2024-01-05', concepto: 'Pago final', valor: 15000000, medio: 'TRANSFERENCIA', estado: 'PROCESADO' },
  { id: '5', contratistaId: '3', contratistaNombre: 'Mejoras y Acabados Ltda', proyectoId: '3', proyectoCodigo: 'VIV-003', fecha: '2024-02-10', concepto: 'Anticipo', valor: 8000000, medio: 'TRANSFERENCIA', estado: 'PROCESADO' },
  { id: '6', contratistaId: '5', contratistaNombre: 'Soluciones Habitacionales', proyectoId: '5', proyectoCodigo: 'VIV-005', fecha: '2024-01-25', concepto: 'Primer pago', valor: 14000000, medio: 'TRANSFERENCIA', estado: 'PROCESADO' },
  { id: '7', contratistaId: '5', contratistaNombre: 'Soluciones Habitacionales', proyectoId: '5', proyectoCodigo: 'VIV-005', fecha: '2024-03-01', concepto: 'Segundo pago', valor: 14000000, medio: 'TRANSFERENCIA', estado: 'PROCESADO' },
  { id: '8', contratistaId: '1', contratistaNombre: 'Construcciones López S.A.S', proyectoId: '8', proyectoCodigo: 'VIV-008', fecha: '2024-01-15', concepto: 'Anticipo', valor: 10000000, medio: 'TRANSFERENCIA', estado: 'PROCESADO' },
];

// Sample Inventory Items
export const inventarioItems: InventarioItem[] = [
  { id: '1', sku: 'CEM-001', descripcion: 'Cemento Portland 50kg', unidad: 'BULTO', costo: 32000, cantidad: 150, minimo: 50 },
  { id: '2', sku: 'LAD-001', descripcion: 'Ladrillo común', unidad: 'UNIDAD', costo: 800, cantidad: 5000, minimo: 1000 },
  { id: '3', sku: 'VAR-001', descripcion: 'Varilla 1/2" x 6m', unidad: 'UNIDAD', costo: 28000, cantidad: 200, minimo: 100 },
  { id: '4', sku: 'ARE-001', descripcion: 'Arena de río m³', unidad: 'M3', costo: 85000, cantidad: 30, minimo: 10 },
  { id: '5', sku: 'GRA-001', descripcion: 'Grava m³', unidad: 'M3', costo: 95000, cantidad: 25, minimo: 10 },
  { id: '6', sku: 'TEJ-001', descripcion: 'Teja de barro', unidad: 'UNIDAD', costo: 3500, cantidad: 800, minimo: 200 },
  { id: '7', sku: 'PIN-001', descripcion: 'Pintura blanca galón', unidad: 'GALON', costo: 65000, cantidad: 45, minimo: 20 },
  { id: '8', sku: 'TUB-001', descripcion: 'Tubo PVC 4" x 6m', unidad: 'UNIDAD', costo: 42000, cantidad: 60, minimo: 30 },
];

// Sample Inventory Movements
export const inventarioMovs: InventarioMov[] = [
  { id: '1', fecha: '2024-03-01', tipo: 'ENTRADA', proyectoId: null, contratistaId: null, sku: 'CEM-001', descripcion: 'Cemento Portland 50kg', cantidad: 100, costoUnit: 32000 },
  { id: '2', fecha: '2024-03-05', tipo: 'SALIDA', proyectoId: '1', contratistaId: '1', sku: 'CEM-001', descripcion: 'Cemento Portland 50kg', cantidad: 30, costoUnit: 32000 },
  { id: '3', fecha: '2024-03-08', tipo: 'SALIDA', proyectoId: '3', contratistaId: '3', sku: 'LAD-001', descripcion: 'Ladrillo común', cantidad: 500, costoUnit: 800 },
  { id: '4', fecha: '2024-03-10', tipo: 'ENTRADA', proyectoId: null, contratistaId: null, sku: 'VAR-001', descripcion: 'Varilla 1/2" x 6m', cantidad: 50, costoUnit: 28000 },
  { id: '5', fecha: '2024-03-12', tipo: 'SALIDA', proyectoId: '5', contratistaId: '5', sku: 'PIN-001', descripcion: 'Pintura blanca galón', cantidad: 10, costoUnit: 65000 },
];

// Sample Cash Movements
export const cajaMovs: CajaMov[] = [
  { id: '1', fecha: '2024-03-01', tipo: 'INGRESO', concepto: 'Transferencia Alcaldía - Proyecto VIV-001', proyectoId: '1', contratistaId: null, valor: 25000000, medio: 'TRANSFERENCIA', observaciones: 'Desembolso inicial proyecto' },
  { id: '2', fecha: '2024-03-05', tipo: 'EGRESO', concepto: 'Pago contratista López', proyectoId: '1', contratistaId: '1', valor: 7500000, medio: 'TRANSFERENCIA', observaciones: 'Anticipo de obra' },
  { id: '3', fecha: '2024-03-08', tipo: 'INGRESO', concepto: 'Transferencia Alcaldía - Proyecto VIV-003', proyectoId: '3', contratistaId: null, valor: 22000000, medio: 'TRANSFERENCIA', observaciones: 'Desembolso inicial proyecto' },
  { id: '4', fecha: '2024-03-10', tipo: 'EGRESO', concepto: 'Compra materiales', proyectoId: null, contratistaId: null, valor: 5000000, medio: 'CHEQUE', observaciones: 'Compra cemento y varillas' },
  { id: '5', fecha: '2024-03-12', tipo: 'EGRESO', concepto: 'Pago contratista Mejoras', proyectoId: '3', contratistaId: '3', valor: 8000000, medio: 'TRANSFERENCIA', observaciones: 'Primer desembolso' },
  { id: '6', fecha: '2024-03-15', tipo: 'INGRESO', concepto: 'Transferencia Alcaldía - Proyecto VIV-005', proyectoId: '5', contratistaId: null, valor: 35000000, medio: 'TRANSFERENCIA', observaciones: 'Desembolso inicial proyecto' },
];

// Helper functions for statistics
export const getProjectStats = () => {
  const total = viviendas.length;
  const activos = viviendas.filter(v => v.estado === 'EN_EJECUCION').length;
  const terminados = viviendas.filter(v => v.estado === 'TERMINADO').length;
  const pendientes = viviendas.filter(v => v.estado === 'PENDIENTE').length;
  const suspendidos = viviendas.filter(v => v.estado === 'SUSPENDIDO').length;
  
  return { total, activos, terminados, pendientes, suspendidos };
};

export const getTotalGirado = () => {
  return giros.filter(g => g.estado === 'PROCESADO').reduce((sum, g) => sum + g.valor, 0);
};

export const getInventarioValor = () => {
  return inventarioItems.reduce((sum, item) => sum + (item.cantidad * item.costo), 0);
};

export const getSaldoCaja = () => {
  const ingresos = cajaMovs.filter(m => m.tipo === 'INGRESO').reduce((sum, m) => sum + m.valor, 0);
  const egresos = cajaMovs.filter(m => m.tipo === 'EGRESO').reduce((sum, m) => sum + m.valor, 0);
  return ingresos - egresos;
};

export const getGirosPorMes = () => {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  return meses.map((mes, index) => ({
    mes,
    valor: Math.floor(Math.random() * 50000000) + 20000000,
  }));
};

export const getProyectosPorEstado = () => {
  const stats = getProjectStats();
  return [
    { name: 'En Ejecución', value: stats.activos, color: 'hsl(var(--primary))' },
    { name: 'Terminados', value: stats.terminados, color: 'hsl(var(--success))' },
    { name: 'Pendientes', value: stats.pendientes, color: 'hsl(var(--warning))' },
    { name: 'Suspendidos', value: stats.suspendidos, color: 'hsl(var(--destructive))' },
  ];
};
