#!/bin/bash

# Because gosec doesn't support scanning only specific files, we scan the whole project
# When we send the results to the server, the server will than remove results not related
# to the current pull request (if that's the case of course).

echo "Installing gosec"
curl -sfL https://raw.githubusercontent.com/securego/gosec/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v2.16.0


GO_PROJECT_DIR=$(find . -name go.mod -exec dirname {} \; 2>/dev/null | head -n 1)

echo "Scanning Golang files"
gosec -fmt=json --out=./scanner/tmp/result/__gosec__.json "$PROJECT_DIR"