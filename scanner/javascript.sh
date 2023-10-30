#!/bin/bash

# Installing eslint and the security related plugins
echo "Installing eslint"
rm -f package.json package-lock.json
find . -type f \( -name ".eslintrc.js" -o -name ".eslintrc.json" -o -name ".eslintrc" \) -exec echo "Deleting {}" \; -exec rm -f {} \;

dirs=$(find . -type f -name "package.json" -not -path '*/node_modules/*' -exec dirname {} \;)
npm i eslint eslint-plugin-security eslint-plugin-sonarjs eslint-plugin-xss eslint-plugin-no-unsanitized eslint-plugin-no-secrets eslint-plugin-react eslint-plugin-prettier

# Look for package.json files in order to know where to run eslint
echo "$dirs" | while read -r dir; do

  echo "Checking directory $dir"

  # Check and count import and require statements in .js, .jsx, and .ts files
  # We do this because the .eslintrc needs to specify how the code should be parsed.
  # Depending on the result we choose a different .eslintrc config file.
  import_count=0
  require_count=0
  import_count=$(find "$dir" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" \) -exec grep -E 'import .* from .*' {} \; | wc -l)
  require_count=$(find "$dir" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" \) -exec grep -E 'require\(".*"\)' {} \; | wc -l)

  # Assign ESLint config path based on the condition
  if [ $import_count -gt 0 ] || [ $require_count -eq 0 ]; then
    eslint_config="scanner/.eslintrc-import"
  else
    eslint_config="scanner/.eslintrc-require"
  fi

  # Determine the folder name for the output file
  foldername=$(basename "$dir")

  # Scan the whole project
  echo "Running eslint with configuration $eslint_config in $dir"
  foldername=$(basename "$dir" | sed 's/\//__slash__/g')
  
  if [ "$dir" != "." ]; then
    find "$dir" -name 'package.json' -type f -exec rm -f {} +
  fi

  if ! echo "$dir" | grep -q "node_modules"; then
    (npx eslint "$dir" --config "$eslint_config" --format json > "./scanner/tmp/result/__eslint__${foldername}_.json")
  fi

done
