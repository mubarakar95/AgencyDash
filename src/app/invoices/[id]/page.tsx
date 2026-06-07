"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Printer } from "lucide-react";

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function numberToWords(n: number, currency: "INR" | "USD"): string {
  if (n === 0) return "Zero";

  const convert = (num: number): string => {
    if (num === 0) return "";
    if (num < 20) return ONES[num];
    if (num < 100) return TENS[Math.floor(num / 10)] + (num % 10 ? " " + ONES[num % 10] : "");
    if (num < 1000) return ONES[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convert(num % 100) : "");
    if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "");
    if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convert(num % 100000) : "");
    return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convert(num % 10000000) : "");
  };

  const [whole, fraction] = n.toFixed(2).split(".");
  const wholeName = convert(parseInt(whole));
  const fractionNum = parseInt(fraction);

  if (currency === "USD") {
    let result = wholeName + " Dollars";
    if (fractionNum > 0) {
      result += " and " + convert(fractionNum) + " Cents";
    }
    return result + " only";
  }

  let result = wholeName + " Rupees";
  if (fractionNum > 0) {
    result += " and " + convert(fractionNum) + " Paise";
  }
  return result + " only";
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/invoices/${invoiceId}`).then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ])
      .then(([invoiceData, settingsData]) => {
        if (invoiceData.error) {
          setInvoice(null);
        } else {
          setInvoice(invoiceData);
        }
        setAgency(settingsData.error ? null : settingsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111111]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#111111]">
        <p className="text-gray-400 text-lg">Invoice not found</p>
      </div>
    );
  }

  const invoiceCurrency: "INR" | "USD" = invoice.currency || "INR";
  const exchangeRate = invoice.exchange_rate || 1;
  const lineItems = Array.isArray(invoice.line_items) ? invoice.line_items : [];
  const total = lineItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
  const discount = Number(invoice.discount || 0);
  const redeemedAmount = Number(invoice.redeemed_amount || 0);
  const netAmount = Math.max(total - discount - redeemedAmount, 0);

  const displaySymbol = invoiceCurrency === "INR" ? "₹" : "$";
  const displayTotal = total;
  const displayDiscount = discount;
  const displayRedeemed = redeemedAmount;
  const displayNet = netAmount;

  function printInvoice() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-[#111111]">
      <div className="max-w-3xl mx-auto p-6 print:p-0">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <a href="/clients" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={printInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.15)]"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl print:shadow-none print:rounded-none print:mx-auto print:max-w-3xl">
          <div className="p-10 print:p-12">
            <div className="flex justify-between items-start mb-10 print:mb-12">
              <div>
                <Image
                  src="/logo/logoblack-v2.png"
                  alt="AgencyDash"
                  width={160}
                  height={44}
                  className="shrink-0"
                />
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">INVOICE</h1>
                <p className="text-base text-gray-500 mt-1">{invoice.invoice_number}</p>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-6 mb-10 print:mb-12">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Issued</p>
                  <p className="text-sm text-gray-900">
                    {invoice.issued_date
                      ? new Date(invoice.issued_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
                {invoice.due_date && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Due</p>
                    <p className="text-sm text-gray-900">
                      {new Date(invoice.due_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-10 print:mb-12">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bill From</p>
                <p className="text-sm font-medium text-gray-900">
                  {agency?.agency_name || "AgencyDash"}
                </p>
                {agency?.agency_address && (
                  <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{agency.agency_address}</p>
                )}
                {agency?.agency_contact && (
                  <p className="text-sm text-gray-500 mt-1">{agency.agency_contact}</p>
                )}
                {agency?.agency_email && (
                  <p className="text-sm text-gray-500">{agency.agency_email}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bill To</p>
                <p className="text-sm font-medium text-gray-900">{invoice.clients?.name || "—"}</p>
                {invoice.clients?.company && (
                  <p className="text-sm text-gray-600">{invoice.clients.company}</p>
                )}
                {invoice.clients?.address && (
                  <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{invoice.clients.address}</p>
                )}
                {invoice.clients?.email && (
                  <p className="text-sm text-gray-500 mt-1">{invoice.clients.email}</p>
                )}
              </div>
            </div>

            <table className="w-full text-left border-collapse mb-8">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Qty</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Rate</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 text-sm text-gray-900">{item.description || "—"}</td>
                    <td className="py-4 text-sm text-gray-600 text-right">{item.quantity}</td>
                    <td className="py-4 text-sm text-gray-600 text-right">{displaySymbol}{(Number(item.rate)).toFixed(2)}</td>
                    <td className="py-4 text-sm font-medium text-gray-900 text-right">{displaySymbol}{(Number(item.amount)).toFixed(2)}</td>
                  </tr>
                ))}
                {lineItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-gray-400">No line items</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-end mb-10 print:mb-8">
              <div className="text-sm text-gray-600 italic max-w-xs leading-relaxed">
                <div>
                  <p>{numberToWords(displayNet, invoiceCurrency)}</p>
                </div>
              </div>
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm text-gray-900">{displaySymbol}{displayTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-sm text-gray-500">Discount</span>
                    <span className="text-sm text-red-500">-{displaySymbol}{displayDiscount.toFixed(2)}</span>
                  </div>
                )}
                {redeemedAmount > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-sm text-gray-500">Redeemed</span>
                    <span className="text-sm text-green-600">-{displaySymbol}{displayRedeemed.toFixed(2)}</span>
                  </div>
                )}
                {lineItems.length > 0 && (
                  <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-1">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-base font-bold text-gray-900">{displaySymbol}{displayNet.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex items-start justify-between">
              <div className="text-sm text-gray-500 italic">
                Thank you for your business!
              </div>
              {invoice.notes && (
                <div className="text-right max-w-xs">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
