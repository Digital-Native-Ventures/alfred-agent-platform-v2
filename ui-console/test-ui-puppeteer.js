import puppeteer from 'puppeteer';

async function testUI() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🧪 Testing UI at http://localhost:3001');
    
    // Capture console logs and errors
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => logs.push(`ERROR: ${err.message}`));
    
    // Navigate to the page
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Wait for React to render
    await page.waitForTimeout(3000);
    
    // Check page title
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Check if root div has content
    const rootContent = await page.$eval('#root', el => el.innerHTML).catch(() => '');
    console.log('🎯 Root content length:', rootContent.length);
    
    if (rootContent.length > 100) {
      console.log('✅ React app appears to be rendered');
      // Look for specific React components
      const hasLayout = rootContent.includes('sidebar') || rootContent.includes('nav') || rootContent.includes('Layout');
      console.log('🗂️  Layout components detected:', hasLayout);
    } else {
      console.log('❌ React app not rendered properly');
      console.log('📝 Root content:', rootContent.substring(0, 500));
    }
    
    // Check for specific elements
    const elements = await page.evaluate(() => {
      return {
        hasRoot: !!document.getElementById('root'),
        hasReactElements: document.querySelectorAll('[data-reactroot], [data-react-]').length > 0,
        totalElements: document.querySelectorAll('*').length,
        bodyClasses: document.body.className,
        scripts: Array.from(document.scripts).map(s => s.src || 'inline').slice(-3)
      };
    });
    
    console.log('🔍 Element analysis:', elements);
    
    // Print console logs
    if (logs.length > 0) {
      console.log('📋 Console logs:');
      logs.forEach(log => console.log('  ', log));
    } else {
      console.log('📋 No console errors detected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testUI();