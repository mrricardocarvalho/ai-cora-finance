-- Ensure holdings quantity cannot be negative
ALTER TABLE public.holdings
  ADD CONSTRAINT holdings_quantity_non_negative CHECK (quantity >= 0);
