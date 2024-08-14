const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");

const addToCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { size } = req.body;

    // Find the user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    // Find the product by ID
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(400).json({ message: "Product not found." });
    }

    // Determine the price to use: regular or discounted
    let price = product.price;

    // If the product has a discount, calculate the discounted price
    if (product.discountPercentage > 0) {
      if (size) {
        // Use the discounted price for the specific size if available
        const sizeDetails = product.sizes.find((s) => s.size === size);
        if (!sizeDetails) {
          return res
            .status(400)
            .json({ message: "Size not found for the product." });
        }
        price = sizeDetails.price * (1 - product.discountPercentage / 100);
      } else if (!size) {
        // Use the general discounted price if there's no size
        price = product.price * (1 - product.discountPercentage / 100);
      }
    } else if (size) {
      // Use the regular price for the specific size if no discount
      const sizeDetails = product.sizes.find((s) => s.size === size);
      if (!sizeDetails) {
        return res
          .status(400)
          .json({ message: "Size not found for the product." });
      }
      price = sizeDetails.price;
    }

    // Find the user's cart or create a new one if it doesn't exist
    let cart = await cartModel.findOne({ userId: userId });
    if (!cart) {
      cart = new cartModel({ userId: user._id, products: [], total: 0 });
    }

    // Check if the product with the same size is already in the cart
    const existingItem = cart.products.find(
      (item) => item.productId.equals(productId) && item.size === size
    );

    if (existingItem) {
      // Update the quantity and subtotal of the existing item
      existingItem.quantity += 1;
      existingItem.sub_total = price * existingItem.quantity;
    } else {
      // Add a new product to the cart
      const newItem = {
        productId,
        quantity: 1,
        price: price, // Use the calculated price
        size, // Ensure the size is added
        productName: product.itemName,
        productImage: product.productImage,
        sub_total: price,
      };
      cart.products.push(newItem);
    }

    // Recalculate the total price of the cart
    cart.total = cart.products.reduce((acc, item) => acc + item.sub_total, 0);

    // Save the updated cart to the database
    await cart.save();

    // Respond with success message and updated cart data
    res
      .status(200)
      .json({ message: "Item added to cart successfully.", data: cart });
  } catch (err) {
    res.status(500).json({ message: `Error adding to cart: ${err.message}` });
  }
};

const updateCart = async (req, res) => {
  try {
    // Extract userId and productId from request parameters
    const { userId, productId } = req.params;
    const { size, quantity } = req.body;

    // Find the user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    // Find the product by ID
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(400).json({ message: "Product not found." });
    }

    // Find the user's cart
    let cart = await cartModel.findOne({ userId: userId });
    if (!cart) {
      return res.status(400).json({ message: "Cart not found." });
    }

    // Find the product in the cart with the same size
    const item = cart.products.find(
      (item) => item.productId.equals(productId) && item.size === size
    );

    if (!item) {
      return res
        .status(400)
        .json({
          message: "Product with the specified size not found in cart.",
        });
    }

    // Determine the price to use: regular or discounted
    let price = product.price;

    // If the product has a discount, calculate the discounted price
    if (product.discountPercentage > 0) {
      if (size) {
        // Use the discounted price for the specific size if available
        const sizeDetails = product.sizes.find((s) => s.size === size);
        if (!sizeDetails) {
          return res
            .status(400)
            .json({ message: "Size not found for the product." });
        }
        price = sizeDetails.price * (1 - product.discountPercentage / 100);
      } else if (!size) {
        // Use the general discounted price if there's no size
        price = product.price * (1 - product.discountPercentage / 100);
      }
    } else if (size) {
      // Use the regular price for the specific size if no discount
      const sizeDetails = product.sizes.find((s) => s.size === size);
      if (!sizeDetails) {
        return res
          .status(400)
          .json({ message: "Size not found for the product." });
      }
      price = sizeDetails.price;
    }

    // Update the quantity and subtotal of the existing item
    item.quantity = quantity;
    item.sub_total = price * item.quantity;

    // Recalculate the total price of the cart
    cart.total = cart.products.reduce((acc, item) => acc + item.sub_total, 0);

    // Save the updated cart to the database
    await cart.save();

    // Respond with success message and updated cart data
    res.status(200).json({ message: "Cart updated successfully.", data: cart });
  } catch (err) {
    // Handle any errors that occur during the process
    res.status(500).json({ message: `Error updating cart: ${err.message}` });
  }
};

const updateCarts = async (req, res) => {
  try {
    // Extract userId and productId from request parameters
    const { userId, productId } = req.params;
    const { size, quantity } = req.body;

    // Find the user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    // Find the product by ID
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(400).json({ message: "Product not found." });
    }

    // Find the user's cart
    let cart = await cartModel.findOne({ userId: userId });
    if (!cart) {
      console.log("Cart not found for user:", userId);
      return res.status(400).json({ message: "Cart not found." });
    }

    console.log("Cart found:", cart);

    // Find the product in the cart with the same size
    const item = cart.products.find(
      (item) => item.productId.equals(productId) && item.size === size
    );

    if (!item) {
      return res
        .status(400)
        .json({
          message: "Product with the specified size not found in cart.",
        });
    }

    // Update the quantity and subtotal of the existing item
    item.quantity = quantity;
    const sizeDetails = product.sizes.find((s) => s.size === size);
    item.sub_total = sizeDetails.price * item.quantity;

    // Recalculate the total price of the cart
    cart.total = cart.products.reduce((acc, item) => acc + item.sub_total, 0);

    // Save the updated cart to the database
    await cart.save();

    // Respond with success message and updated cart data
    res.status(200).json({ message: "Cart updated successfully.", data: cart });
  } catch (err) {
    // Handle any errors that occur during the process
    res.status(500).json({ message: `Error updating cart: ${err.message}` });
  }
};

