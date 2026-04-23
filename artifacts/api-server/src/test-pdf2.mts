import { generatePlanPdf } from "./lib/planPdf.js";
import { db, writtenPlansTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import fs from "fs";
const [plan] = await db.select().from(writtenPlansTable).where(eq(writtenPlansTable.id, 4)).limit(1);
const buf = await generatePlanPdf(plan);
fs.writeFileSync("/tmp/pdfcheck/ai-out.pdf", buf);
console.log("Wrote", buf.length, "bytes,", plan.planNumber);
process.exit(0);
