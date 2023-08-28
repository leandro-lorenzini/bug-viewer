#!/bin/bash

# Install tfsec
echo "Installing tfsec"
cd scanner/tmp
wget https://github.com/aquasecurity/tfsec/releases/download/v1.28.1/tfsec-linux-amd64
mv tfsec-linux-amd64 /usr/local/bin/tfsec
chmod +x /usr/local/bin/tfsec
cd ../../

echo "Scanning Terraform files"
# Run scanner on the whole project
tfsec . --format json --out ./scanner/tmp/result/__tfsec__results.json
