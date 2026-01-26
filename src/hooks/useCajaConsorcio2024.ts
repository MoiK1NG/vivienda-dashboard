import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CajaConsorcio2024Row {
  registro_id: string;
  fecha: string | null;
  concepto: string | null;
  valor: string;
  valor_num: number | null;
  tipo_gasto: string | null;
  subgasto: string | null;
  negocio: string | null;
  observaciones: string | null;
  pagado_a: string | null;
  doc_identidad: string | null;
  factura: string | null;
  retencion: string | null;
  tercer_destino_giro: string | null;
  updated_at: string | null;
}

export function useCajaConsorcio2024() {
  return useQuery({
    queryKey: ["caja_consorcio_2024"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("caja_consorcio_2024")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) throw error;
      return data as CajaConsorcio2024Row[];
    },
  });
}

export function getCaja2024Stats(data: CajaConsorcio2024Row[]) {
  const total = data.reduce((sum, row) => sum + (row.valor_num || 0), 0);
  return { total, count: data.length };
}
