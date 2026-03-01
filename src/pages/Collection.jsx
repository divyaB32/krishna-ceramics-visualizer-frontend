import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Collection.css";

/* ✅ UNIVERSAL BACKEND URL (LOCAL + PROD + MOBILE) */
const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* 🔴 IMPORTANT: single safe image resolver (UNCHANGED LOGIC) */
const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return `${BASE_URL}${img}`;
};

const Collection = () => {
  const [products, setProducts] = useState([]);

  // EXISTING STATES (UNCHANGED)
  const [activeSeries, setActiveSeries] = useState("Fabula Series");
  const [activeCategory, setActiveCategory] = useState("");

  // SEARCH STATE (UNCHANGED)
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  /* ✅ MOBILE-SAFE FETCH WITH RETRY */
  const fetchWithRetry = async (url, retries = 3) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      return await res.json();
    } catch (err) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 3000));
        return fetchWithRetry(url, retries - 1);
      }
      throw err;
    }
  };

  useEffect(() => {
    fetchWithRetry(`${BASE_URL}/api/products`)
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
      });
  }, []);

  // EXISTING dropdown categories (UNCHANGED)
  const endlessCategories = [
    "Polished Surface",
    "HI Surface",
    "Marble Surface",
    "Porce Surface",
    "GHR Surface",
  ];

  // FILTER LOGIC (UNCHANGED)
  const filteredProducts = products.filter((product) => {
    if (activeSeries === "Endless Surface") {
      if (!activeCategory) return false;
      if (
        product.series !== "Endless Surface" ||
        product.category !== activeCategory
      ) {
        return false;
      }
    } else {
      if (product.series !== activeSeries) return false;
    }

    if (!search) return true;

    const q = search.toLowerCase();
    return (
      product.name?.toLowerCase().includes(q) ||
      product.series?.toLowerCase().includes(q) ||
      product.category?.toLowerCase().includes(q)
    );
  });

  return (
    <section className="collection-page">
      <div className="collection-header">
        <h1>Tile Collection</h1>

        <p>
          Explore our complete range of premium glazed vitrified tiles. Each
          design captures authentic artistry with graceful curves and
          enchanting color combinations.
        </p>

        <div className="collection-search">
          <input
            type="text"
            placeholder="Search tiles by name, series, or surface..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="series-tabs scroll-x">
          {[
            "Fabula Series",
            "Endless Surface",
            "Endless Collection",
            "PGVT Series (Glossy)",
            "Matt Series",
            "Shine Finish",
            "Colorica Series (Glossy)",
            "Fabula Series Plain",
          ].map((series) => (
            <span
              key={series}
              className={`series-tab ${
                activeSeries === series ? "active" : ""
              }`}
              onClick={() => {
                setActiveSeries(series);
                setActiveCategory("");
              }}
            >
              {series.toUpperCase()}
            </span>
          ))}
        </div>

        {activeSeries === "Endless Surface" && (
          <div className="surface-dropdown">
            {endlessCategories.map((cat) => (
              <button
                key={cat}
                className={`surface-btn ${
                  activeCategory === cat ? "active" : ""
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-grid">
        {filteredProducts.length === 0 && (
          <p className="empty-text">No products found</p>
        )}

        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="product-card"
            onClick={() => navigate(`/product/${product._id}`)}
          >
            <div className="image-wrapper">
              <img
                src={getImageUrl(product.tileImage)}
                alt={product.name}
                className="main-img"
              />

              {product.hoverImage && (
                <img
                  src={getImageUrl(product.hoverImage)}
                  alt="preview"
                  className="hover-img"
                />
              )}
            </div>

            <h3>{product.name}</h3>

            <button
              className="details-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product._id}`);
              }}
            >
              Details
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Collection;