import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const BASE_URL = "http://localhost:5000";

const SERIES = [
  "Fabula Series",
  "Endless Surface",
  "Endless Collection",
  "PGVT Series (Glossy)",
  "Matt Series",
  "Shine Finish",
  "Colorica Series (Glossy)",
  "Fabula Series Plain"
];

const CATEGORIES = [
  "Polished Surface",
  "HI Surface",
  "Marble Surface",
  "Porce Surface",
  "GHR Surface"
];

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]); // ✅ ADDON
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterSeries, setFilterSeries] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    name: "",
    series: "",
    category: ""
  });

  const [tileFile, setTileFile] = useState(null);
  const [hoverFile, setHoverFile] = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);

  const [tilePreview, setTilePreview] = useState("");
  const [hoverPreview, setHoverPreview] = useState("");
  const [previewPreviews, setPreviewPreviews] = useState([]);

  /* ================= FETCH ================= */
  const fetchProducts = async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();
    setProducts(data);
  };

  // ✅ ADDON
  const fetchEnquiries = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/contact/all`);
    const data = await res.json();
    setEnquiries(data);
  } catch (err) {
    console.error("Failed to fetch enquiries", err);
  }
};
  useEffect(() => {
    fetchProducts();
    fetchEnquiries(); // ✅ ADDON
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setTileFile(f);
    setTilePreview(URL.createObjectURL(f));
  };

  const handleHover = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setHoverFile(f);
    setHoverPreview(URL.createObjectURL(f));
  };

  const handlePreviews = (e) => {
    const files = Array.from(e.target.files);
    setPreviewFiles(files);
    setPreviewPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const resetForm = () => {
    setForm({ name: "", series: "", category: "" });
    setTileFile(null);
    setHoverFile(null);
    setPreviewFiles([]);
    setTilePreview("");
    setHoverPreview("");
    setPreviewPreviews([]);
    setEditingId(null);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("series", form.series);
    fd.append(
      "category",
      form.series === "Endless Surface" ? form.category : ""
    );

    if (tileFile) fd.append("tileImage", tileFile);
    if (hoverFile) fd.append("hoverImage", hoverFile);
    previewFiles.forEach(f => fd.append("previewImages", f));

    const url = editingId
      ? `${BASE_URL}/api/products/${editingId}`
      : `${BASE_URL}/api/products`;

    const method = editingId ? "PUT" : "POST";

    await fetch(url, { method, body: fd });

    resetForm();
    fetchProducts();
    setLoading(false);
  };

  /* ================= EDIT / DELETE ================= */
  const handleEdit = (p) => {
    setForm({
      name: p.name,
      series: p.series,
      category: p.category || ""
    });

    setTilePreview(`${BASE_URL}${p.tileImage}`);
    setHoverPreview(p.hoverImage ? `${BASE_URL}${p.hoverImage}` : "");
    setPreviewPreviews(
      (p.previewImages || []).map(i => `${BASE_URL}${i}`)
    );

    setEditingId(p._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`${BASE_URL}/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  /* ================= FILTER LOGIC ================= */
  const filteredProducts = products.filter((p) => {
    if (filterSeries && p.series !== filterSeries) return false;
    if (filterSeries === "Endless Surface" && filterCategory) {
      if (p.category !== filterCategory) return false;
    }
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  /* ================= UI ================= */
  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <div className="admin-stats">
          <div className="stat-pill">
            <span className="stat-num">{products.length}</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">{enquiries.length}</span>
            <span className="stat-label">Enquiries</span>
          </div>
        </div>
      </div>

      {/* ===== FORM ===== */}
      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Product" : "Add Product"}</h2>

        <div className="form-grid">
          <div className="form-col">
            <label>Product Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <label>Series</label>
            <select name="series" value={form.series} onChange={handleChange} required>
              <option value="">Select Series</option>
              {SERIES.map(s => <option key={s}>{s}</option>)}
            </select>

            {form.series === "Endless Surface" && (
              <>
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </>
            )}
          </div>

          <div className="form-col">
            <label>Tile Image</label>
            <input type="file" accept="image/*" onChange={handleTile} />
            {tilePreview && <img className="preview-img" src={tilePreview} />}
          </div>

          <div className="form-col">
            <label>Hover Image</label>
            <input type="file" accept="image/*" onChange={handleHover} />
            {hoverPreview && <img className="preview-img" src={hoverPreview} />}
          </div>

          <div className="form-col">
            <label>Preview Images</label>
            <input type="file" multiple accept="image/*" onChange={handlePreviews} />
            <div className="preview-grid">
              {previewPreviews.map((p, i) => (
                <img key={i} src={p} />
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          {editingId && (
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Cancel
            </button>
          )}
          <button disabled={loading}>
            {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>

      {/* ===== PRODUCTS LIST ===== */}
      <div className="admin-list">
        <div className="list-header">
          <h2>Products</h2>
          <span className="product-count">{filteredProducts.length} of {products.length}</span>
        </div>

        {/* Search + Filter Bar */}
        <div className="toolbar">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-container">
            <div className="filter-group">
              <label className="filter-label">Series</label>
              <select
                className="filter-select"
                value={filterSeries}
                onChange={(e) => {
                  setFilterSeries(e.target.value);
                  setFilterCategory("");
                }}
              >
                <option value="">All Series</option>
                {SERIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {filterSeries === "Endless Surface" && (
              <div className="filter-group">
                <label className="filter-label">Category</label>
                <select
                  className="filter-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">No products found</div>
          ) : (
            filteredProducts.map(p => (
              <div className="product-card" key={p._id}>
                <div className="card-img-wrap">
                  <img src={`${BASE_URL}${p.tileImage}`} className="card-img" alt={p.name} />
                  <div className="card-badge">{p.previewImages?.length || 0} previews</div>
                </div>
                <div className="card-body">
                  <p className="card-name">{p.name}</p>
                  <p className="card-series">{p.series}</p>
                  {p.category && <p className="card-category">{p.category}</p>}
                </div>
                <div className="card-actions">
                  <button className="edit" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="delete" onClick={() => handleDelete(p._id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== CUSTOMER ENQUIRIES (ADDON ONLY) ===== */}
      <div className="admin-list enquiry-section">
        <div className="list-header">
          <h2>Customer Enquiries</h2>
          <span className="product-count">{enquiries.length} total</span>
        </div>

        <div className="enquiry-grid">
          {enquiries.length === 0 ? (
            <div className="empty-state">No enquiries yet</div>
          ) : (
            enquiries.map(e => (
              <div className="enquiry-card" key={e._id}>
                <div className="enquiry-tile">
                  {e.tileImage ? (
                    <img
                      src={`${BASE_URL}${e.tileImage}`}
                      alt={e.tileName}
                      className="enquiry-tile-img"
                    />
                  ) : (
                    <div className="enquiry-no-img">No Image</div>
                  )}
                </div>
                <div className="enquiry-body">
                  <div className="enquiry-header-row">
                    <span className="enquiry-name">{e.name}</span>
                    <span className="enquiry-date">{new Date(e.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="enquiry-phone">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {e.phone}
                  </div>
                  <div className="enquiry-tile-name">{e.tileName || "Custom Upload"}</div>
                  <p className="enquiry-message">{e.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;