const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");
const formModel = require("../models/formModel");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
require("dotenv").config();

//Function to add to cart
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

    // Check stock availability
    let stockAvailable;
    if (size) {
      const sizeDetails = product.sizes.find((s) => s.size === size);
      if (!sizeDetails) {
        return res
          .status(400)
          .json({ message: "Size not found for the product." });
      }

      stockAvailable = sizeDetails.stock;
      if (stockAvailable <= 0) {
        return res.status(400).json({ message: "This size is out of stock." });
      }
    } else {
      stockAvailable = product.stock;
      if (stockAvailable <= 0) {
        return res
          .status(400)
          .json({ message: "This product is out of stock." });
      }
    }

    // Calculate the age of the product
    const productAgeInMinutes =
      (Date.now() - new Date(product.createdAt).getTime()) / 60000;

    // Determine the price to use: regular or discounted based on product age
    let price;
    if (productAgeInMinutes > 2) {
      // If the product is older than 2 minutes, apply the discount if applicable
      if (product.discountPercentage > 0) {
        if (size) {
          const sizeDetails = product.sizes.find((s) => s.size === size);
          price = sizeDetails.price * (1 - product.discountPercentage / 100);
        } else {
          price = product.price * (1 - product.discountPercentage / 100);
        }
      } else if (size) {
        const sizeDetails = product.sizes.find((s) => s.size === size);
        price = sizeDetails.price;
      } else {
        price = product.price;
      }
    } else {
      // If the product is less than or equal to 2 minutes old, use the original price
      if (size) {
        const sizeDetails = product.sizes.find((s) => s.size === size);
        price = sizeDetails.price;
      } else {
        price = product.price;
      }
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
      if (existingItem.quantity + 1 > stockAvailable) {
        return res
          .status(400)
          .json({ message: "Insufficient stock available." });
      }

      existingItem.quantity += 1;
      existingItem.sub_total = price * existingItem.quantity;
    } else {
      // Add a new product to the cart
      const newItem = {
        productId,
        quantity: 1,
        price: price,
        size,
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

const addToCarts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size } = req.body;

    // Check if user is logged in
    let userId = req.user ? req.user.userId : null;
    let guestCartId = null;

    if (!userId) {
      // Handle guest users: generate or retrieve guestCartId
      guestCartId = req.session.guestCartId || new mongoose.Types.ObjectId();
      req.session.guestCartId = guestCartId; // Save guestCartId in session
      console.log("Guest Cart ID:", guestCartId); // Log for debugging
    } else {
      console.log("Logged-in User ID:", userId); // Log for debugging
    }

    // Find the product by ID
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(400).json({ message: "Product not found." });
    }

    // Check stock availability based on size
    let stockAvailable;
    if (size) {
      const sizeDetails = product.sizes.find((s) => s.size === size);
      if (!sizeDetails) {
        return res.status(400).json({ message: "Size not found for the product." });
      }
      stockAvailable = sizeDetails.stock;
    } else {
      stockAvailable = product.stock;
    }

    if (stockAvailable <= 0) {
      return res.status(400).json({ message: "Out of stock." });
    }

    // Determine the price (apply discount if product is older than 2 minutes)
    const productAgeInMinutes = (Date.now() - new Date(product.createdAt).getTime()) / 60000;
    let price = size
      ? product.sizes.find((s) => s.size === size).price
      : product.price;

    if (productAgeInMinutes > 2 && product.discountPercentage > 0) {
      price = price * (1 - product.discountPercentage / 100);
    }

    // Find or create a cart for logged-in or guest users
    let cart;
    if (userId) {
      cart = await cartModel.findOne({ userId: userId });
      if (!cart) {
        cart = new cartModel({ userId: userId, products: [], total: 0 });
      }
    } else {
      cart = await cartModel.findOne({ guestCartId: guestCartId });
      if (!cart) {
        cart = new cartModel({ guestCartId: guestCartId, products: [], total: 0 });
      }
    }

    // Check if the product with the same size is already in the cart
    const existingItem = cart.products.find(
      (item) => item.productId.equals(productId) && item.size === size
    );

    if (existingItem) {
      // Update quantity and subtotal
      if (existingItem.quantity + 1 > stockAvailable) {
        return res.status(400).json({ message: "Insufficient stock available." });
      }
      existingItem.quantity += 1;
      existingItem.sub_total = price * existingItem.quantity;
    } else {
      // Add new product to cart
      const newItem = {
        productId,
        quantity: 1,
        price: price,
        size,
        productName: product.itemName,
        productImage: product.productImage,
        sub_total: price,
      };
      cart.products.push(newItem);
    }

    // Recalculate total
    cart.total = cart.products.reduce((acc, item) => acc + item.sub_total, 0);

    // Save the cart
    await cart.save();

    res.status(200).json({ message: "Item added to cart successfully.", data: cart });
  } catch (err) {
    res.status(500).json({ message: `Error adding to cart: ${err.message}` });
  }
};



