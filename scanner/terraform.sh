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
if [ "$FULL_CHECK" = true ]; then
    tfsec . --format json --out ./scanner/tmp/result/__tfsec__results.json
else
    # Run scanner on changed files only
    mkdir -p tf-changed-files
    cp $(git diff --name-only HEAD $(git merge-base HEAD remotes/origin/$BRANCH) | grep '\.tf$') tf-changed-files && tfsec tf-changed-files --format json --out ./scanner/tmp/result/__tfsec__results.json
fi
