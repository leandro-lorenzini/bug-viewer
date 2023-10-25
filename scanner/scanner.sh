#!/bin/bash

# This is the default scanner that we prepared during the project
# The logic unde the Scanners should be modified according to your
# needs, new scanners can also be added.
# If you are implementing an opensource scanner, or make any improvements
# to an existing scanner, also submit a pull request with your changes as 
# that can help other people.

cd ..
directory="scanner/tmp/result/"
mkdir -p "$directory"

# Even though the server has the option to ignore findings on non-changed files
# it's still a good idea to only scan mofied files for performance and cost
# saving reasons.
# We tipically only run full scans for periodic scanning under the main/master brwnch.

if [ "$FULL_CHECK" = true ]; then
    # Check which scanners we should run according to the project files.
    tf=$(find . -name '*.tf' -type f -print -quit | grep -q . && echo true || echo false)
    k8=$(find . \( -name 'deployment.yaml' -o -name 'deployment.yml' -o -name 'deploy.yaml' -o -name 'deploy.yml' -o -name 'kustomization.yaml' -o -name 'kustomization.yml' \) -type f -print -quit | grep -q . && echo true || echo false)
    js=$(find . -name 'package.json' -type f -print -quit | grep -q . && echo true || echo false)
    py=$(find . -name '*.py' -type f -print -quit | grep -q . && echo true || echo false)
    go=$(find . -name '*.go' -type f -print -quit | grep -q . && echo true || echo false)
    docker=$(find . -name 'Dockerfile' -type f -print -quit | grep -q . && echo true || echo false)
else
    # (Non) full checks are generally used during pull requests
    echo "Files modified in this branch:"
    git diff --name-status HEAD $(git merge-base HEAD remotes/origin/$BRANCH) | awk '$1 != "A" { print $2 }'
    export MODIFIED_FILES=$(git diff --name-status HEAD $(git merge-base HEAD remotes/origin/$BRANCH) | awk '$1 != "A" { print $2 }')

    # Check which scanners we should run according to the changed files.
    tf=$(echo "$MODIFIED_FILES" | grep -c '\.tf$' | grep -q '^0$' || echo true)
    k8=$(echo "$MODIFIED_FILES" | egrep -c 'deployment.yaml$|deployment.yml$|deploy.yaml$|deploy.yml$|kustomization.yaml$|kustomization.yml$' | grep -q '^0$' || echo true)
    js=$(echo "$MODIFIED_FILES" | grep -c '\.\(js\|jsx\)$' | grep -q '^0$' || echo true)
    py=$(echo "$MODIFIED_FILES" | grep -c '\.py$' | grep -q '^0$' || echo true)
    go=$(echo "$MODIFIED_FILES" | grep -c '\.go$' | grep -q '^0$' || echo true)
    docker=$(echo "$MODIFIED_FILES" | grep -c 'Dockerfile$' | grep -q '^0$' || echo true)
fi

bash ./scanner/semgrep.sh

# GOLANG SCANNING
if [ "$go" = "true" ]; then
    bash ./scanner/golang.sh
    if ! ls "$directory"*__gosec__* 1> /dev/null 2>&1; then
        echo "No files containing '__gosec__' found in the results directory."
        exit 1
    fi
fi

# DOCKER IMAGE SCANNING
if [ "$docker" = "true" ]; then
    bash ./scanner/docker.sh
    if ! ls "$directory"*__grype__* 1> /dev/null 2>&1; then
        echo "Error: No files containing '__grype__' found in the results directory."
    fi
fi

# JAVASCRIPT SCANNING
if [ "$js" = "true" ]; then
    bash ./scanner/javascript.sh
    if ! ls "$directory"*__eslint__* 1> /dev/null 2>&1; then
        echo "No files containing '__eslint__' found in the results directory."
        exit 1
    fi
fi

# PYTHON SCANNING
if [ "$py" = "true" ]; then
    bash ./scanner/python.sh
    if ! ls "$directory"*__bandit__* 1> /dev/null 2>&1; then
        echo "No files containing '__bandit__' found in the results directory."
        exit 1
    fi
fi

# TERRAFORM SCANNING
if [ "$tf" = "true" ]; then
    bash ./scanner/terraform.sh
    if ! ls "$directory"*__tfsec__* 1> /dev/null 2>&1; then
        echo "No files containing '__tfsec__' found in the results directory."
        exit 1
    fi
fi

# KUBERNETES SCANNING
if [ "$k8" = "true" ]; then
    bash ./scanner/kubernetes.sh
    if ! ls "$directory"*__checkov__* 1> /dev/null 2>&1; then
        echo "No files containing '__checkov__' found in the results directory."
        exit 1
    fi
fi

# HARDCODED PASSWORDS SCANNING
bash ./scanner/gitleaks.sh
if ! ls "$directory"*__gitleaks__* 1> /dev/null 2>&1; then
    echo "No files containing '__gitleaks__' found in the results directory."
    exit 1
fi

# SUBMIT THE RESULT TO THE BUG-VIEWER SERVER
bash ./scanner/submit.sh
