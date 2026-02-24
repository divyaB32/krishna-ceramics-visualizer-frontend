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
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterSeries, setFilterSeries] = useState("");

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

  useEffect(() => {
    fetchProducts();
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
      return p.category === filterCategory;
    }
    return true;
  });

  /* ================= UI ================= */
  return (
    <div className="admin-wrapper">
      <h1 className="admin-title">Admin Dashboard</h1>

      {/* ===== FORM ===== */}
      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Product" : "Add Product"}</h2>

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

        <label>Tile Image</label>
        <input type="file" accept="image/*" onChange={handleTile} />
        {tilePreview && <img className="preview-img" src={tilePreview} />}

        <label>Hover Image</label>
        <input type="file" accept="image/*" onChange={handleHover} />
        {hoverPreview && <img className="preview-img" src={hoverPreview} />}

        <label>Preview Images</label>
        <input type="file" multiple accept="image/*" onChange={handlePreviews} />
        <div className="preview-grid">
          {previewPreviews.map((p, i) => (
            <img key={i} src={p} />
          ))}
        </div>

        <button disabled={loading}>
          {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* ===== PRODUCTS LIST ===== */}
      <div className="admin-list">
        <h2>Products</h2>

        {/* FILTER SECTION */}
        <div className="filter-container">
          <div className="filter-group">
            <label className="filter-label">Filter by Series</label>
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
              <label className="filter-label">Filter by Category</label>
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

        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Series</th>
              <th>Previews</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p._id}>
                <td>
                  <img
                    src={`${BASE_URL}${p.tileImage}`}
                    className="table-img"
                  />
                </td>
                <td>{p.name}</td>
                <td>{p.series}</td>
                <td>{p.previewImages?.length || 0}</td>
                <td>
                  <button className="edit" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="delete" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;