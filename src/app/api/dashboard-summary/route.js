
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";

export async function GET() {
  try {
    const { error } = await requireAuth(["admin", "staff"]);
    if (error) return error;

    const purchases = await query({
      query: `
        SELECT COALESCE(
          SUM(qty * COALESCE(NULLIF(billing_price, 0), actual_price, 0)),
          0
        ) AS total
        FROM purchase_orders
      `,
    });

    const sales = await query({
      query: `
        SELECT COALESCE(SUM(qty * COALESCE(rate, 0)), 0) AS total
        FROM sales_orders
      `,
    });

    const purchase = Number(purchases[0]?.total || 0);
    const sale = Number(sales[0]?.total || 0);

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
