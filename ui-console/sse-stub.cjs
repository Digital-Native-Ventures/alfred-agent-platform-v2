const http = require('http');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/sse/stream' && req.method === 'GET') {
    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let counter = 0;
    
    // Send initial message
    res.write(`data: ${JSON.stringify({ type: 'chunk', content: 'Hello! I am the Architect Assistant. ' })}\n\n`);

    // Send chunks every second
    const interval = setInterval(() => {
      counter++;
      const chunk = {
        type: 'chunk',
        content: `This is message chunk ${counter}. `
      };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      
      // End after 5 chunks
      if (counter >= 5) {
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        clearInterval(interval);
        res.end();
      }
    }, 1000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(interval);
    });
  } else if (req.url === '/sse/stream' && req.method === 'POST') {
    // Handle POST request
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('Received message:', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`SSE stub server running at http://localhost:${PORT}/sse/stream`);
});