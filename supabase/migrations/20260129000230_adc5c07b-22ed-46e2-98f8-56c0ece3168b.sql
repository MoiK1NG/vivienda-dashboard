-- Enable RLS on caja_consorcio_2024 if not already enabled
ALTER TABLE public.caja_consorcio_2024 ENABLE ROW LEVEL SECURITY;

-- Create public read policy for caja_consorcio_2024
CREATE POLICY "Permitir lectura pública de caja_consorcio_2024" 
ON public.caja_consorcio_2024 
FOR SELECT 
USING (true);