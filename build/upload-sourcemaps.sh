#!/bin/sh

# Based on: https://michalzalecki.com/upload-source-maps-to-rollbar/

version=$(node -e 'const fs = require("fs");console.log(JSON.parse(fs.readFileSync("./package.json")).version);')

post_server_item=$ROLLBAR_POST_SERVER_ITEM

echo "Uploading source maps for version $version!"

for path in $(find bin -name "*.map"); do
  js_file=${path%.*}
  url=https://raw.githubusercontent.com/Plotinator/pltr_sourcemaps/${js_file}.js
  source_map=$path

  echo "Uploading source map for $url"

  echo curl --silent --show-error https://api.rollbar.com/api/1/sourcemap \
    -F access_token=$post_server_item \
    -F version=$version \
    -F minified_url=$url \
    -F source_map=$source_map \
    > /dev/null

  curl --silent --show-error https://api.rollbar.com/api/1/sourcemap \
    -F access_token=$post_server_item \
    -F version=$version \
    -F minified_url=$url \
    -F source_map=$source_map \
    > /dev/null
done
