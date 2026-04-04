import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/hooks/use-invoices";
import type { Profile } from "@/hooks/use-profile";

const S = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111",
    backgroundColor: "#fff",
  },
  // ── Header ──────────────────────────────────────────────────────────────────
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 36 },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#4C1D95" },
  companyBlock: { marginTop: 4 },
  companyName: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  muted: { color: "#6B7280", marginTop: 2 },
  // ── Invoice meta ────────────────────────────────────────────────────────────
  metaBlock: { alignItems: "flex-end" },
  invoiceTitle: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#4C1D95" },
  ref: { fontSize: 10, color: "#6B7280", marginTop: 4 },
  // ── Divider ─────────────────────────────────────────────────────────────────
  divider: { height: 1, backgroundColor: "#E5E7EB", marginBottom: 24 },
  // ── Client block ────────────────────────────────────────────────────────────
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  sectionValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  sectionSub: { color: "#6B7280", marginTop: 2 },
  // ── Table ───────────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    padding: "6 8",
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    padding: "8 8",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    borderBottomStyle: "solid",
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colUnit: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  th: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6B7280", textTransform: "uppercase" },
  td: { fontSize: 9 },
  // ── Totals ──────────────────────────────────────────────────────────────────
  totalsBlock: { alignItems: "flex-end", marginTop: 16 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, marginBottom: 4 },
  totalLabel: { color: "#6B7280", fontSize: 9 },
  totalValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    backgroundColor: "#4C1D95",
    borderRadius: 4,
    padding: "6 8",
    marginTop: 6,
  },
  grandTotalLabel: { color: "#fff", fontSize: 10, fontFamily: "Helvetica-Bold" },
  grandTotalValue: { color: "#fff", fontSize: 10, fontFamily: "Helvetica-Bold" },
  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: { marginTop: 48, borderTopWidth: 1, borderTopColor: "#E5E7EB", borderTopStyle: "solid", paddingTop: 12 },
  footerText: { color: "#9CA3AF", fontSize: 8, textAlign: "center" },
  // ── Status badge ────────────────────────────────────────────────────────────
  statusBadge: { borderRadius: 4, padding: "2 6", alignSelf: "flex-start", marginTop: 6 },
  statusText: { fontSize: 8, fontFamily: "Helvetica-Bold" },
});

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "En attente": { bg: "#FEF3C7", color: "#92400E" },
  "Payée":      { bg: "#D1FAE5", color: "#065F46" },
  "En retard":  { bg: "#FEE2E2", color: "#991B1B" },
  "Annulée":    { bg: "#F3F4F6", color: "#6B7280" },
};

interface Props {
  invoice: Invoice & { clientId?: string };
  profile: Profile | null;
}

export function InvoiceDocument({ invoice, profile }: Props) {
  const statusStyle = STATUS_COLORS[invoice.status] ?? STATUS_COLORS["En attente"];
  const companyName = profile?.companyName || "Mon Entreprise";
  const issuerLines = [
    profile?.address,
    profile?.phone,
    profile?.email,
    profile?.rccm ? `RCCM : ${profile.rccm}` : null,
    profile?.taxId ? `N° Contribuable : ${profile.taxId}` : null,
  ].filter(Boolean) as string[];

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.brand}>Cockpit</Text>
            <View style={S.companyBlock}>
              <Text style={S.companyName}>{companyName}</Text>
              {issuerLines.map((line, i) => (
                <Text key={i} style={S.muted}>{line}</Text>
              ))}
            </View>
          </View>
          <View style={S.metaBlock}>
            <Text style={S.invoiceTitle}>FACTURE</Text>
            <Text style={S.ref}>{invoice.ref}</Text>
            <Text style={S.muted}>Échéance : {invoice.date}</Text>
            <View style={[S.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[S.statusText, { color: statusStyle.color }]}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        <View style={S.divider} />

        {/* Client */}
        <View style={S.section}>
          <Text style={S.sectionLabel}>Facturé à</Text>
          <Text style={S.sectionValue}>{invoice.client || "—"}</Text>
        </View>

        {/* Table */}
        <View style={S.tableHeader}>
          <Text style={[S.th, S.colDesc]}>Description</Text>
          <Text style={[S.th, S.colQty]}>Qté</Text>
          <Text style={[S.th, S.colUnit]}>Prix unitaire</Text>
          <Text style={[S.th, S.colTotal]}>Total HT</Text>
        </View>

        <View style={S.tableRow}>
          <Text style={[S.td, S.colDesc]}>{invoice.desc || "Prestation de services"}</Text>
          <Text style={[S.td, S.colQty]}>1</Text>
          <Text style={[S.td, S.colUnit]}>{formatFCFA(invoice.amount)}</Text>
          <Text style={[S.td, S.colTotal]}>{formatFCFA(invoice.amount)}</Text>
        </View>

        {/* Totals */}
        <View style={S.totalsBlock}>
          <View style={S.totalRow}>
            <Text style={S.totalLabel}>Sous-total HT</Text>
            <Text style={S.totalValue}>{formatFCFA(invoice.amount)}</Text>
          </View>
          <View style={S.totalRow}>
            <Text style={S.totalLabel}>TVA (0%)</Text>
            <Text style={S.totalValue}>0 FCFA</Text>
          </View>
          <View style={S.grandTotalRow}>
            <Text style={S.grandTotalLabel}>Total TTC</Text>
            <Text style={S.grandTotalValue}>{formatFCFA(invoice.amount)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer}>
          <Text style={S.footerText}>
            {companyName}
            {profile?.website ? `  ·  ${profile.website}` : ""}
            {profile?.email ? `  ·  ${profile.email}` : ""}
          </Text>
          <Text style={[S.footerText, { marginTop: 4 }]}>
            Document généré par Cockpit — {new Date().toLocaleDateString("fr-FR")}
          </Text>
        </View>

      </Page>
    </Document>
  );
}