//Function to update cart quantity
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
      return res.status(400).json({
        message: "Product with the specified size not found in cart.",
      });
    }

    // Determine the price to use: regular or discounted
    let price = product.price;

    // **Check stock availability**
    if (size) {
      // If the product has sizes, find the size details
      const sizeDetails = product.sizes.find((s) => s.size === size);
      if (!sizeDetails) {
        return res
          .status(400)
          .json({ message: "Size not found for the product." });
      }

      // Check if the requested quantity exceeds the available stock for the size
      if (sizeDetails.stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.itemName} in size ${size}. Only ${sizeDetails.stock} left in stock.`,
        });
      }

      // Use the discounted or regular price for the specific size
      if (product.discountPercentage > 0) {
        price = sizeDetails.price * (1 - product.discountPercentage / 100);
      } else {
        price = sizeDetails.price;
      }
    } else {
      // Check if the requested quantity exceeds the available general stock
      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.itemName}. Only ${product.stock} left in stock.`,
        });
      }

      // Use the discounted or regular general price
      if (product.discountPercentage > 0) {
        price = product.price * (1 - product.discountPercentage / 100);
      } else {
        price = product.price;
      }
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

//Function to remove specific product from cart
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

//Function to view cart contents
const viewCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user's cart
    const cart = await cartModel.findOne({ userId: userId }).populate({
      path: "products.productId",
      select: "itemName description images sizes",
    });

    if (!cart) {
      // If no cart is found, return an empty array with a success message
      return res.status(200).json({
        message: "Cart retrieved successfully.",
        data: {
          products: [],
          total: 0,
        },
      });
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
          productImage: item.productId.images,
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


const viewCarts = async (req, res) => {
  try {
    let userId = req.user ? req.user.userId : null;
    let guestCartId = null;

    if (!userId) {
      guestCartId = req.session.guestCartId;
      if (!guestCartId) {
        console.log("No guestCartId in session"); // Debug log
        return res.status(200).json({
          message: "Cart is empty.",
          data: { products: [], total: 0 },
        });
      }
      console.log("Guest Cart ID:", guestCartId); // Debug log
    } else {
      console.log("Logged-in User ID:", userId); // Debug log
    }

    // Retrieve cart for logged-in or guest user
    let cart;
    if (userId) {
      cart = await cartModel.findOne({ userId: userId }).populate({
        path: "products.productId",
        select: "itemName description productImage sizes",
      });
    } else {
      cart = await cartModel.findOne({ guestCartId: guestCartId }).populate({
        path: "products.productId",
        select: "itemName description productImage sizes",
      });
    }

    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty.",
        data: { products: [], total: 0 },
      });
    }

    // Format the cart products
    const formattedCart = {
      ...cart.toObject(),
      products: cart.products.map((item) => {
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

    res.status(200).json({
      message: "Cart retrieved successfully.",
      data: formattedCart,
    });
  } catch (err) {
    res.status(500).json({ message: `Error retrieving cart: ${err.message}` });
  }
};



//Function clear all contents in a cart
const deleteCart = async (req, res) => {
  try {
    const { userId } = req.params;

    let cart = userId 
      ? await cartModel.findOne({ userId: userId })
      : await cartModel.findOne({ guestCartId: req.session.guestCartId });

    if (!cart) {
      return res.status(400).json({ message: "Cart not found." });
    }

    // Clear all cars from the cart
    cart.cars = [];
    cart.total = 0;

    // Save the cleared cart
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully." });
  } catch (err) {
    res.status(500).json({ message: `Error clearing cart: ${err.message}` });
  }
};


//Function to checkout a cart
const checkout = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel
      .findById(userId)
      .select("firstName lastName email");

    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    let cart = await cartModel.findOne({ userId: userId }).populate({
      path: "products.productId",
      select:
        "itemName description productImage sizes stock price discountPercentage createdAt",
    });

    if (!cart) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const orderProducts = [];

    for (const item of cart.products) {
      const product = item.productId;

      if (!product) {
        throw new Error("Product not found during checkout.");
      }

      const isNew = new Date() - new Date(product.createdAt) < 2 * 60 * 1000;

      let sizeDetails = null;
      let currentPrice = product.price;

      if (product.sizes && product.sizes.length > 0) {
        sizeDetails = product.sizes.find((size) => size.size === item.size);

        if (!sizeDetails) {
          throw new Error(
            `Size ${item.size} not available for ${product.itemName}.`
          );
        }

        if (sizeDetails.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.itemName} in size ${item.size}. Only ${sizeDetails.stock} left in stock.`
          );
        }

        sizeDetails.stock -= item.quantity;
        currentPrice =
          isNew || !product.discountPercentage
            ? sizeDetails.price
            : sizeDetails.price * (1 - product.discountPercentage / 100);
      } else {
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.itemName}. Only ${product.stock} left in stock.`
          );
        }

        product.stock -= item.quantity;
        currentPrice =
          isNew || !product.discountPercentage
            ? product.price
            : product.price * (1 - product.discountPercentage / 100);
      }

      await product.save();

      if (item.price !== currentPrice) {
        throw new Error(
          "Product prices have changed. Please review your cart."
        );
      }

      orderProducts.push({
        productId: product._id,
        itemName: product.itemName,
        productImage: product.productImage,
        size: item.size || "N/A",
        quantity: item.quantity,
        price: currentPrice.toFixed(2),
        sub_total: item.sub_total,
      });
    }

    const order = new orderModel({
      userId: userId,
      products: orderProducts,
      total: cart.total.toFixed(2),
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
    });

    await order.save();

    cart.products = [];
    cart.total = 0;
    await cart.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "docmate24@gmail.com",
      to: user.email,
      subject: "Your Order Confirmation",
      html: `<p>Dear ${user.firstName} ${user.lastName},</p>
      <p>Thank you for your order! Your order has been successfully placed.</p>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Order Summary:</strong></p>
      <ul>
      ${orderProducts
        .map(
          (product) => `
        <li>${product.itemName} - ${product.size} - Quantity: ${
            product.quantity
          } - Price: $${Number(product.price).toLocaleString()}</li>
      `
        )
        .join("")}
      </ul>
      <p><strong>Total:</strong> $${Number(order.total).toLocaleString()}</p>
      <p>We will notify you once your order is shipped.</p>
      <p>Thank you for shopping with us!</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message:
        "Checkout successful. Your cart has been cleared. An email with your order details has been sent.",
      order,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error during checkout: ${err.message}` });
  }
};

