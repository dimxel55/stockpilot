
import { useState } from "react";
import "./Products.css";

export default function Products({ products, onAddProduct }) {
  const [search, setSearch] = useState("");
  const [selectedSku, setSelectedSku] = useState("TSH-001");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "T-Shirts",
    description: "",
  });

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.sku} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const selectedProduct = products.find(
    (product) => product.sku === selectedSku
  );

  const selectedVariants = selectedProduct?.variants || [];

  async function handleSubmit(event) {
  event.preventDefault();

  try {
    await onAddProduct({
      sku: formData.sku.trim().toUpperCase(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
    });

    setSelectedSku(formData.sku.trim().toUpperCase());
    setShowModal(false);

    setFormData({
      sku: "",
      name: "",
      category: "T-Shirts",
      description: "",
    });
  } catch (error) {
    alert(error.message);
  }
}

return (

    <div className="products-page">
      <div className="products-heading">
        <div>
          <div className="eyebrow">CATALOG / MANAGEMENT</div>
          <h1>Products</h1>
          <p>Manage your clothing catalog, sizes and colors.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowModal(true)}
        >
          ＋ Add product
        </button>
      </div>

      <div className="products-layout">
        <section className="panel catalog-panel">
          <div className="panel-heading">
            <div>
              <h2>Product catalog</h2>
              <p>{filteredProducts.length} products found</p>
            </div>
          </div>

          <div className="product-search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product name or SKU..."
            />
          </div>

          <div className="catalog-list">
            {filteredProducts.map((product) => (
              <button
                key={product.sku}
                className={`catalog-item ${
                  selectedSku === product.sku ? "selected" : ""
                }`}
                onClick={() => setSelectedSku(product.sku)}
              >
                <div className="catalog-image">
                  {product.category === "T-Shirts" ? "TS" :
                   product.category === "Hoodies" ? "HD" :
                   product.category === "Jeans" ? "JN" :
                   product.category === "Jackets" ? "JK" : "PR"}
                </div>

                <div className="catalog-info">
                  <strong>{product.name}</strong>
                  <span>{product.sku}</span>
                  <span>{product.category}</span>
                </div>

                <span className="catalog-arrow">→</span>
              </button>
            ))}

            {filteredProducts.length === 0 && (
              <p className="no-products">No products found.</p>
            )}
          </div>
        </section>

        <section className="panel detail-panel">
          {selectedProduct ? (
            <>
              <div className="product-detail-header">
                <div>
                  <div className="eyebrow">PRODUCT DETAILS</div>
                  <h2>{selectedProduct.name}</h2>
                  <p>{selectedProduct.sku} · {selectedProduct.category}</p>
                </div>
                <span className="active-tag">Active</span>
              </div>

              <div className="detail-stats">
                <div>
                  <span>Total stock</span>
                  <strong>{selectedProduct.stock}</strong>
                </div>
                <div>
                  <span>Variants</span>
                  <strong>{selectedVariants.length}</strong>
                </div>
                <div>
                  <span>Unit price</span>
                  <strong>
                    {selectedProduct.price != null
                      ? `€${Number(selectedProduct.price).toFixed(2)}`
                      : "—"}
                  </strong>
                </div>
              </div>

              <div className="variants-heading">
                <div>
                  <h3>Variants & stock</h3>
                  <p>Stock quantities by size and color.</p>
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>SIZE</th>
                      <th>COLOR</th>
                      <th>STOCK</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedVariants.map((variant) => (
                      <tr key={variant.sku}>
                        <td>{variant.sku}</td>
                        <td>{variant.size}</td>
                        <td>
                          <span className="color-label">
                            <span className={`color-dot color-${variant.color.toLowerCase()}`} />
                            {variant.color}
                          </span>
                        </td>
                        <td>
                          <span className={
                            variant.stock < 10 ? "stock-low" : "stock-value"
                          }>
                            {variant.stock} units
                          </span>
                        </td>
                      </tr>
                    ))}

                    {selectedVariants.length === 0 && (
                      <tr>
                        <td colSpan="4">No variants added yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <h3>Select a product</h3>
              <p>Choose a product from the catalog to see its variants.</p>
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">CATALOG / NEW ITEM</div>
                <h2>Add product</h2>
                <p>Enter the details of your new product.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Product SKU</label>
              <input
                value={formData.sku}
                onChange={(event) => setFormData({ ...formData, sku: event.target.value })}
                placeholder="e.g. TSH-002"
                required
              />

              <label>Product name</label>
              <input
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="e.g. Premium Cotton T-Shirt"
                required
              />

              <label>Category</label>
              <select
                value={formData.category}
                onChange={(event) => setFormData({ ...formData, category: event.target.value })}
              >
                <option>T-Shirts</option>
                <option>Hoodies</option>
                <option>Jeans</option>
                <option>Jackets</option>
                <option>Accessories</option>
              </select>

              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                placeholder="Product description..."
              />

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Add product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
