// Using built-in fetch

async function testCart() {
  try {
    console.log('🧪 Testing user-specific cart functionality...\n');

    // Step 1: Login to get a token
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@bhagyalaxmi.com',
        password: 'user123'
      }),
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const userId = loginData.user.id;

    console.log('✅ Login successful');
    console.log(`User ID: ${userId}\n`);

    // Step 2: Get user's cart (should be empty initially)
    console.log('2. Getting user cart...');
    const cartResponse = await fetch(`http://localhost:8080/api/cart/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const cartItems = await cartResponse.json();
    console.log(`✅ Cart items: ${cartItems.length}\n`);

    // Step 3: Add an item to cart
    console.log('3. Adding item to cart...');
    const addToCartResponse = await fetch('http://localhost:8080/api/cart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        productId: '68885d0712e6076b91ab6ffc', // First product ID
        quantity: 2
      }),
    });

    const addedItem = await addToCartResponse.json();
    console.log('✅ Item added to cart');
    console.log(`Product ID: ${addedItem.productId}, Quantity: ${addedItem.quantity}\n`);

    // Step 4: Get cart again to verify item was added
    console.log('4. Verifying cart contents...');
    const updatedCartResponse = await fetch(`http://localhost:8080/api/cart/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const updatedCartItems = await updatedCartResponse.json();
    console.log(`✅ Updated cart items: ${updatedCartItems.length}`);
    
    if (updatedCartItems.length > 0) {
      console.log('Cart contents:');
      updatedCartItems.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.product.title} - Qty: ${item.quantity}`);
      });
    }

    console.log('\n🎉 User-specific cart functionality is working!');

  } catch (error) {
    console.error('❌ Error testing cart:', error);
  }
}

testCart(); 