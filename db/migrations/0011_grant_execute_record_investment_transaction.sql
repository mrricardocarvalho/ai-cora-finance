-- Grant execute on RPC to authenticated role
GRANT EXECUTE ON FUNCTION public.record_investment_transaction(uuid, uuid, text, text, numeric, numeric, numeric, timestamptz) TO authenticated;
