-- Add discount and redeemed_amount support to invoices
alter table invoices add column if not exists discount numeric(10,2) default 0;
alter table invoices add column if not exists redeemed_amount numeric(10,2) default 0;
