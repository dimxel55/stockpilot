
import { useEffect, useState } from "react";

function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [productId, setProductId] = useState("6");
  const [warehouseId, setWarehouseId] = useState("1");
  const [movementType, setMovementType] = useState("receipt");
  const [quantity, setQuantity] = useState("5");
  const [reason, setReason] = useState("");

  async function fetchMovements() {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/stock-movements"
      );

      if (!response.ok) {
        throw new Error("Failed to load stock movements.");
      }

      const data = await response.json();
      setMovements(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMovements();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const enteredQuantity = Number(quantity);

    if (!Number.isInteger(enteredQuantity) || enteredQuantity <= 0) {
      setError("Enter a positive whole number.");
      return;
    }

    const quantityChange =
      movementType === "shipment"
        ? -enteredQuantity
        : enteredQuantity;

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/stock-movements",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: Number(productId),
            warehouse_id: Number(warehouseId),
            quantity_change: quantityChange,
            movement_type: movementType,
            reason: reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not record movement.");
      }

      setSuccess("Stock movement recorded successfully!");
      setQuantity("5");
      setReason("");
      await fetchMovements();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <h1>Stock Movements</h1>
      <p>Record and review warehouse stock changes.</p>

      <h2>Record a movement</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Product ID</label>
          <input
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Warehouse ID</label>
          <input
            type="number"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Movement type</label>
          <select
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
          >
            <option value="receipt">Receipt (stock in)</option>
            <option value="shipment">Shipment (stock out)</option>
            <option value="correction">Correction</option>
          </select>
        </div>

        <div>
          <label>Quantity</label>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. New delivery"
          />
        </div>

        <button type="submit">Record movement</button>
      </form>

      {success && <p>{success}</p>}
      {error && <p>Error: {error}</p>}

      <h2>Movement history</h2>

      {loading ? (
        <p>Loading movements...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Warehouse</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {movements.map((movement) => (
              <tr key={movement.stock_movement_id}>
                <td>
                  {new Date(movement.created_at).toLocaleString()}
                </td>
                <td>{movement.product_name}</td>
                <td>{movement.product_sku}</td>
                <td>{movement.warehouse_name}</td>
                <td>{movement.movement_type}</td>
                <td>
                  {movement.quantity_change > 0 ? "+" : ""}
                  {movement.quantity_change}
                </td>
                <td>{movement.reason || "—"}</td>
              </tr>
            ))}

            {movements.length === 0 && (
              <tr>
                <td colSpan="7">No stock movements found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StockMovements;
