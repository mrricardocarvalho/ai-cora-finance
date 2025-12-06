-- Epic 8 Story 8.1: Portuguese Tax Calendar System
-- Creates tax_calendar table and adds tax-relevant fields to profiles

-- Add tax-relevant flags to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_property_owner boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_self_employed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_investor boolean DEFAULT true; -- Default true since most users will have investments

-- Create enum for tax event types
DO $$ BEGIN
  CREATE TYPE tax_event_type AS ENUM ('deadline', 'payment', 'info');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create enum for applies_to categories
DO $$ BEGIN
  CREATE TYPE tax_applies_to AS ENUM ('all', 'property_owners', 'investors', 'self_employed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AC #1: Tax Calendar Data Model
CREATE TABLE IF NOT EXISTS public.tax_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_name_pt text NOT NULL, -- Portuguese translation
  event_type tax_event_type NOT NULL DEFAULT 'info',
  base_month integer NOT NULL CHECK (base_month BETWEEN 1 AND 12),
  base_day integer NOT NULL CHECK (base_day BETWEEN 1 AND 31),
  description text NOT NULL,
  description_pt text NOT NULL, -- Portuguese translation
  applies_to tax_applies_to NOT NULL DEFAULT 'all',
  reminder_days_before integer[] DEFAULT ARRAY[30, 14, 3, 0],
  action_url text, -- Link to Portal das Finanças or relevant resource
  tips text, -- Additional tips in English
  tips_pt text, -- Additional tips in Portuguese
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create year-specific instances table for tracking user interactions
CREATE TABLE IF NOT EXISTS public.tax_calendar_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_event_id uuid REFERENCES public.tax_calendar(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  year integer NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'not_applicable', 'dismissed')),
  last_reminder_sent timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tax_event_id, user_id, year)
);

-- Enable RLS
ALTER TABLE public.tax_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_calendar_instances ENABLE ROW LEVEL SECURITY;

-- Tax calendar is public read (system data)
CREATE POLICY "Tax calendar: Public read" ON public.tax_calendar 
  FOR SELECT USING (true);

-- Tax calendar instances: users can manage their own
CREATE POLICY "Tax instances: Select own" ON public.tax_calendar_instances 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Tax instances: Insert own" ON public.tax_calendar_instances 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Tax instances: Update own" ON public.tax_calendar_instances 
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_tax_calendar_instances_user_year 
  ON public.tax_calendar_instances(user_id, year);

-- AC #2: Pre-populated Portuguese Tax Events
INSERT INTO public.tax_calendar (event_name, event_name_pt, event_type, base_month, base_day, description, description_pt, applies_to, reminder_days_before, action_url, tips, tips_pt) VALUES
-- January
('Household Composition Update Deadline', 'Prazo Atualização Agregado Familiar', 'deadline', 1, 31, 
 'Deadline to update your household composition in the Tax Authority portal for the current tax year.',
 'Prazo para atualizar o agregado familiar no Portal das Finanças para o ano fiscal atual.',
 'all', ARRAY[30, 14, 3, 0], 
 'https://www.portaldasfinancas.gov.pt/at/html/index.html',
 'Check if there were births, marriages, divorces, or deaths in your household this year.',
 'Verifique se houve nascimentos, casamentos, divórcios ou óbitos no seu agregado este ano.'),

-- February  
('IRS Withholding Tables Update', 'Atualização Tabelas Retenção IRS', 'info', 2, 15,
 'New IRS withholding tables take effect. Check if your employer has updated your tax withholding.',
 'Novas tabelas de retenção na fonte entram em vigor. Verifique se o empregador atualizou a sua retenção.',
 'all', ARRAY[7], 
 NULL,
 'Review your payslip to ensure the correct tax rate is being applied.',
 'Reveja o seu recibo de vencimento para garantir que a taxa correta está a ser aplicada.'),

-- March - IMI 1st installment
('IMI 1st Installment Due', 'IMI 1ª Prestação', 'payment', 3, 31,
 'First installment of annual property tax (IMI) due for properties valued over €500.',
 'Primeira prestação do Imposto Municipal sobre Imóveis (IMI) para imóveis com valor superior a 500€.',
 'property_owners', ARRAY[30, 14, 3, 0],
 'https://www.portaldasfinancas.gov.pt/at/html/index.html',
 'You can pay via ATM, home banking, or at tax office.',
 'Pode pagar via Multibanco, homebanking ou nas Finanças.'),

