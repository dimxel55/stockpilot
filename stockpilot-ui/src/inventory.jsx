
import { useEffect, useState } from "react";
import "./inventory.css";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInventory() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/inventory"
        );

        if (!response.ok) {
          throw new Error("Could not load inventory.");
        }

        const data = await response.json();
        setItems(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  const totalUnits = items.reduce(
    (sum, item) => sum + item.quantity_on_hand,
    0
  );

  const lowStock = items.filter(
    (item) =>
      item.quantity_on_hand > 0 &&
      item.quantity_on_hand < 10
  ).length;

  const outOfStock = items.filter(
    (item) => item.quantity_on_hand === 0
  ).length;

  if (loading) return <p>Loading inventory...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="inventory-page">
      <div className="inventory-heading">
        <div>
          <div className="eyebrow">WAREHOUSE / STOCK CONTROL</div>
          <h1>Inventory</h1>
          <p>Current stock levels from the warehouse database.</p>
        </div>
      </div>

      <div className="inventory-stats">
        <div className="inventory-stat">
          <span>Total products</span>
          <strong>{items.length}</strong>
        </div>

        <div className="inventory-stat">
          <span>Total units</span>
          <strong>{totalUnits}</strong>
        </div>

        <div className="inventory-stat">
          <span>Low stock</span>
          <strong className="low-number">{lowStock}</strong>
        </div>

        <div className="inventory-stat">
          <span>Out of stock</span>
          <strong className="out-number">{outOfStock}</strong>
        </div>
      </div>

      <section className="panel inventory-panel">
        <div className="inventory-toolbar">
          <div>
            <h2>Stock overview</h2>
            <p>Current quantity per product and warehouse.</p>
          </div>
          <span className="result-count">
            {items.length} products
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>CATEGORY</th>
                <th>WAREHOUSE</th>
                <th>QUANTITY</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={`${item.product_id}-${item.warehouse_name}`}>
                  <td><strong>{item.product_name}</strong></td>
                  <td>{item.product_sku}</td>
                  <td>{item.category || "Uncategorized"}</td>
                  <td>{item.warehouse_name || "Not assigned"}</td>
                  <td><strong>{item.quantity_on_hand}</strong></td>
                  <td>
                    <span
                      className={`inventory-status ${
                        item.quantity_on_hand === 0
                          ? "status-out"
                          : item.quantity_on_hand < 10
                            ? "status-low"
                            : "status-good"
                      }`}
                    >
                      {item.quantity_on_hand === 0
                        ? "Out of stock"
                        : item.quantity_on_hand < 10
                          ? "Low stock"
                          : "In stock"}
                    </span>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan="6">No inventory records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
