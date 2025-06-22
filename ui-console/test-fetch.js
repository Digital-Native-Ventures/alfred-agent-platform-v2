// Simple Node.js test using fetch
async function testUI() {
  console.log('🧪 Testing UI at http://localhost:3001');
  
  try {
    const response = await fetch('http://localhost:3001');
    const html = await response.text();
    
    console.log('📄 Response status:', response.status);
    console.log('📄 Content length:', html.length);
    
    if (html.includes('<div id="root">')) {
      console.log('✅ Root div found');
      
      // Check if there's content in root
      const rootMatch = html.match(/<div id="root">(.*?)<\/div>/s);
      if (rootMatch && rootMatch[1].trim()) {
        console.log('🎯 React content detected in root:', rootMatch[1].substring(0, 100));
      } else {
        console.log('📭 Root div is empty - React might not be rendering');
      }
    }
    
    // Check for script tags
    const scripts = html.match(/<script[^>]*src="[^"]*"[^>]*>/g) || [];
    console.log('📜 Script tags found:', scripts.length);
    
    // Try to fetch the main script
    if (html.includes('/src/main.tsx')) {
      console.log('🔍 Trying to fetch main.tsx...');
      const scriptResponse = await fetch('http://localhost:3001/src/main.tsx');
      const scriptContent = await scriptResponse.text();
      
      if (scriptContent.includes('Error')) {
        console.log('❌ Error in main.tsx script');
        console.log('📜 Script content preview:', scriptContent.substring(0, 500));
      } else {
        console.log('✅ main.tsx loads successfully');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUI();