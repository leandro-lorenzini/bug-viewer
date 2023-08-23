#!/bin/bash

echo "Installing checkov"
pip install -U checkov

echo "Scanning Kubernetes files"
if [ "$FULL_CHECK" = true ]; then
    checkov -d . --framework kubernetes --output json --quiet > ./scanner/tmp/result/__checkov__.json
else
    mkdir -p k8-changed-files
    cp $(git diff --name-only HEAD $(git merge-base HEAD remotes/origin/$BRANCH) | grep -E '\.(yaml|yml)$') k8-changed-files && checkov -d k8-changed-files --framework kubernetes --output json --quiet > ./scanner/tmp/result/__checkov__.json
fi