const checkouts = async (req, res) => {
  try {
    // Check if the user is logged in by verifying the authorization header
    const hasAuthorization = req.headers.authorization;
    if (!hasAuthorization) {
      return res.status(401).json({
        message: "Please log in to proceed to checkout.",
      });
    }

    const token = hasAuthorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Please log in to proceed to checkout.",
      });
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decodeToken.userId);

    if (!user) {
      return res.status(401).json({
        message: "Please log in to proceed to checkout.",
      });
    }

    // Now that user is authenticated, proceed with the existing checkout logic
    const userId = user._id;

    // Log the cart and userId for debugging
    

    let cart = await cartModel.findOne({ userId }).populate({
      path: "products.productId",
      select:
        "itemName description productImage sizes stock price discountPercentage createdAt",
    });
    console.log("User ID:", userId);
    console.log("Cart:", cart);

    if (!cart) {
      return res.status(400).json({ message: "Your cart is empty." });
    }
    

    const orderProducts = [];

    for (const item of cart.products) {
      const product = item.productId;

      if (!product) {
        throw new Error("Product not found during checkout.");
      }

      const isNew = new Date() - new Date(product.createdAt) < 2 * 60 * 1000;

      let sizeDetails = null;
      let currentPrice = product.price;

      if (product.sizes && product.sizes.length > 0) {
        sizeDetails = product.sizes.find((size) => size.size === item.size);

        if (!sizeDetails) {
          throw new Error(
            `Size ${item.size} not available for ${product.itemName}.`
          );
        }

        if (sizeDetails.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.itemName} in size ${item.size}. Only ${sizeDetails.stock} left in stock.`
          );
        }

        sizeDetails.stock -= item.quantity;
        currentPrice =
          isNew || !product.discountPercentage
            ? sizeDetails.price
            : sizeDetails.price * (1 - product.discountPercentage / 100);
      } else {
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.itemName}. Only ${product.stock} left in stock.`
          );
        }

        product.stock -= item.quantity;
        currentPrice =
          isNew || !product.discountPercentage
            ? product.price
            : product.price * (1 - product.discountPercentage / 100);
      }

      await product.save();

      if (item.price !== currentPrice) {
        throw new Error(
          "Product prices have changed. Please review your cart."
        );
      }

      orderProducts.push({
        productId: product._id,
        itemName: product.itemName,
        productImage: product.productImage,
        size: item.size || "N/A",
        quantity: item.quantity,
        price: currentPrice.toFixed(2),
        sub_total: item.sub_total,
      });
    }

    const order = new orderModel({
      userId: userId,
      products: orderProducts,
      total: cart.total.toFixed(2),
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
    });

    await order.save();

    cart.products = [];
    cart.total = 0;
    await cart.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "docmate24@gmail.com",
      to: user.email,
      subject: "Your Order Confirmation",
      html: `<p>Dear ${user.firstName} ${user.lastName},</p>
      <p>Thank you for your order! Your order has been successfully placed.</p>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Order Summary:</strong></p>
      <ul>
      ${orderProducts
        .map(
          (product) => `
        <li>${product.itemName} - ${product.size} - Quantity: ${
            product.quantity
          } - Price: $${Number(product.price).toLocaleString()}</li>
      `
        )
        .join("")}
      </ul>
      <p><strong>Total:</strong> $${Number(order.total).toLocaleString()}</p>
      <p>We will notify you once your order is shipped.</p>
      <p>Thank you for shopping with us!</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message:
        "Checkout successful. Your cart has been cleared. An email with your order details has been sent.",
      order,
    });
  } catch (err) {
    return res.status(500).json({ message: `Error during checkout: ${err.message}` });
  }
};



// Function to get one order
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if the orderId is a valid ObjectId
    // if (!mongoose.Types.ObjectId.isValid(orderId)) {
    //   return res.status(400).json({ error: "Invalid Order ID" });
    // }

    const order = await orderModel
      .findOne({ orderId })
      .populate("products")
      .populate("userId");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const address = await formModel.findOne({ userId: order.userId });

    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.status(200).json({
      order,
      address,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error: " + error.message });
  }
};

// Function to get all orders
const getAllOrders = async (req, res) => {
  try {
    // Find all orders, populate user and product details if needed
    const orders = await orderModel
      .find()
      .populate("userId")
      .populate("products");

    // Send the list of orders as a response
    res.status(200).json({
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error: " + error.message,
    });
  }
};

//function for users to get ordered products
const getOrderProducts = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order by ID and populate the product details
    const order = await orderModel
      .findOne({ orderId })
      .populate("products.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Return the products in the order
    return res.status(200).json({
      message: "Products retrieved successfully.",
      products: order.products,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error fetching products: ${err.message}` });
  }
};

