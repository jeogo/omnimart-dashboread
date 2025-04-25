import axios from 'axios';

// Configuration
const API_URL = 'https://omnimart-api.onrender.com/api';

let categoryId: string;
let productId: string;

const testData: Record<string, any> = {
  category: {
    name: 'Test Category',
    description: 'A test category'
  },
  product: {
    name: 'Test Product',
    description: 'A test product',
    price: 19.99,
    stock: 10,
    imageUrl: 'test-image.jpg'
    // category will be set dynamically
  },
  order: {
    customerName: 'Test Customer',
    customerPhone: '1234567890',
    wilaya: 'Test City',
    baladia: 'Test Baladia',
    products: [
      // Will be set dynamically after product creation
    ],
    totalAmount: 39.98,
    shippingCost: 5.00,
    status: 'pending'
  },
  discount: {
    code: 'TEST10',
    percentage: 10,
    expiresAt: new Date(Date.now() + 86400000)
  }
};

// Helper to write to the results file
let results = '';
const appendResult = (text: string) => {
  results += text + '\n';
  console.log(text);
};

const initTest = async () => {
  try {
    const categoryResponse = await axios.post(`${API_URL}/categories`, testData.category);
    categoryId = categoryResponse.data._id;
    testData.product.category = categoryId;
    appendResult(`✅ Created initial category with ID: ${categoryId} for product tests`);

    const productResponse = await axios.post(`${API_URL}/products`, testData.product);
    productId = productResponse.data._id;
    appendResult(`✅ Created initial product with ID: ${productId} for order tests`);

    testData.order.products = [
      {
        product: productId,
        productName: testData.product.name,
        price: testData.product.price,
        quantity: 2
      }
    ];
  } catch (error: any) {
    appendResult(`❌ Error creating initial category/product: ${error.message}`);
    if (error.response) {
      appendResult(`Status: ${error.response.status}`);
      appendResult(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw new Error('Failed to initialize test data');
  }
};

const runTests = async () => {
  appendResult('Starting API Endpoint Tests');
  appendResult('==============================');
  try {
    await initTest();

    // Add endpoint info for products
    appendResult(`\n=== Endpoint: /api/products ===`);
    appendResult(`Description: Products endpoint. Supports CRUD operations for products. Each product belongs to a category and may have a discount.`);
    appendResult(`Methods:`);
    appendResult(`  - GET /api/products (get all)`);
    appendResult(`  - GET /api/products/:id (get by id)`);
    appendResult(`  - POST /api/products (create)`);
    appendResult(`  - PUT /api/products/:id (update)`);
    appendResult(`  - DELETE /api/products/:id (delete)`);
    appendResult(`\n-----Testing products CRUD operations-----`);

    // CREATE
    appendResult(`POST products - Creating new product`);
    const createResponse = await axios.post(`${API_URL}/products`, testData.product);
    const resourceId = createResponse.data._id;
    appendResult(`✅ Created product with ID: ${resourceId}`);
    appendResult(`Response Status: ${createResponse.status}`);
    appendResult(`Response JSON: ${JSON.stringify(createResponse.data, null, 2)}`);

    // READ ALL
    appendResult(`GET products - Getting all products`);
    const getAllResponse = await axios.get(`${API_URL}/products`);
    appendResult(`✅ Retrieved ${getAllResponse.data.length} products`);
    appendResult(`Response Status: ${getAllResponse.status}`);
    appendResult(`Response JSON: ${JSON.stringify(getAllResponse.data, null, 2)}`);

    // READ ONE
    appendResult(`GET products/${resourceId} - Getting single product`);
    const getOneResponse = await axios.get(`${API_URL}/products/${resourceId}`);
    appendResult(`✅ Retrieved product`);
    appendResult(`Response Status: ${getOneResponse.status}`);
    appendResult(`Response JSON: ${JSON.stringify(getOneResponse.data, null, 2)}`);

    // UPDATE
    appendResult(`PUT products/${resourceId} - Updating product`);
    const updateData = { ...testData.product, name: 'Updated Test Product' };
    const updateResponse = await axios.put(`${API_URL}/products/${resourceId}`, updateData);
    appendResult(`✅ Updated product`);
    appendResult(`Response Status: ${updateResponse.status}`);
    appendResult(`Response JSON: ${JSON.stringify(updateResponse.data, null, 2)}`);

    // DELETE
    appendResult(`DELETE products/${resourceId} - Deleting product`);
    const deleteResponse = await axios.delete(`${API_URL}/products/${resourceId}`);
    appendResult(`✅ Deleted product`);
    appendResult(`Response Status: ${deleteResponse.status}`);
    appendResult(`Response JSON: ${JSON.stringify(deleteResponse.data, null, 2)}`);

    // Cleanup - delete the initial product and category we created
    if (productId) {
      await axios.delete(`${API_URL}/products/${productId}`);
      appendResult(`\n✅ Cleaned up initial product: ${productId}`);
    }
    if (categoryId) {
      await axios.delete(`${API_URL}/categories/${categoryId}`);
      appendResult(`\n✅ Cleaned up initial category: ${categoryId}`);
    }
  } catch (err: any) {
    appendResult(`\n❌ Test initialization failed: ${err.message}`);
  }
};

runTests().catch(err => {
  appendResult(`Fatal error: ${err.message}`);
});
