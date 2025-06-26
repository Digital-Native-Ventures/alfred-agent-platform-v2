#!/bin/bash
# Simulate architect approval for n8n workflow

echo "🔍 Finding waiting workflows..."

# Get the execution ID of the waiting workflow
# Note: This requires n8n API access or manual inspection

echo "To approve a waiting workflow:"
echo "1. Go to n8n Executions: http://localhost:5678/executions"
echo "2. Click on the 'Waiting' execution"
echo "3. Click on the 'Wait for Approval' node"
echo "4. Find the 'resumeUrl' in the output"
echo "5. Copy and call that URL"
echo ""
echo "Example:"
echo "curl -X GET 'http://localhost:5678/webhook-waiting/EXECUTION_ID/SUFFIX'"
echo ""
echo "Or for testing, you can:"
echo "- Stop the execution manually"
echo "- Remove the Wait node temporarily"
echo "- Or configure the Wait node with a timeout"