const removeFromCart = async (req, res) => {
  try {
    // Extract userId, productId, and size from request parameters
    const { userId, productId } = req.params;
    const { size } = req.body;

    // Find the user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    // Find the product by ID
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(400).json({ message: "Product not found." });
    }

    // Find the user's cart
    let cart = await cartModel.findOne({ userId: userId });
    if (!cart) {
      return res.status(400).json({ message: "Cart not found." });
    }

    // Find the product in the cart and remove it
    if (size) {
      // Remove the product with the specified size
      cart.products = cart.products.filter(
        (item) => !(item.productId.equals(productId) && item.size === size)
      );
    } else {
      // Remove the product regardless of size
      cart.products = cart.products.filter(
        (item) => !item.productId.equals(productId)
      );
    }

    // Recalculate the total price of the cart
    cart.total = cart.products.reduce((acc, item) => acc + item.sub_total, 0);

    // Save the updated cart to the database
    await cart.save();

    // Respond with success message and updated cart data
    res
      .status(200)
      .json({ message: "Item removed from cart successfully.", data: cart });
  } catch (err) {
    // Handle any errors that occur during the process
    res
      .status(500)
      .json({ message: `Error removing from cart: ${err.message}` });
  }
};

const viewCarts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user's cart
    const cart = await cartModel.findOne({ userId: userId }).populate({
      path: "products.productId",
      select: "itemName description productImage", // Select only the necessary fields
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Format the cart products to include the necessary product details
    const formattedCart = {
      ...cart.toObject(),
      products: cart.products.map((item) => ({
        productId: item.productId._id,
        productName: item.productId.itemName,
        description: item.productId.description,
        productImage: item.productId.productImage,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        sub_total: item.sub_total,
      })),
    };

    res
      .status(200)
      .json({ message: "Cart retrieved successfully.", data: formattedCart });
  } catch (err) {
    res.status(500).json({ message: `Error retrieving cart: ${err.message}` });
  }
};

const viewCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user's cart
    const cart = await cartModel.findOne({ userId: userId }).populate({
      path: "products.productId",
      select: "itemName description productImage sizes", // Select necessary fields
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Format the cart products to include the necessary product details
    const formattedCart = {
      ...cart.toObject(),
      products: cart.products.map((item) => {
        // Find the size details if available
        const sizeDetails = item.productId.sizes
          ? item.productId.sizes.find((size) => size.size === item.size)
          : null;

        return {
          productId: item.productId._id,
          productName: item.productId.itemName,
          description: item.productId.description,
          productImage: item.productId.productImage,
          size: item.size,
          quantity: item.quantity,
          price: sizeDetails ? sizeDetails.price : item.price,
          sub_total: item.sub_total,
        };
      }),
    };

    res
      .status(200)
      .json({ message: "Cart retrieved successfully.", data: formattedCart });
  } catch (err) {
    res.status(500).json({ message: `Error retrieving cart: ${err.message}` });
  }
};

const deleteCart = async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await cartModel.findOneAndDelete({ userId: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json({ message: "Cart deleted successfully." });
  } catch (err) {
    // Handle any errors that occur during the process
    res
      .status(500)
      .json({ message: `Error removing from cart: ${err.message}` });
  }
};

const checkouts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user's cart
    let cart = await cartModel.findOne({ userId: userId });

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // Process the checkout: Create an order
    const order = new orderModel({
      userId: userId,
      products: cart.products,
      total: cart.total,
    });

    // Save the order to the database
    await order.save();

    // Clear the cart
    cart.products = [];
    cart.total = 0;
    await cart.save();

    return res
      .status(200)
      .json({
        message: "Checkout successful. Your cart has been cleared.",
        order,
      });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error during checkout: ${err.message}` });
  }
};

const checkout = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID, including firstName and lastName
    const user = await userModel.findById(userId).select("firstName lastName");

    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    // Find the user's cart
    let cart = await cartModel.findOne({ userId: userId }).populate({
      path: "products.productId",
      select: "itemName description productImage sizes",
    });

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // Prepare the products for the order, ensuring all necessary fields are present
    const orderProducts = cart.products.map((item) => {
      const product = item.productId;
      if (!product) {
        throw new Error("Product not found during checkout.");
      }

      // Find size details if the product has sizes
      let sizeDetails = null;
      if (product.sizes && product.sizes.length > 0) {
        sizeDetails = product.sizes.find((size) => size.size === item.size);
      }

      // Ensure that the stored price is still correct
      const currentPrice = sizeDetails ? sizeDetails.price : item.price;

      if (item.price !== currentPrice) {
        throw new Error(
          "Product prices have changed. Please review your cart."
        );
      }

      return {
        productId: product._id,
        itemName: product.itemName,
        productImage: product.productImage,
        size: item.size || "N/A", // Use 'N/A' if size is undefined
        quantity: item.quantity,
        price: currentPrice, // Use the current price, whether from sizeDetails or the original price
        sub_total: item.sub_total,
      };
    });

    // Create the order
    const order = new orderModel({
      userId: userId,
      products: orderProducts,
      total: cart.total,
    });

    // Save the order to the database
    await order.save();

    // Clear the cart
    cart.products = [];
    cart.total = 0;
    await cart.save();

    return res
      .status(200)
      .json({
        message: "Checkout successful. Your cart has been cleared.",
        order,
        userName: `${user.firstName} ${user.lastName}`
      });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error during checkout: ${err.message}` });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  viewCart,
  deleteCart,
  updateCart,
  checkout,
};
