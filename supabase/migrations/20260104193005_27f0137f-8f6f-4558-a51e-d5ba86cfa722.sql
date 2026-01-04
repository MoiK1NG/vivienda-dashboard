-- Crear política para permitir lectura pública de caja_consorcio
CREATE POLICY "Permitir lectura pública de caja_consorcio"
ON public.caja_consorcio
FOR SELECT
USING (true);