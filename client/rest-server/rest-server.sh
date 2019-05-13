#!/bin/bash

# card
export COMPOSER_CARD=admin@egg-tracking

# namespace
export COMPOSER_NAMESPACES=always

# authentication
export COMPOSER_AUTHENTICATION=true

# strategy
export COMPOSER_PROVIDERS='{
  "github": {
    "provider": "github",
    "module": "passport-github",
    "clientID": "cfab125c0351a6b0692d",
    "clientSecret": "3cf9af8c01f63a39a5a5ae6c1f94ca691f01810f",
    "authPath": "/auth",
    "callbackURL": "/auth/github/callback",
    "successRedirect": "http://localhost:4200",
    "failureRedirect": "/"
  }
}'

# multiuser
export COMPOSER_MULTIUSER=true

# datasource
export COMPOSER_DATASOURCES='{
  "db" : 
    {
      "name":"db",
      "host":"eggauth-zthkl.mongodb.net",
     "database":"restauth",
      "protocol":"mongodb+srv",
      "user":"test",
      "password":"test",
      "connector":"mongodb"
    }
}'

# execute the rest server
composer-rest-server
