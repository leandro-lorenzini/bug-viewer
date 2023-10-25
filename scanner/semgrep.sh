#!/bin/bash

# Install semgrep
echo "Installing semgrep"
pip install semgrep

echo "Scanning files with semgrep"
if [ "$FULL_CHECK" = true ]; then
    semgrep scan . --config ./scanner/semgrep.yml --exclude='*.js' --exclude='*.py' --severity ERROR --severity WARNING --json > ./scanner/tmp/result/__semgrep__.json
else
    semgrep scan $MODIFIED_FILES --config ./scanner/semgrep.yml --severity ERROR --severity WARNING --json > "./scanner/tmp/result/__semgrep__${foldername}_${filename}.json"
fi