//function to return product
const returnProduct = async (req, res) => {
  try {
    const {
      orderId,
      productId,
      size,
      quantity,
      reasonForReturn,
      productCondition,
      additionalComments,
    } = req.body;

    // Find the order by ID and populate the product details
    const order = await orderModel
      .findOne({ orderId })
      .populate("products.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Find the product in the order
    const productInOrder = order.products.find((item) => {
      const isSameProduct = item.productId._id.equals(productId);
      const isSameSize = size ? item.size === size : item.size === "N/A";
      return isSameProduct && isSameSize;
    });

    if (!productInOrder) {
      return res
        .status(404)
        .json({ message: "Product not found in this order." });
    }

    // Calculate the total quantity already returned for this product and Check if the quantity is valid across all returns
    // 
    const totalReturnedQuantity = order.returns
      .filter(
        (r) => r.productId.equals(productId) && (size ? r.size === size : true)
      )
      .reduce((total, r) => total + r.quantity, 0);

    const remainingQuantity = productInOrder.quantity - totalReturnedQuantity;

    if (quantity > remainingQuantity) {
      const errorMessage =
        remainingQuantity === 0
          ? `You have no more products to be returned for ${productInOrder.productId.itemName}(s) .`
          : `You can only return ${remainingQuantity} more ${productInOrder.productId.itemName}(s).`;
      return res.status(400).json({ message: errorMessage });
    }

    // Validate the return window (e.g., 30 days from order date)
    const returnWindow = 30 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const orderDate = new Date(order.orderDate);
    const isWithinReturnWindow = now - orderDate <= returnWindow;

    if (!isWithinReturnWindow) {
      return res.status(400).json({ message: "Return period has expired." });
    }

    // Record the return in the order with status "Pending"
    order.returns.push({
      productId: productInOrder.productId._id,
      size: productInOrder.size || "N/A",
      quantity,
      reasonForReturn,
      productCondition,
      additionalComments,
      status: "Pending",
    });

    // Save the updated order
    await order.save();

    return res.status(200).json({
      message: "Return request submitted successfully and is pending approval.",
      returns: order.returns,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error processing return: ${err.message}` });
  }
};

//function to handle return processing
const processReturnRequest = async (req, res) => {
  try {
    const { orderId, returnId } = req.params;
    const { status } = req.body;

    // Validate the status
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Find the order by ID
    const order = await orderModel.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Find the return request by ID
    const returnRequest = order.returns.id(returnId);

    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found." });
    }

    // Update the return request status
    returnRequest.status = status;

    // If the return request is approved, update the stock
    if (status === "Approved") {
      const product = await productModel.findById(returnRequest.productId);

      if (product) {
        if (returnRequest.size) {
          const sizeDetails = product.sizes.find(
            (s) => s.size === returnRequest.size
          );
          if (sizeDetails) {
            sizeDetails.stock =
              Number(sizeDetails.stock) + Number(returnRequest.quantity);
          }
        } else {
          product.stock =
            Number(product.stock) + Number(returnRequest.quantity);
        }

        await product.save();
      }
    }

    await order.save();

    return res.status(200).json({
      message: `Return request has been ${status.toLowerCase()}.`,
      returnRequest,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Error processing return request: ${err.message}`,
    });
  }
};

//function to track order
const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order by tracking ID
    const order = await orderModel.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Assuming you have a field `status` in your order model that tracks the current status
    const statusUpdates = order.statusUpdates || []; //an array of status changes
    const currentStatus = order.status;

    return res.status(200).json({
      message: "Order retrieved successfully.",
      order: {
        products: order.products,
        total: order.total,
        status: currentStatus,
        statusUpdates: statusUpdates,
        movementLogs: order.movementLogs,
        orderDate: order.orderDate,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: `Error tracking order: ${err.message}`,
    });
  }
};

//function to update order movement
const updateOrderMovement = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { location, details, status } = req.body;

    // Find the order by tracking ID
    const order = await orderModel.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Update movement logs
    if (location) {
      order.movementLogs.push({
        location,
        details,
        timestamp: new Date(),
      });
    }

    // Optionally update the status if provided
    if (status && status !== order.status) {
      order.status = status;
      order.statusUpdates.push({
        status,
        timestamp: new Date(),
      });
    }

    // Save the updated order
    await order.save();

    return res.status(200).json({
      message: "Order movement updated successfully.",
      order,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Error updating order movement: ${err.message}`,
    });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  viewCart,
  deleteCart,
  updateCart,
  checkout,
  getOrderDetails,
  getAllOrders,
  getOrderProducts,
  returnProduct,
  processReturnRequest,
  trackOrder,
  updateOrderMovement,
};
