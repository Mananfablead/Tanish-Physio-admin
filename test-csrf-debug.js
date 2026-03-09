/**
 * Test CSRF Token Flow for Admin Panel
 * Run this in browser console to debug CSRF issues
 */

// Test 1: Check if CSRF token is being fetched
console.log('=== CSRF Token Debug Test ===');

async function testCsrfToken() {
  try {
    console.log('1. Fetching CSRF token...');
    
    const response = await fetch('http://localhost:5000/api/csrf-token', {
      method: 'GET',
      credentials: 'include', // Important!
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('2. Response status:', response.status);
    console.log('3. Response headers:', [...response.headers.entries()]);
    
    // Check cookies
    console.log('4. Cookies sent:', document.cookie);
    
    const data = await response.json();
    console.log('5. Response data:', data);
    
    if (data.success) {
      console.log('✅ CSRF token fetched successfully:', data.csrfToken);
      
      // Store in sessionStorage
      sessionStorage.setItem('csrfToken', data.csrfToken);
      console.log('✅ Token stored in sessionStorage');
      
      // Test 2: Make a POST request with CSRF token
      console.log('\n6. Testing POST request with CSRF token...');
      
      const testResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': data.csrfToken,
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123',
          appType: 'admin'
        }),
      });
      
      console.log('7. POST Response status:', testResponse.status);
      const testData = await testResponse.json();
      console.log('8. POST Response data:', testData);
      
      if (testData.message?.includes('CSRF')) {
        console.error('❌ CSRF validation failed!');
        console.error('Error:', testData.message);
      } else {
        console.log('✅ Request successful (or failed for other reason)');
      }
      
    } else {
      console.error('❌ Failed to get CSRF token');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testCsrfToken();

// Helper: Clear CSRF token
window.clearCsrfToken = () => {
  sessionStorage.removeItem('csrfToken');
  console.log('✅ CSRF token cleared from sessionStorage');
};

// Helper: Check current state
window.checkCsrfState = () => {
  console.log('Current CSRF token in sessionStorage:', sessionStorage.getItem('csrfToken'));
  console.log('Current cookies:', document.cookie);
};

console.log('\n=== Helper Functions Available ===');
console.log('window.clearCsrfToken() - Clear CSRF token');
console.log('window.checkCsrfState() - Check current state');
console.log('testCsrfToken() - Run full test');
