#!/bin/bash

# Install semgrep
echo "Installing semgrep"
pip install semgrep

echo "Scanning files with semgrep"
if [ "$FULL_CHECK" = true ]; then
    semgrep scan . --config ./scanner/semgrep.yml --severity ERROR --severity WARNING --json > ./scanner/tmp/result/__semgrep__.json
else
    modified_files=$(git diff --name-only HEAD $(git merge-base HEAD remotes/origin/$BRANCH))
    semgrep scan $modified_files --config ./scanner/semgrep.yml --severity ERROR --severity WARNING --json > "./scanner/tmp/result/__semgrep__${foldername}_${filename}.json"
fi
