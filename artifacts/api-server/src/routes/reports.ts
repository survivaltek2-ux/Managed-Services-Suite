import { Router, type IRouter } from "express";
import { db, usersTable, ticketsTable, quotesTable, quoteProposalsTable, partnersTable, partnerDealsTable, partnerCommissionsTable, invoicesTable } from "@workspace/db";
import { eq, desc, sql, and, gte, count } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/admin/reports", requireAdmin, async (_req, res) => {
  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalUsersRes,
      totalTicketsRes,
      openTicketsRes,
      totalQuotesRes,
      totalProposalsRes,
      acceptedProposalsRes,
      ticketsByStatus,
      invoiceSummary,
      topPartners,
      recentProposals,
    ] = await Promise.all([
      db.select({ count: count() }).from(usersTable),
      db.select({ count: count() }).from(ticketsTable),
      db.select({ count: count() }).from(ticketsTable).where(eq(ticketsTable.status, "open")),
      db.select({ count: count() }).from(quotesTable),
      db.select({ count: count() }).from(quoteProposalsTable),
      db.select({ count: count() }).from(quoteProposalsTable).where(eq(quoteProposalsTable.status, "accepted")),
      db.select({ status: ticketsTable.status, count: count() }).from(ticketsTable).groupBy(ticketsTable.status),
      db.select({
        status: invoicesTable.status,
        total: sql<number>`COALESCE(SUM(${invoicesTable.total}::numeric), 0)`,
        count: count(),
      }).from(invoicesTable).groupBy(invoicesTable.status),
      db.select({
        id: partnersTable.id,
        company: partnersTable.companyName,
        tier: partnersTable.tier,
        totalRevenue: partnersTable.totalRevenue,
        ytdRevenue: partnersTable.ytdRevenue,
        totalDeals: partnersTable.totalDeals,
      }).from(partnersTable)
        .where(eq(partnersTable.status, "approved"))
        .orderBy(desc(partnersTable.totalRevenue))
        .limit(8),
      db.select({
        id: quoteProposalsTable.id,
        proposalNumber: quoteProposalsTable.proposalNumber,
        title: quoteProposalsTable.title,
        total: quoteProposalsTable.total,
        status: quoteProposalsTable.status,
        createdAt: quoteProposalsTable.createdAt,
      }).from(quoteProposalsTable).orderBy(desc(quoteProposalsTable.createdAt)).limit(5),
    ]);

    const totalRevenue = acceptedProposalsRes[0]?.count > 0
      ? await db.select({ total: sql<number>`COALESCE(SUM(${quoteProposalsTable.total}::numeric), 0)` })
          .from(quoteProposalsTable).where(eq(quoteProposalsTable.status, "accepted"))
      : [{ total: 0 }];

    const partnerTotalRevenue = await db.select({
      total: sql<number>`COALESCE(SUM(${partnersTable.totalRevenue}::numeric), 0)`,
    }).from(partnersTable).where(eq(partnersTable.status, "approved"));

    const invoicePaid = invoiceSummary.find(i => i.status === "paid");
    const invoiceOutstanding = invoiceSummary.filter(i => ["sent", "viewed", "overdue"].includes(i.status));
    const outstandingTotal = invoiceOutstanding.reduce((s, i) => s + Number(i.total), 0);

    const conversionRate = totalQuotesRes[0]?.count > 0
      ? Math.round((acceptedProposalsRes[0]?.count / totalQuotesRes[0]?.count) * 100)
      : 0;

    res.json({
      overview: {
        totalUsers: totalUsersRes[0]?.count || 0,
        totalTickets: totalTicketsRes[0]?.count || 0,
        openTickets: openTicketsRes[0]?.count || 0,
        totalQuotes: totalQuotesRes[0]?.count || 0,
        totalProposals: totalProposalsRes[0]?.count || 0,
        acceptedProposals: acceptedProposalsRes[0]?.count || 0,
        conversionRate,
        totalRevenue: Number(totalRevenue[0]?.total || 0),
        partnerTotalRevenue: Number(partnerTotalRevenue[0]?.total || 0),
        invoicePaid: Number(invoicePaid?.total || 0),
        invoicePaidCount: Number(invoicePaid?.count || 0),
        invoiceOutstanding: outstandingTotal,
      },
      ticketsByStatus,
      topPartners,
      recentProposals,
      invoiceSummary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to load reports" });
  }
});

export default router;
