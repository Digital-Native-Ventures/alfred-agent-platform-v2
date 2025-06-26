#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, '.')

# Add the app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

try:
    from architect_app import app
    print("=== Architect API Routes ===\n")
    
    routes = []
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            for method in route.methods:
                if method != 'HEAD':
                    routes.append(f'{method.ljust(8)} {route.path}')
        elif hasattr(route, 'path'):
            routes.append(f'MOUNT    {route.path}')
    
    for route in sorted(routes):
        print(route)
        
except Exception as e:
    print(f"Error loading routes: {e}")
    
    # Try to manually inspect the files
    print("\n=== Manual Route Analysis ===")
    
    # Read architect_app.py
    with open('architect_app.py', 'r') as f:
        content = f.read()
        
    # Extract endpoint patterns
    import re
    
    # Find @app.route patterns
    app_routes = re.findall(r'@app\.(get|post|put|delete|patch|options)\(["\']([^"\']+)["\']', content)
    
    print("Main app routes:")
    for method, path in app_routes:
        print(f"  {method.upper().ljust(8)} {path}")
    
    # Look for router includes
    router_includes = re.findall(r'app\.include_router\(([^)]+)\)', content)
    print(f"\nRouter includes: {router_includes}")
    
    # Try to read router files
    router_files = ['app/routers/chat.py', 'app/routers/plan.py']
    
    for router_file in router_files:
        if os.path.exists(router_file):
            print(f"\n=== {router_file} ===")
            with open(router_file, 'r') as f:
                router_content = f.read()
            
            # Find router prefix
            prefix_match = re.search(r'APIRouter\([^)]*prefix=["\']([^"\']+)["\']', router_content)
            prefix = prefix_match.group(1) if prefix_match else ""
            
            # Find routes
            router_routes = re.findall(r'@router\.(get|post|put|delete|patch|options)\(["\']([^"\']+)["\']', router_content)
            
            for method, path in router_routes:
                full_path = prefix + path if path != "/" else prefix
                print(f"  {method.upper().ljust(8)} {full_path}")