#!/bin/bash

# MFK

# removing previous business network archives
rm -rf *.bna
rm -rf *.card

# creating file
composer archive create -t dir -n ..

if [ $? -eq 0 ]
then
  echo "Successfully created file"
else
  echo "Could not create file" >&2
  exit 1
fi

# getting file name
FILE=$(ls *.bna)
VERSION=$(echo $FILE | cut -f2 | sed 's/\.bna//' | cut -f2 -d@)
NETWORK=$(echo $FILE | cut -f2 | sed 's/\.bna//' | cut -f1 -d@)

echo "Generated file is " $FILE " network is " $NETWORK " version is " $VERSION

# installing file
composer network install -a $FILE -c PeerAdmin@hlfv1

if [ $? -eq 0 ]; then
  echo "Successfully installed file"
else
  echo "Could not install file" >&2
  exit 1
fi

# checking the existence of the app in the network
composer network ping -c admin@$NETWORK
if [ $? -eq 0 ]; then
   # already exists 
   echo Upgrading
   composer network upgrade -n $NETWORK -V $VERSION -c PeerAdmin@hlfv1 -o endorsementPolicyFile=endorsementPolicy.json
else
  # does not exists
  echo Installing
  # starting the network
  composer network start -n $NETWORK -V $VERSION -A admin -S adminpw -c PeerAdmin@hlfv1 -f network.card

  if [ $? -eq 0 ]; then
    echo "Successfully started network"
  else
    echo "Could not start network" >&2
    exit 1
  fi

  # removing previous card from the wallet
  composer card delete -c admin@$NETWORK

  # importing the card into the wallet
  composer card import -f network.card

  if [ $? -eq 0 ]; then
    echo "Successfully imported card"
  else
    echo "Could not import card" >&2
    exit 1
  fi
fi