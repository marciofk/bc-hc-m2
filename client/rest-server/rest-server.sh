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
    "clientID": "YOUR CLIENT ID",
    "clientSecret": "YOUR SECRET",
    "authPath": "/auth",
    "callbackURL": "/auth/github/callback",
    "successRedirect": "http://localhost:4200",
    "failureRedirect": "/"
  }
}'

# execute the rest server
composer-rest-server
