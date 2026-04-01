import { Router, type IRouter } from "express";
import { db, marketplaceProductsTable, marketplaceVendorsTable, marketplaceOrdersTable, marketplacePayoutsTable, partnersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

// ─── Public Routes ─────────────────────────────────────────────────────────────

// GET /marketplace/vendors - List all approved vendors
router.get("/vendors", async (_req, res) => {
  try {
    const vendors = await db.select().from(marketplaceVendorsTable).where(eq(marketplaceVendorsTable.status, "approved"));
    res.json({ vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

// GET /marketplace/products - List all active products, optionally filtered by vendor or category
router.get("/products", async (req, res) => {
  try {
    let query = db.select({
      id: marketplaceProductsTable.id,
      vendorId: marketplaceProductsTable.vendorId,
      title: marketplaceProductsTable.title,
      description: marketplaceProductsTable.description,
      category: marketplaceProductsTable.category,
      price: marketplaceProductsTable.price,
      commissionRate: marketplaceProductsTable.commissionRate,
      createdAt: marketplaceProductsTable.createdAt,
    }).from(marketplaceProductsTable)
      .where(eq(marketplaceProductsTable.status, "active"));

    const { vendorId, category } = req.query;
    
    if (vendorId) {
      const vendorIdNum = parseInt(vendorId as string);
      if (!isNaN(vendorIdNum)) {
        query = query.where(eq(marketplaceProductsTable.vendorId, vendorIdNum));
      }
    }
    if (category) {
      query = query.where(eq(marketplaceProductsTable.category, category as string));
    }

    const products = await query;
    res.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ─── Partner Routes ─────────────────────────────────────────────────────────────

// POST /marketplace/orders - Create a marketplace order (partner records a sale)
router.post("/orders", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { productId, amount, notes } = req.body;
    const partnerId = req.userId;

    if (!productId || !amount) {
      res.status(400).json({ error: "Missing required fields: productId, amount" });
      return;
    }

    // Get product details to find vendor and commission rate
    const product = await db.select().from(marketplaceProductsTable).where(eq(marketplaceProductsTable.id, productId)).limit(1);
    if (!product.length) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const vendorId = product[0].vendorId;
    const commissionRate = parseFloat(product[0].commissionRate);
    const amountNum = parseFloat(amount);
    const commissionAmount = amountNum * (commissionRate / 100);

    // Insert order
    const result = await db.insert(marketplaceOrdersTable).values({
      partnerId: partnerId!,
      productId,
      vendorId,
      amount: amountNum.toString(),
      commissionAmount: commissionAmount.toString(),
      notes,
    }).returning();

    res.status(201).json({ order: result[0] });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET /partner/marketplace/orders - Get all orders for authenticated partner with commission summary
router.get("/partner/orders", requireAuth, async (req: AuthRequest, res) => {
  try {
    const partnerId = req.userId;

    // Get all orders for this partner
    const orders = await db.select({
      id: marketplaceOrdersTable.id,
      productId: marketplaceOrdersTable.productId,
      vendorId: marketplaceOrdersTable.vendorId,
      status: marketplaceOrdersTable.status,
      amount: marketplaceOrdersTable.amount,
      commissionAmount: marketplaceOrdersTable.commissionAmount,
      notes: marketplaceOrdersTable.notes,
      createdAt: marketplaceOrdersTable.createdAt,
      productTitle: marketplaceProductsTable.title,
      vendorName: marketplaceVendorsTable.name,
    }).from(marketplaceOrdersTable)
      .innerJoin(marketplaceProductsTable, eq(marketplaceOrdersTable.productId, marketplaceProductsTable.id))
      .innerJoin(marketplaceVendorsTable, eq(marketplaceOrdersTable.vendorId, marketplaceVendorsTable.id))
      .where(eq(marketplaceOrdersTable.partnerId, partnerId!))
      .orderBy(desc(marketplaceOrdersTable.createdAt));

    // Calculate total commissions
    const totalCommissions = orders.reduce((sum, order) => sum + parseFloat(order.commissionAmount), 0);

    res.json({
      orders,
      summary: {
        totalOrders: orders.length,
        totalCommissions: totalCommissions.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /admin/marketplace/vendors - List all vendors (admin)
router.get("/admin/vendors", requireAuth, async (req: AuthRequest, res) => {
  try {
    // Check if user is main site admin by looking at partners table
    const partner = await db.select().from(partnersTable).where(eq(partnersTable.id, req.userId!)).limit(1);
    if (!partner.length || !partner[0].isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const vendors = await db.select().from(marketplaceVendorsTable).orderBy(desc(marketplaceVendorsTable.createdAt));
    res.json({ vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

// POST /admin/marketplace/vendors - Create vendor (admin only)
router.post("/admin/vendors", requireAuth, async (req: AuthRequest, res) => {
  try {
    const partner = await db.select().from(partnersTable).where(eq(partnersTable.id, req.userId!)).limit(1);
    if (!partner.length || !partner[0].isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { name, description, contactEmail, website, commissionPercent, status } = req.body;
    if (!name || !contactEmail) {
      res.status(400).json({ error: "Missing required fields: name, contactEmail" });
      return;
    }

    const result = await db.insert(marketplaceVendorsTable).values({
      name,
      description,
      contactEmail,
      website,
      commissionPercent: commissionPercent || "15.00",
      status: status || "pending",
    }).returning();

    res.status(201).json({ vendor: result[0] });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(500).json({ error: "Failed to create vendor" });
  }
});

// POST /admin/marketplace/products - Create product (admin only)
router.post("/admin/products", requireAuth, async (req: AuthRequest, res) => {
  try {
    const partner = await db.select().from(partnersTable).where(eq(partnersTable.id, req.userId!)).limit(1);
    if (!partner.length || !partner[0].isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { vendorId, title, description, category, price, commissionRate, status } = req.body;
    if (!vendorId || !title || !description || !category) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const result = await db.insert(marketplaceProductsTable).values({
      vendorId,
      title,
      description,
      category,
      price: price ? price.toString() : null,
      commissionRate: commissionRate || "15.00",
      status: status || "draft",
    }).returning();

    res.status(201).json({ product: result[0] });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

export default router;
