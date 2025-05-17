#!/usr/bin/env python3
"""
Generate docker-compose.yml from individual service compose snippets
"""
import os
import yaml
from pathlib import Path

def load_services():
    """Load the canonical services list"""
    with open('services.yaml', 'r') as f:
        services_data = yaml.safe_load(f)
    
    # Maintain grouped structure for profile assignment
    return services_data

def merge_compose_files(services_data):
    """Merge all service compose snippets into a single compose file"""
    final_compose = {
        'version': '3.8',
        'services': {},
        'networks': {
            'alfred-network': {
                'driver': 'bridge'
            }
        },
        'volumes': {}
    }
    
    services_dir = Path('services')
    
    # Process each service group
    for category, service_list in services_data.items():
        for service_name in service_list:
            compose_file = services_dir / service_name / 'compose.yml'
            
            if compose_file.exists():
                try:
                    with open(compose_file, 'r') as f:
                        service_compose = yaml.safe_load(f)
                    
                    if 'services' in service_compose:
                        # Merge service definition
                        for svc_name, svc_config in service_compose['services'].items():
                            # Add profile based on category
                            if category == 'core':
                                svc_config['profiles'] = ['core', 'full']
                            elif category == 'monitoring':
                                svc_config['profiles'] = ['monitoring', 'full']
                            else:
                                svc_config['profiles'] = [category, 'full']
                            
                            final_compose['services'][svc_name] = svc_config
                    
                    # Merge volumes if defined
                    if 'volumes' in service_compose:
                        final_compose['volumes'].update(service_compose['volumes'])
                
                except Exception as e:
                    print(f"Error reading {compose_file}: {e}")
            else:
                print(f"Warning: No compose.yml found for {service_name}")
    
    # Add common environment extends
    env_extends = {
        '.env-common': {
            'env_file': '.env'
        }
    }
    final_compose = {**env_extends, **final_compose}
    
    return final_compose

def write_compose_file(compose_data, output_file):
    """Write the generated compose file"""
    with open(output_file, 'w') as f:
        yaml.dump(compose_data, f, default_flow_style=False, sort_keys=False)
    print(f"Generated: {output_file}")

def main():
    """Generate the complete docker-compose file"""
    services_data = load_services()
    compose_data = merge_compose_files(services_data)
    
    output_file = 'docker-compose.generated.yml'
    write_compose_file(compose_data, output_file)
    
    # Summary
    print(f"\nSummary:")
    print(f"Total services: {len(compose_data['services'])}")
    print(f"Profiles: {set(svc.get('profiles', [])[0] for svc in compose_data['services'].values() if svc.get('profiles'))}")

if __name__ == '__main__':
    main()