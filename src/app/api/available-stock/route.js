import { query } from '@/lib/db';
import { connection, NextResponse } from 'next/server';

export async function GET() {
  try {
    await connection();
    const [purchases, sales] = await Promise.all([
      query({
        query: 'SELECT manufacturer_name, place, item_name, qty_unit, qty FROM purchase_orders'
      }),
      query({
        query: 'SELECT manufacturer_name, place, item_name, qty_unit, qty, status FROM sales_orders'
      }),
    ]);

    const stockMap = new Map();

    // Helper: Group key banane ke liye
    const getKey = (m, p, i, u) => 
      `${m || "Unknown"}::${p || "No Place"}::${i || "Unknown"}::${u || "KG"}`;

    // 1. Purchases add karo
    purchases.forEach(row => {
      const key = getKey(row.manufacturer_name, row.place, row.item_name, row.qty_unit);
      if (!stockMap.has(key)) {
        stockMap.set(key, {
          manufacturer: row.manufacturer_name || "Unknown",
          place: row.place || "",
          itemName: row.item_name || "Unknown",
          unit: row.qty_unit || "KG",
          purchasedQty: 0,
          soldQty: 0,
        });
      }
      stockMap.get(key).purchasedQty += Number(row.qty) || 0;
    });

    // 2. Sales minus karo
    sales.forEach(row => {
      // Agar sale cancel hai toh ignore karo (optional logic)
      if (row.status === "Cancelled") return; 

      const key = getKey(row.manufacturer_name, row.place, row.item_name, row.qty_unit);
      if (!stockMap.has(key)) {
        // Agar purchase nahi hui par sale hai (negative stock scenario)
        stockMap.set(key, {
          manufacturer: row.manufacturer_name || "Unknown",
          place: row.place || "",
          itemName: row.item_name || "Unknown",
          unit: row.qty_unit || "KG",
          purchasedQty: 0,
          soldQty: 0,
        });
      }
      stockMap.get(key).soldQty += Number(row.qty) || 0;
    });

    // 3. Final array banao with availableQty
    const stock = Array.from(stockMap.values()).map(item => ({
      ...item,
      availableQty: item.purchasedQty - item.soldQty
    }));

    return NextResponse.json({ success: true, stock });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
