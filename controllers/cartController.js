const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");



const addToCartss = async (req, res) => {
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
        return res.status(400).json({ message: "Size not found for the product." });
      }

      stockAvailable = sizeDetails.stock;
      if (stockAvailable <= 0) {
        return res.status(400).json({ message: "This size is out of stock." });
      }
    } else {
      stockAvailable = product.stock;
      if (stockAvailable <= 0) {
        return res.status(400).json({ message: "This product is out of stock." });
      }
    }

    // Determine the price to use: regular or discounted
    let price = product.price;

    // If the product has a discount, calculate the discounted price
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
        return res.status(400).json({ message: "Insufficient stock available." });
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
    res.status(200).json({ message: "Item added to cart successfully.", data: cart });
  } catch (err) {
    res.status(500).json({ message: `Error adding to cart: ${err.message}` });
  }
};
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
        return res.status(400).json({ message: "Size not found for the product." });
      }

      stockAvailable = sizeDetails.stock;
      if (stockAvailable <= 0) {
        return res.status(400).json({ message: "This size is out of stock." });
      }
    } else {
      stockAvailable = product.stock;
      if (stockAvailable <= 0) {
        return res.status(400).json({ message: "This product is out of stock." });
      }
    }

    // Calculate the age of the product
    const productAgeInMinutes = (Date.now() - new Date(product.createdAt).getTime()) / 60000;

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
        return res.status(400).json({ message: "Insufficient stock available." });
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
        return res.status(400).json({ message: "Size not found for the product." });
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

//Function clear all contents in a cart
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

//Function to checkout a cart
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
      select: "itemName description productImage sizes stock price discountPercentage createdAt",
    });

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const orderProducts = [];

    // Use for...of to ensure sequential execution
    for (const item of cart.products) {
      const product = item.productId;

      if (!product) {
        throw new Error("Product not found during checkout.");
      }

      // Check if the product is new (less than 2 minutes old)
      const isNew = (new Date() - new Date(product.createdAt)) < 2 * 60 * 1000;

      // Handle sizes if applicable
      let sizeDetails = null;
      let currentPrice = product.price; // Default to general price

      if (product.sizes && product.sizes.length > 0) {
        sizeDetails = product.sizes.find((size) => size.size === item.size);

        if (!sizeDetails) {
          throw new Error(
            `Size ${item.size} not available for ${product.itemName}.`
          );
        }

        // Validate and update stock for the selected size
        if (sizeDetails.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.itemName} in size ${item.size}. Only ${sizeDetails.stock} left in stock.`
          );
        }

        // Deduct the stock from the size-specific stock
        sizeDetails.stock -= item.quantity;

        // Calculate the current price for the selected size
        currentPrice = isNew || !product.discountPercentage
          ? sizeDetails.price // Use original price if new or no discount
          : sizeDetails.price * (1 - product.discountPercentage / 100);
      } else {
        // Validate and update general stock if no sizes are available
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.itemName}. Only ${product.stock} left in stock.`
          );
        }

        // Deduct stock from the general product stock
        product.stock -= item.quantity;

        // Calculate the current price for the product without sizes
        currentPrice = isNew || !product.discountPercentage
          ? product.price // Use original price if new or no discount
          : product.price * (1 - product.discountPercentage / 100);
      }

      // Save the updated product (whether size-specific or general stock)
      await product.save();

      // Ensure that the stored price is still correct
      if (item.price !== currentPrice) {
        throw new Error("Product prices have changed. Please review your cart.");
      }

      // Push product details to orderProducts array
      orderProducts.push({
        productId: product._id,
        itemName: product.itemName,
        productImage: product.productImage,
        size: item.size || "N/A",
        quantity: item.quantity,
        price: currentPrice,
        sub_total: item.sub_total,
      });
    }

    // Create the order
    const order = new orderModel({
      userId: userId,
      products: orderProducts,
      total: cart.total,
      userName: `${user.firstName} ${user.lastName}`,
    });

    // Save the order to the database
    await order.save();

    // Clear the cart
    cart.products = [];
    cart.total = 0;
    await cart.save();

    return res.status(200).json({
      message: "Checkout successful. Your cart has been cleared.",
      order,
    });
  } catch (err) {
// Handle specific error messages
const specificErrors = [
  "Product prices have changed. Please review your cart.",
  "Product not found during checkout.",
  "Insufficient stock for"
];

// If the error message is one of the specific errors, return it as is
if (specificErrors.some((error) => err.message.startsWith(error))) {
  return res.status(400).json({ message: err.message });
}

    return res
      .status(500)
      .json({ message: `Error during checkout: ${err.message}` });
  }
};

const express = require('express');
const { Country, State, City } = require('country-state-city');
const app = express();

// Get all countries
app.get('/api/countries', (req, res) => {
  const countries = Country.getAllCountries();
  res.json(countries);
});

// Get states by country code
app.get('/api/countries/:countryCode/states', (req, res) => {
  const { countryCode } = req.params;
  const states = State.getStatesOfCountry(countryCode);
  res.json(states);
});

// Get cities by state code
app.get('/api/countries/:countryCode/states/:stateCode/cities', (req, res) => {
  const { stateCode } = req.params;
  const cities = City.getCitiesOfState(stateCode);
  res.json(cities);
});










module.exports = {
  addToCart,
  removeFromCart,
  viewCart,
  deleteCart,
  updateCart,
  checkout,
};
