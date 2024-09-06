const orderModel = require("../models/orderModel");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const addToPurchaseHistory = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const purchase = new orderModel({
      userId,
      productId,
      quantity,
    });

    await purchase.save();

    res.status(200).json({
      message: "Product added to purchase history successfully",
      data: purchase,
    });
  } catch (error) {
    console.error("Error adding product to purchase history:", error);
    res.status(500).json({ message: "Internal server error" + error.message });
  }
};

// Route handler to fetch and return the user's purchase history
const viewPurchaseHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const purchaseHistory = await orderModel.find({ userId });
    res.status(200).json({
      success: true,
      data: purchaseHistory,
    });
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error" + error.message,
    });
  }
};

const deletePurchaseHistory = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming the user ID is available in the request object
    const { purchaseHistoryId } = req.params;

    // Find the purchase history entry by ID and user ID
    const purchase = await orderModel.findOneAndDelete({
      _id: purchaseHistoryId,
      userId,
    });

    if (!purchase) {
      return res
        .status(404)
        .json({ message: "Purchase history entry not found" });
    }

    res
      .status(200)
      .json({ message: "Purchase history entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting purchase history entry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPurchaseHistoryEntry = async (req, res) => {
  try {
    const { userId, purchaseHistoryId } = req.params;

    // Fetch the purchase history entry for the user
    const purchaseHistoryEntry = await orderModel.findOne({
      _id: purchaseHistoryId,
      userId,
    });

    if (!purchaseHistoryEntry) {
      return res
        .status(404)
        .json({ message: "Purchase history entry not found" });
    }

    res.status(200).json({
      message: "Purchase history entry retrieved successfully",
      data: purchaseHistoryEntry,
    });
  } catch (error) {
    console.error("Error fetching purchase history entry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Route handler to retrieve and filter purchase history
const getFilteredPurchaseHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    // Filter by user ID
    let query = { userId };

    // Apply additional filters if provided in query parameters
    if (req.query.startDate) {
      // Filter by start date
      query.date = { $gte: req.query.startDate };
    }
    if (req.query.endDate) {
      // Filter by end date
      query.date = { ...query.date, $lte: req.query.endDate };
    }
    // Add more filters as needed

    // Sort the purchase history
    const sortOptions = {};
    if (req.query.sortBy) {
      // Sort by the specified field
      sortOptions[req.query.sortBy] = req.query.sortOrder || "asc";
    }

    // Fetch and return filtered/sorted purchase history
    const orderModel = await orderModel.find(query).sort(sortOptions);
    res.status(200).json({
      message: "Filtered and sorted purchase history",
      data: orderModel,
    });
  } catch (error) {
    console.error("Error retrieving purchase history:", error);
    res.status(500).json({ message: "Internal server error" + error.message });
  }
};

const getPurchaseHistoryCSV = async (req, res) => {
  try {
    // Fetch purchase history data from the database
    const purchaseHistory = await orderModel
      .find({
        userId: req.user.userId,
      })
      .populate("products.productId");

    // Debug: Log purchaseHistory to verify the structure
    console.log("Purchase History:", JSON.stringify(purchaseHistory, null, 2));

    // Define the CSV header and keys
    const csvHeader = [
      { id: "orderId", title: "Order ID" },
      { id: "productId", title: "Product ID" },
      //{ id: "itemName", title: "Product Name" }, // Optional: Include product name
      { id: "quantity", title: "Quantity" },
    ];

    const csvData = [];

    purchaseHistory.forEach((order) => {
      order.products.forEach((product) => {
        csvData.push({
          orderId: order.orderId,
          productId: product.productId,
          //itemName: product.productId.itemName,
          quantity: product.quantity,
        });
      });
    });
    // Define the file path (ensure downloads folder exists)
    const downloadsDir = path.join(__dirname, "..", "downloads"); // Adjust to the proper relative path
    const filePath = path.join(downloadsDir, "purchase-history.csv");

    // Check if the downloads folder exists, and if not, create it
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    // Create a CSV writer instance with the header
    const csvWriter = createCsvWriter({
      path: filePath,
      header: csvHeader,
    });

    // Write purchase history data to a CSV file
    await csvWriter.writeRecords(csvData);

    // Send the CSV file as a response
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error retrieving purchase history:", error);
    res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const getPurchaseHistoryPDF = async (req, res) => {
  try {
    // Fetch purchase history data from the database
    const purchaseHistory = await orderModel.find({ userId: req.user.userId });
    console.log("Purchase History Data:", purchaseHistory);


    // Create a new PDF document
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="purchase-history.pdf"'
    );

    

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add purchase history data to the PDF document
    doc.fontSize(14).text("Purchase History", { align: "center" }).moveDown();
    purchaseHistory.forEach((purchase, index) => {
        doc.text(`Order ID: ${purchase.orderId}`);
        
        // Loop through each product in the order
        purchase.products.forEach((product) => {
          doc.text(`Product ID: ${product.productId}`);
          doc.text(`Item Name: ${product.itemName}`);
          doc.text(`Quantity: ${product.quantity}`);
          doc.text(`Price: $${product.price}`);
          doc.moveDown();
        });
      })

    // Finalize the PDF document
    doc.end();
  } catch (error) {
    console.error("Error retrieving purchase history:", error);
    res.status(500).json({ message: "Internal server error" + error.message });
  }
};

const reorderItems = async (req, res) => {
  try {
    const { userId, productIds } = req.body;

    // Fetch the user's current cart items from the database
    let userCart = await Cart.findOne({ userId });

    // If the user's cart doesn't exist, create a new one
    if (!userCart) {
      userCart = new Cart({ userId, items: [] });
    }

    // Add the selected items to the user's cart
    userCart.items.push(
      ...productIds.map((productId) => ({ productId, quantity: 1 }))
    );

    // Save the updated cart in the database
    await userCart.save();

    res
      .status(200)
      .json({ message: "Items added to cart successfully", data: userCart });
  } catch (error) {
    console.error("Error adding items to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addToPurchaseHistory,
  viewPurchaseHistory,
  deletePurchaseHistory,
  getPurchaseHistoryEntry,
  getFilteredPurchaseHistory,
  getPurchaseHistoryCSV,
  getPurchaseHistoryPDF,
};
