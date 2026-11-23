
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";

export async function GET() {
  try {
    const { error } = await requireAuth(["admin", "staff"]);
    if (error) return error;

    const summary = await query({
      query: `
        SELECT
          (
            SELECT COALESCE(
              SUM(qty * COALESCE(NULLIF(billing_price, 0), actual_price, 0)),
              0
            )
            FROM purchase_orders
          ) AS purchase,
          (
            SELECT COALESCE(SUM(qty * COALESCE(rate, 0)), 0)
            FROM sales_orders
          ) AS sale
      `,
    });

    const purchase = Number(summary[0]?.purchase || 0);
    const sale = Number(summary[0]?.sale || 0);

    return NextResponse.json(
      {
        purchase,
        sale,
        profit: sale - purchase,
      },
      {
        headers: { "Cache-Control": "private, no-store" },
      }
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard summary" },
      { status: 500 }
    );
  }
}
