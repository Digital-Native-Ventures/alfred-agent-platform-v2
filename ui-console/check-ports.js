// Test server accessibility on common ports
const ports = [3000, 3001, 5173]; // 5173 is Vite's default

async function checkPorts() {
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      console.log(`✅ Port ${port} is accessible`);
      return port;
    } catch (e) {
      console.log(`❌ Port ${port} not accessible`);
    }
  }
  return null;
}

checkPorts().then(port => {
  if (port) {
    console.log(`\n🎯 Server found on port ${port}`);
    console.log(`Run: npm run dev -- --port 3000 to use port 3000`);
  } else {
    console.log('\n⚠️ No dev server found. Please run:');
    console.log('cd ui-console && npm run dev -- --port 3000');
  }
});
