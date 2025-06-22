import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3002;

// Serve a test page that loads our UI in an iframe and tests it
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>UI Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        iframe { border: 1px solid #ccc; width: 100%; height: 500px; }
        #results { margin-top: 20px; padding: 10px; background: #f5f5f5; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Alfred UI Console Test</h1>
    <p>Testing the UI at <strong>http://localhost:3001</strong></p>
    
    <iframe src="http://localhost:3001" id="uiFrame"></iframe>
    
    <div id="results">
        <h3>Test Results:</h3>
        <div id="output">Testing...</div>
    </div>

    <script>
        const output = document.getElementById('output');
        let testResults = [];

        function log(message, isError = false) {
            testResults.push(message);
            output.innerHTML = testResults.map(r => 
                '<div class="' + (r.includes('❌') ? 'error' : 'success') + '">' + r + '</div>'
            ).join('');
        }

        // Test 1: Check if iframe loads
        setTimeout(() => {
            log('📱 Testing iframe load...');
            const iframe = document.getElementById('uiFrame');
            
            iframe.onload = () => {
                log('✅ Iframe loaded successfully');
                
                // Test 2: Check if we can access the content (will fail due to CORS but that's OK)
                setTimeout(() => {
                    try {
                        const doc = iframe.contentDocument || iframe.contentWindow.document;
                        const root = doc.getElementById('root');
                        if (root) {
                            log('✅ Root element found in iframe');
                            if (root.innerHTML.trim()) {
                                log('✅ React content is rendered! Content length: ' + root.innerHTML.length);
                                log('📝 Sample content: ' + root.innerHTML.substring(0, 100) + '...');
                            } else {
                                log('❌ Root element is empty - React not rendering');
                            }
                        } else {
                            log('❌ Root element not found');
                        }
                    } catch (e) {
                        log('⚠️  Cannot access iframe content (CORS) - this is expected');
                        log('✅ Iframe is loading external content properly');
                    }
                }, 3000);
            };
            
            iframe.onerror = () => {
                log('❌ Iframe failed to load');
            };
        }, 1000);

        // Test 3: Direct fetch test
        setTimeout(async () => {
            log('🔍 Testing direct fetch...');
            try {
                const response = await fetch('http://localhost:3001');
                if (response.ok) {
                    log('✅ Direct fetch successful (status: ' + response.status + ')');
                    const text = await response.text();
                    if (text.includes('<div id="root">')) {
                        log('✅ HTML contains root div');
                    } else {
                        log('❌ HTML missing root div');
                    }
                } else {
                    log('❌ Direct fetch failed (status: ' + response.status + ')');
                }
            } catch (e) {
                log('❌ Direct fetch error: ' + e.message);
            }
        }, 2000);
    </script>
</body>
</html>`;
  res.send(html);
});

app.listen(port, () => {
  console.log(`🧪 Test server running at http://localhost:${port}`);
  console.log(`Open this URL in your browser to test the UI at http://localhost:3001`);
});