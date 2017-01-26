#!/bin/bash
#
#

curl -XPUT -s http://localhost:9200/bfa/ -d "$(cat mappings.json)" | jq . 
