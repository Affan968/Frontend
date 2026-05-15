"use client";

import { useState, useEffect } from "react";
import axios from "axios";

// Product interface for TypeScript
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Aapka exact Vercel API Base URL
  const API_URL = "https://backend-a-pi-beige.vercel.app";

  // 1. READ: Fetch all products (GET)
  const fetchProducts = async (): Promise<void> => {
    try {
      const response = await axios.get<Product[]>(`${API_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. CREATE or UPDATE (Form Submit)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!name || !price || !description) return alert("Please fill all fields");

    setLoading(true);
    const productData = { name, price: Number(price), description };

    try {
      if (editingId) {
        // PUT: Update Whole Product
        const response = await axios.put(`${API_URL}/api/products/${editingId}`, productData);
        if (response.status === 200) {
          alert("Product updated successfully!");
          setEditingId(null);
        }
      } else {
        // POST: Create Product
        const response = await axios.post(`${API_URL}/api/products`, productData);
        if (response.status === 201) {
          alert("Product added successfully!");
        }
      }

      // Reset form fields & refresh inventory
      setName("");
      setPrice("");
      setDescription("");
      fetchProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // 3. EDIT: Form mein inputs populate karne ke liye
  const handleEdit = (product: Product): void => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setDescription(product.description);
  };

  // 4. DELETE: Product remove karne ke liye
  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await axios.delete(`${API_URL}/api/products/${id}`);
      if (response.status === 200) {
        alert("Product deleted successfully!");
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold text-center mb-8 text-black dark:text-zinc-50">
        E-Commerce Product CRUD
      </h1>

      {/* Form Section */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-lg shadow-md mb-10 border border-gray-200 dark:border-zinc-800"
      >
        <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
          {editingId ? "✏️ Edit Product" : "➕ Add New Product"}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 text-black dark:text-zinc-50"
          />
          <input
            type="number"
            placeholder="Price ($)"
            value={price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
            className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 text-black dark:text-zinc-50"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 text-black dark:text-zinc-50"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName("");
                setPrice("");
                setDescription("");
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Product List Section */}
      <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">Product Inventory</h2>
      {products.length === 0 ? (
        <p className="text-gray-500">No products available. Add one above!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 dark:border-zinc-800 p-4 rounded-lg shadow-sm flex flex-col justify-between bg-white dark:bg-black"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-black dark:text-zinc-50">{product.name}</h3>
                  <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-sm font-semibold px-2.5 py-0.5 rounded">
                    ${product.price}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{product.description}</p>
              </div>

              <div className="flex gap-2 mt-4 border-t pt-3 border-gray-100 dark:border-zinc-800">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}