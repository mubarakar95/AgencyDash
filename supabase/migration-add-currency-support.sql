-- Add currency support to invoices
alter table invoices add column if not exists currency text default 'INR';
alter table invoices add column if not exists exchange_rate numeric default 1;

-- Add currency support to transactions
alter table transactions add column if not exists currency text default 'INR';
alter table transactions add column if not exists original_amount numeric;

-- Add default exchange rate to agency settings
alter table agency_settings add column if not exists default_exchange_rate numeric default 83;
