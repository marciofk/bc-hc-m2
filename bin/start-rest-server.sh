#!/bin/bash

export COMPOSER_PROVIDERS='{
  "github": {
    "provider": "github",
    "module": "passport-github",
    "clientID": "cfab125c0351a6b0692d",
    "clientSecret": "3cf9af8c01f63a39a5a5ae6c1f94ca691f01810f",
    "authPath": "/auth/github",
    "callbackURL": "/auth/github/callback",
    "successRedirect": "/",
    "failureRedirect": "/"
  }
}'

composer-rest-server -c admin@egg-tracking2 -a true -m true
