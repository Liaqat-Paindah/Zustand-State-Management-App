"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@base-ui/react";
import { useFormik } from "formik";
import type { Product } from "@/stores/cartStore";
import { useCart } from "@/stores/cartStore";
import { useAuth } from "@/stores/userAuth";

const Products = () => {
  const cartItems = useCart((state) => state.cartItems);
  const addProducts = useCart((state) => state.addProducts);
  const removeProduct = useCart((state) => state.removeProduct);
  const clear = useCart((state) => state.clear);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const { values, handleChange, handleSubmit, handleBlur, resetForm } =
    useFormik({
      initialValues: {
        id: 0,
        name: "",
        price: 0,
        quantity: 0,
        total_price: 0,
      },

      onSubmit: (values) => {
        const product: Product = {
          id: Number(values.id),
          name: values.name,
          price: Number(values.price),
          quantity: Number(values.quantity),
        };

        addProducts(product);

        console.log("Added product:", product);

        resetForm();
      },
    });

  // Calculate total for the entire cart
  const cartTotal = cartItems.reduce(
    (total, product) => total + product.price * product.quantity,
    0,
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      {/* ================= FORM ================= */}
      {!isAuthenticated && (
        <p className="text-red-600 mb-4">
          You must be logged in to add products to the cart.
        </p>
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Add Product</h1>

        <form onSubmit={handleSubmit}>
          {/* Product ID */}
          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="id">Product ID:</label>

            <input
              type="number"
              id="id"
              name="id"
              className="w-full py-2 px-2 rounded-sm border border-gray-600"
              placeholder="Product ID"
              value={values.id}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          {/* Product Name */}
          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="name">Product Name:</label>

            <input
              type="text"
              id="name"
              name="name"
              className="w-full py-2 px-2 rounded-sm border border-gray-600"
              placeholder="Product Name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          {/* Product Price */}
          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="price">Product Price:</label>

            <input
              type="number"
              id="price"
              name="price"
              className="w-full py-2 px-2 rounded-sm border border-gray-600"
              placeholder="Product Price"
              value={values.price}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          {/* Product Quantity */}
          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="quantity">Product Quantity:</label>

            <input
              type="number"
              id="quantity"
              name="quantity"
              className="w-full py-2 px-2 rounded-sm border border-gray-600"
              placeholder="Product Quantity"
              value={values.quantity}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          {/* Add Button */}
          <Button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 w-full rounded-sm cursor-pointer hover:bg-blue-700"
          >
            Add to Cart
          </Button>
        </form>
      </div>

      {/* ================= CART ================= */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Cart Products</h2>

          {/* Clear Cart */}
          {cartItems.length > 0 && (
            <Button
              type="button"
              onClick={clear}
              className="bg-red-600 text-white py-2 px-4 rounded-sm cursor-pointer hover:bg-red-700"
            >
              Clear Cart
            </Button>
          )}
        </div>

        {/* No products */}
        {cartItems.length === 0 ? (
          <div className="p-6 border border-gray-600 rounded text-center">
            <p>No products added yet.</p>
          </div>
        ) : (
          <>
            {/* Products table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-600">
                <thead>
                  <tr className="bg-gray-100 text-black">
                    <th className="border border-gray-600 p-3">ID</th>

                    <th className="border border-gray-600 p-3">Name</th>

                    <th className="border border-gray-600 p-3">Price</th>

                    <th className="border border-gray-600 p-3">Quantity</th>

                    <th className="border border-gray-600 p-3">Total</th>

                    <th className="border border-gray-600 p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {cartItems.map((product) => (
                    <tr key={product.id}>
                      <td className="border border-gray-600 p-3 text-center">
                        {product.id}
                      </td>

                      <td className="border border-gray-600 p-3">
                        {product.name}
                      </td>

                      <td className="border border-gray-600 p-3 text-center">
                        {product.price}
                      </td>

                      <td className="border border-gray-600 p-3 text-center">
                        {product.quantity}
                      </td>

                      <td className="border border-gray-600 p-3 text-center">
                        <Button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="bg-red-500 text-white py-1 px-3 rounded cursor-pointer hover:bg-red-600"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Cart total */}
                <tfoot>
                  <tr>
                    <td
                      colSpan={4}
                      className="border border-gray-600 p-3 text-right font-bold"
                    >
                      Cart Total:
                    </td>

                    <td
                      colSpan={2}
                      className="border border-gray-600 p-3 font-bold"
                    >
                      {cartTotal}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
