-- Epic 8: Add IUC and e-Fatura events
-- Run this AFTER 0022a_add_profile_columns.sql (in a separate transaction)

-- Add IUC (Imposto Único de Circulação) car tax event
INSERT INTO public.tax_calendar (event_name, event_name_pt, event_type, base_month, base_day, description, description_pt, applies_to, reminder_days_before, action_url, tips, tips_pt) VALUES
('IUC Car Tax Reminder', 'Lembrete IUC Automóvel', 'payment', 1, 15,
 'Annual car tax (IUC) is due on the anniversary of your vehicle registration. Check your registration date and pay before the deadline.',
 'O Imposto Único de Circulação (IUC) é devido no aniversário da matrícula do veículo. Verifique a data de matrícula e pague antes do prazo.',
 'car_owners', ARRAY[30, 14, 7, 0],
 'https://www.portaldasfinancas.gov.pt/at/html/index.html',
 'IUC is due on the month of your car registration anniversary. You can check and pay on Portal das Finanças. Penalty for late payment is 10% plus interest.',
 'O IUC é devido no mês do aniversário da matrícula. Pode verificar e pagar no Portal das Finanças. A multa por atraso é 10% mais juros.')
ON CONFLICT DO NOTHING;

-- Add e-Fatura validation deadline (February 25)
INSERT INTO public.tax_calendar (event_name, event_name_pt, event_type, base_month, base_day, description, description_pt, applies_to, reminder_days_before, action_url, tips, tips_pt) VALUES
('e-Fatura Validation Deadline', 'Prazo Validação e-Fatura', 'deadline', 2, 25,
 'Deadline to validate and categorize your invoices in e-Fatura for maximum tax deductions.',
 'Prazo para validar e categorizar as suas faturas no e-Fatura para máximo de deduções fiscais.',
 'all', ARRAY[30, 14, 7, 3, 0],
 'https://faturas.portaldasfinancas.gov.pt/',
 'Log in to e-Fatura and review all pending invoices. Make sure health, education, and housing expenses are correctly categorized.',
 'Entre no e-Fatura e reveja todas as faturas pendentes. Certifique-se que despesas de saúde, educação e habitação estão corretamente categorizadas.')
ON CONFLICT DO NOTHING;
