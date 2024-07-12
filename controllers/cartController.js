const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');


const addToCart = async (req, res) => {
    try {
        // Extract userId and productId from request parameters
        const { userId, productId } = req.params;

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

        // Find the user's cart or create a new one if it doesn't exist
        let cart = await cartModel.findOne({ userId: userId });
        if (!cart) {
            cart = new cartModel({ userId: user._id, products: [], total: 0 });
        }

        // Check if the product is already in the cart
        const existingItem = cart.products.find(item => item.productId.equals(productId));

        if (existingItem) {
            // Update the quantity and subtotal of the existing item
            existingItem.quantity += 1;
            existingItem.sub_total = product.price * existingItem.quantity;
        } else {
            // Add a new product to the cart
            const newItem = {
                productId,
                quantity: 1,
                price: product.price,
                productName: product.itemName,
                productImage: product.productImage,
                sub_total: product.price
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
        // Handle any errors that occur during the process
        res.status(500).json({ message: `Error adding to cart: ${err.message}` });
    }
};


const removeFromCart = async (req, res) => {
    try {
        // Extract userId and productId from request parameters
        const { userId, productId } = req.params;

        // Find the cart associated with the user
        const cart = await cartModel.findOne({ userId: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find the index of the product to be removed
        const productIndex = cart.products.findIndex(item => item.productId.equals(productId));

        // return an error If the product is not in the cart
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Remove the product from the cart
        cart.products.splice(productIndex, 1);

        // Recalculate the total price for all items in the cart
        cart.total = cart.products.reduce((acc, item) => acc + item.sub_total, 0);

        // Save the updated cart
        await cart.save();

        // Send a success response with the updated cart
        res.status(200).json({ message: 'Product removed from cart successfully', data: cart });
    } catch (err) {
        // Handle any errors that occur and send a 500 status response
        res.status(500).json({ message: `Error removing product from cart: ${err.message}` });
    }
};


const viewCart = async (req, res) => {
    try {
        const { userId } = req.user
        const { cartId } = req.params
        let getCart;
        getCart = await cartModel.findOne({ userId: userId })
        if (!getCart) {
            return res.status(404).json({ message: 'cannot find cart' })
        }
        res.status(200).json(getCart)


    } catch (err) {
        // Handle any errors that occur during the process
        res.status(500).json({ message: `Error viewing cart: ${err.message}` });
    }
}

const deleteCart = async (req, res) => {
    try {
        const { userId } = req.params
        let cart = await cartModel.findOneAndDelete({ userId: userId })

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" })
        }
        res.status(200).json({ message: "Cart deleted successfully." })

    } catch (err) {
        // Handle any errors that occur during the process
        res.status(500).json({ message: `Error removing from cart: ${err.message}` });
    }

}


module.exports = {
    addToCart,
    removeFromCart,
    viewCart,
    deleteCart
}
