
import { useEffect, useState } from "react";
import "./App.css";
import Products from "./Products";
import Inventory from "./inventory";
import StockMovements from "./StockMovements";

const menu = [
  { icon: "▦", label: "Dashboard" },
  { icon: "◈", label: "Products" },
  { icon: "▤", label: "Inventory" },
  { icon: "↗", label: "Purchase Orders" },
  { icon: "↙", label: "Sales Orders" },
  { icon: "↔", label: "Stock Movements" },
  { icon: "♧", label: "Suppliers" },
];

function App() {
 const [products, setProducts] = useState([]);
 const [inventory, setInventory] = useState([]);
const [recentMovements, setRecentMovements] = useState([]);
const [loading, setLoading] = useState(true);
const [apiError, setApiError] = useState("");

useEffect(() => {
  async function loadProducts() {
    try {
      const response = await fetch("http://127.0.0.1:8000/products");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Could not load products:", error);
      setApiError("Could not connect to StockPilot API.");
    } finally {
      setLoading(false);
    }
  }

  loadProducts();
}, []);


useEffect(() => {
  async function loadDashboardData() {
    try {
      const [inventoryResponse, movementsResponse] = await Promise.all([
        fetch("http://127.0.0.1:8000/inventory"),
        fetch("http://127.0.0.1:8000/stock-movements"),
      ]);

      if (!inventoryResponse.ok || !movementsResponse.ok) {
        throw new Error("Could not load dashboard data.");
      }

      const inventoryData = await inventoryResponse.json();
      const movementsData = await movementsResponse.json();

      setInventory(inventoryData);
      setRecentMovements(movementsData.slice(0, 5));
    } catch (error) {
      console.error("Dashboard loading error:", error);
    }
  }

  loadDashboardData();
}, []);

  const [activePage, setActivePage] = useState("Dashboard");

useEffect(() => {
  if (activePage !== "Dashboard") return;

  async function refreshDashboard() {
    try {
      const [inventoryResponse, movementsResponse] = await Promise.all([
        fetch("http://127.0.0.1:8000/inventory"),
        fetch("http://127.0.0.1:8000/stock-movements"),
      ]);

      if (!inventoryResponse.ok || !movementsResponse.ok) {
        throw new Error("Could not refresh dashboard data.");
      }

      const inventoryData = await inventoryResponse.json();
      const movementsData = await movementsResponse.json();

      setInventory(inventoryData);
      setRecentMovements(movementsData.slice(0, 5));
    } catch (error) {
      console.error("Dashboard refresh error:", error);
    }
  }

  refreshDashboard();
}, [activePage]);

  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.sku} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

 
const totalStock = inventory.reduce(
  (sum, item) => sum + item.quantity_on_hand,
  0
);

const lowStock = inventory.filter(
  (item) => item.quantity_on_hand > 0 && item.quantity_on_hand < 10
).length;

const outOfStock = inventory.filter(
  (item) => item.quantity_on_hand === 0
).length;


  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <h2>stockpilot</h2>
            <span>FASHION OPERATIONS</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav>
          {menu.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${
                activePage === item.label ? "active" : ""
              }`}
              onClick={() => setActivePage(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}

              {item.label === "Inventory" && (
                <span className="nav-count">{lowStock}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="warehouse-status">
            <span className="status-dot" />
            <div>
              <strong>Main Warehouse</strong>
              <span>Athens, Greece</span>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">SP</div>
            <div>
              <strong>StockPilot Admin</strong>
              <span>Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{activePage}</strong>
          </div>

          <div className="topbar-right">
            <span className="live-indicator">
              <span className="status-dot" />
              Demo environment
            </span>
            <div className="avatar">SP</div>
          </div>
        </header>

        <section className="page-content">

          {/* PRODUCTS PAGE */}
         {loading ? (
  <p>Loading products from StockUp...</p>
) : apiError ? (
  <p>{apiError}</p>
) : activePage === "Products" ? (
 <Products
  products={products}
  onAddProduct={async (newProduct) => {
    const response = await fetch("http://127.0.0.1:8000/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to create product");
    }

    const updatedResponse = await fetch("http://127.0.0.1:8000/products");

    if (!updatedResponse.ok) {
      throw new Error("Product saved, but refreshing the list failed.");
    }

    const updatedProducts = await updatedResponse.json();
    setProducts(updatedProducts);
  }}
/>
) : activePage === "Inventory" ? (
  <Inventory products={products} />
) : activePage === "Stock Movements" ? (
  <StockMovements />
) : (

            /* DASHBOARD PAGE */
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">OVERVIEW / 2026</div>
                  <h1>{activePage}</h1>
                  <p>
                    Here's what's happening with your fashion business today.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setActivePage("Products")}
                >
                  <span>＋</span> View products
                </button>
              </div>

              <div className="stats-grid">
                <StatCard
                  label="Total products"
                  value={products.length}
                  note="Active product styles"
                  icon="◈"
                  trend="Catalog"
                />

                <StatCard
                  label="Units in stock"
                  value={totalStock}
                  note="Across all product variants"
                  icon="▤"
                  trend="On hand"
                />

                <StatCard
                  label="Low stock alerts"
                  value={lowStock}
                  note="Products below 10 units"
                  icon="⚠"
                  trend={lowStock ? "Needs attention" : "All good"}
                  warning
                />

                <StatCard
  label="Out of stock"
  value={outOfStock}
  note="Inventory records with zero units"
  icon="⚠"
  trend={outOfStock > 0 ? "Needs attention" : "All good"}
  warning={outOfStock > 0}
/>
              </div>

              
<section className="panel products-panel">
  <div className="panel-heading">
    <div>
      <h2>Recent stock movements</h2>
      <p>Latest receipts, shipments and corrections.</p>
    </div>
    <button
      className="text-button"
      onClick={() => setActivePage("Stock Movements")}
    >
      View all →
    </button>
  </div>

  <div className="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>DATE</th>
          <th>PRODUCT</th>
          <th>SKU</th>
          <th>WAREHOUSE</th>
          <th>TYPE</th>
          <th>QUANTITY</th>
          <th>REASON</th>
        </tr>
      </thead>
      <tbody>
        {recentMovements.map((movement) => (
          <tr key={movement.stock_movement_id}>
            <td>{new Date(movement.created_at).toLocaleDateString()}</td>
            <td>{movement.product_name}</td>
            <td>{movement.product_sku}</td>
            <td>{movement.warehouse_name}</td>
            <td>{movement.movement_type}</td>
            <td>{movement.quantity_change > 0 ? "+" : ""}{movement.quantity_change}</td>
            <td>{movement.reason || "—"}</td>
          </tr>
        ))}

        {recentMovements.length === 0 && (
          <tr>
            <td colSpan="7">No stock movements found.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>


              <footer className="page-footer">
                <span>
                  STOCKPILOT <span className="footer-dot">·</span> INVENTORY MANAGEMENT
                </span>
                <span>Built for fashion operations.</span>
              </footer>
            </>

          )}

        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, note, icon, trend, warning = false }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className={`stat-icon ${
          warning ? "stat-icon-warning" : ""
        }`}>
          {icon}
        </div>
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-bottom">
        <span>{note}</span>
        <span className={warning ? "warning-text" : "trend-tag"}>
          {trend}
        </span>
      </div>
    </div>
  );
}

export default App;