-- April - IRS Opens
('IRS Submission Period Opens', 'Início Entrega IRS', 'info', 4, 1,
 'IRS tax declaration submission period begins. You can now submit your annual tax return.',
 'Inicia o período de entrega da declaração de IRS. Já pode submeter a sua declaração anual.',
 'all', ARRAY[7],
 'https://irs.portaldasfinancas.gov.pt/',
 'Early submission often means faster refunds. Make sure e-fatura expenses are validated.',
 'Entregar cedo geralmente significa reembolso mais rápido. Verifique se as despesas no e-fatura estão validadas.'),

-- May - IMI 2nd installment
('IMI 2nd Installment Due', 'IMI 2ª Prestação', 'payment', 5, 31,
 'Second installment of annual property tax (IMI) due if your total is between €100-€500.',
 'Segunda prestação do IMI se o total for entre 100€ e 500€.',
 'property_owners', ARRAY[14, 3, 0],
 'https://www.portaldasfinancas.gov.pt/at/html/index.html',
 NULL, NULL),

-- June - IRS Deadline
('IRS Submission Deadline', 'Prazo Entrega IRS', 'deadline', 6, 30,
 'Final deadline to submit your IRS tax declaration for the previous year.',
 'Prazo final para entregar a declaração de IRS do ano anterior.',
 'all', ARRAY[30, 14, 7, 3, 1, 0],
 'https://irs.portaldasfinancas.gov.pt/',
 'Have your NIF, access password, and all supporting documents ready.',
 'Tenha o NIF, senha de acesso e todos os documentos comprovativos prontos.'),

-- July - Typical refund date
('IRS Refund Expected', 'Reembolso IRS Esperado', 'info', 7, 31,
 'If you submitted on time and are owed a refund, it typically arrives by this date.',
 'Se entregou a tempo e tem direito a reembolso, normalmente chega até esta data.',
 'all', ARRAY[7],
 NULL,
 'Check your bank account and tax portal for refund status.',
 'Verifique a sua conta bancária e o Portal das Finanças para o estado do reembolso.'),

-- August - Payment deadline if owing
('IRS Payment Deadline', 'Prazo Pagamento IRS', 'payment', 8, 31,
 'If you owe tax, this is the deadline to pay without penalties.',
 'Se deve imposto, este é o prazo para pagar sem penalizações.',
 'all', ARRAY[30, 14, 3, 0],
 'https://www.portaldasfinancas.gov.pt/at/html/index.html',
 'You can pay via ATM, home banking, or set up installment payments.',
 'Pode pagar via Multibanco, homebanking ou pedir pagamento em prestações.'),

-- September - IMI 3rd installment  
('IMI 3rd Installment Due', 'IMI 3ª Prestação', 'payment', 9, 30,
 'Third installment of annual property tax (IMI) due if your total exceeds €500.',
 'Terceira prestação do IMI se o total exceder 500€.',
 'property_owners', ARRAY[14, 3, 0],
 'https://www.portaldasfinancas.gov.pt/at/html/index.html',
 NULL, NULL),

-- November - IMI single payment
('IMI Single Payment Due', 'IMI Pagamento Único', 'payment', 11, 30,
 'If your IMI is less than €100, the full amount is due in a single payment.',
 'Se o seu IMI for inferior a 100€, o valor total é devido num único pagamento.',
 'property_owners', ARRAY[30, 14, 3, 0],
 'https://www.portaldasfinancas.gov.pt/at/html/index.html',
 NULL, NULL),

-- December - Year-end tax planning
('Last Day for Tax-Deductible Expenses', 'Último Dia Despesas Dedutíveis', 'deadline', 12, 31,
 'Last day to make tax-deductible purchases (health, education, etc.) for the current tax year.',
 'Último dia para fazer compras dedutíveis no IRS (saúde, educação, etc.) para o ano fiscal atual.',
 'all', ARRAY[30, 14, 7, 3],
 NULL,
 'Review your e-fatura to see if you''ve maximized deductions. Consider scheduling medical appointments or buying educational materials.',
 'Reveja o e-fatura para ver se maximizou as deduções. Considere marcar consultas médicas ou comprar material educativo.'),

-- Investment-specific: Capital gains consideration
('Capital Gains Tax Year End', 'Fim Ano Fiscal Mais-Valias', 'info', 12, 31,
 'Last day to realize capital gains or losses for this tax year. Consider tax-loss harvesting.',
 'Último dia para realizar mais-valias ou menos-valias deste ano fiscal. Considere compensação de perdas.',
 'investors', ARRAY[30, 14, 7],
 NULL,
 'Review your portfolio for tax-loss harvesting opportunities before year end.',
 'Reveja o seu portfólio para oportunidades de compensação fiscal antes do fim do ano.');

-- Create index for active events
CREATE INDEX IF NOT EXISTS idx_tax_calendar_active ON public.tax_calendar(is_active) WHERE is_active = true;
