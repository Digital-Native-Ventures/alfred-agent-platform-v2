import { chromium } from 'playwright';

async function testUI() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🧪 Testing UI at http://localhost:3001');
    
    // Navigate to the page
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    // Wait for React to render
    await page.waitForTimeout(2000);
    
    // Check if React has rendered content
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Check if root div has content
    const rootContent = await page.locator('#root').innerHTML();
    console.log('🎯 Root content length:', rootContent.length);
    
    if (rootContent.length > 50) {
      console.log('✅ React app appears to be rendered');
      console.log('📝 Sample content:', rootContent.substring(0, 200) + '...');
    } else {
      console.log('❌ React app not rendered - only basic HTML');
      console.log('📝 Root content:', rootContent);
    }
    
    // Check for any JavaScript errors
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => logs.push(`ERROR: ${err.message}`));
    
    // Reload to capture any startup errors
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    if (logs.length > 0) {
      console.log('📋 Console logs:');
      logs.forEach(log => console.log('  ', log));
    }
    
    // Try to find specific React components
    const sidebar = await page.locator('[data-testid="sidebar"], .sidebar, nav').first();
    const sidebarExists = await sidebar.count() > 0;
    console.log('🗂️  Sidebar component found:', sidebarExists);
    
    // Take a screenshot for inspection
    await page.screenshot({ path: 'ui-test-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as ui-test-screenshot.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testUI();