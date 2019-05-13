
##  HvA Blockchain Techniek 2 :: Practicum
This project aims at presenting an implementation of a permissioned blockchain network using Hyperledger Composer/Fabric. 

## Prerequisites
You must have the Hyperledger Development Environment configured in your machine or a spare VM. If you do not have it yet, you can follow the instructions:

* Install Hyperledger Composer Pre-requisites: [link](https://hyperledger.github.io/composer/latest/installing/installing-prereqs.html)
* Installing the Development Environment: [link](https://hyperledger.github.io/composer/latest/installing/development-tools.html)


## Installation & Configuration

### Generating the BNA file

First, you need to generate a business network archive (bna). To do so, use these commands, assuming that you are in the root folder of this project:

`$ cd dist`<br/>
`$ composer archive create -t dir -n ..`

A .bna file with name and version specified in the file `package.json` will be generated (e.g. `egg-tracking@0.0.1.bna`). You can deploy your network to the composer playground environment or your local installation.

### Deploying your network archive using the composer playground

We assume that you have a preconfigured development environment. You can start Fabric using the following shell script, assuming that your installation is located in the `~/fabric-dev-servers` folder:

`$ cd ~/fabric-dev-servers`<br/>
`$ ./startFabric.sh`

After the initialisation of your network, you can launch the composer playground tool from the command line:

`$ composer-playground`

It will create a server running on port 8080. Now you can use the playground user interface to deploy and test your network.

### Deploying your network archive to your local installation

#### Installing the network

You can run the composer network command to install your file.

`composer network install -a egg-tracking\@0.0.1.bna --card PeerAdmin@hlfv1`

The card `PeerAdmin@hlfv1` is the network peer administrator. You can see all the cards in your wallet by using the command `composer card list`.

#### Starting the network

You can use the command composer network to start your network.

`composer network start -n egg-tracking -V 0.0.1 -c PeerAdmin@hlfv1 -A admin -S adminpw -f network.card`

In the example above the network with version 0.0.1 will be installed. Note that the peer admin card was used, as well as the administrator credentials. A new card used to manage the network will be created with the name `network.card`. 

A new docker container will start to install your network. You can check using the `docker ps` command to see all running containers.

To import the network admin card, use the following command:

`composer card import --file network.card`

You can ping your network using your new card, to check if everything is ok:

`composer network ping --c admin@egg-tracking`

#### Upgrading the network

If you made any change to your network, you should change the version in your `package.json` and generate a new archive.

`$ cd dist`<br/>
`$ composer archive create -t dir -n ..`

After changing the version to 0.0.2, the new generated file will be `egg-tracking@0.0.2.bna`

Then, you install your new bna file:

`composer network install -a egg-tracking\@0.0.2.bna --card PeerAdmin@hlfv1`

Finally, you can use the upgrade command, as follows:

`composer network upgrade -n egg-tracking -V 0.0.2 -c PeerAdmin@hlfv1`

The ping command can be executed to check if the version was updated:

`composer network ping --c admin@egg-tracking`

#### Exposing your network using the REST server

You can expose your network using a REST server. You can use the command `composer-rest-server` to start the server. For development purposes, we are starting the server without authentication. The security feature will be covered later on. 

## Instructions for Week 3

### Events

This project contains examples of event management, more specifically, emitting events and subscribing and receiving events.

Here, some proposed steps to better understand this topic:

* First, update your local repository with remote changes. 

* Take a look at the [model file](models/nl.hva.blockchain.eggtracking.model.cto). Look up and examine two declared events.

* Then, take a look at the [script file](lib/script.js) and examine how the transactions **createShipment** and **deliverEggs** are emitting events.

As mentioned earlier, events can be captured using two mechanisms (via API and WebSockets. You can see the source-code example using different strategies, by opening:

* The API-based version: It is a nodejs application, and you can open the sub-project [here](client/nodejs). Take a look at the app.js file that contains the logic to listen to events and the package.json with the Client API dependencies.

* The WebSocket-based version: It is a simple HTML/CSS/Javascript example that connects to the Composer REST server and listens to events. You can see the sub-project folder [here](client/web)

#### Running the example application

We assume that you have the Hyperledger Development Environment configured in your machine. If not, you can find instructions on the top of this page.

##### Starting your network
1. Open your terminal window
2. Go to the *dist* folder of this project
3. Execute the script to compile, install and start your network: `./compile.sh`. 

##### Running the REST server

Use the following command to start the REST server: `composer-rest-server -c admin@egg-tracking -n always -u true -w true`

Note that the option `-w true` tells the server to enable WebSocket connections.

##### Running the API-based client that intercepts connections

1. Go to the *client/nodejs* folder of this project
2. Start the listener using the following command: `node index.js`
3. You should see the message `Starting event subscriber` in the console

##### Running the WebSocket-based client that intercepts connections

1. Use your preferred browser to open the file *client/web/index.html*
2. You should be able to see the shipment listener interface

##### Testing the generation of the events

Now you have an empty blockchain network. You should feed the network with some information.

1. Open the [REST Server Explorer at http://localhost:3000](http://localhost:3000/explorer/)
2. Add participants - at least one farmer, one shipper and one distributor. Use the post operation of each participant.
3. Pack at least one egg box (use the *PackEggsTransaction*)
4. Create at least one shipment (use the *CreateShipmentTransaction*)


After creating the shipment, both clients should have received the event. Check the logs of the nodejs application and the updated browser.

### External services call

At this point, you should check how an external service can be called from a transaction. First, let's make some tests with the external API. 

For the sake of simplicity, the API is hosted in an Amazon EC instance, and can be accessed using the following link:

[http://ec2-35-181-51-108.eu-west-3.compute.amazonaws.com:5000/farmer/F1](http://ec2-35-181-51-108.eu-west-3.compute.amazonaws.com:5000/farmer/F1)

The parameter *F1* is the id of the farmer. From practical purposes, the API always returns that the farmer is allowed to pack eggs. You will see later on how to change this behaviour. 

You can find below an example of a response body:

`
{
    "id": "F3",
    "allowed": true
}
`

If for some reason, the EC2 server is down or if you do not want to depend on an external service, you can easily start your own server, just by following these steps:

* go to the *external-api* folder of this project
* start the server by executing `npm app.js`
* you should be able to see a message that the server is listening for requests
* you should change your app script in *lib/script.js*. More specifically, change the value of the constant EXTERNAL\_API\_SERVER to the IP address of your machine. Note that any HTTP requests made to localhost, for example, http://localhost:5000/farmer/F1, will not work as expected. The most straightforward workaround is to get your IP address that is accessible by the container.
* change the version of your app in package.json
* redeploy your business network app using the *dist/compile.sh* script.

##### Testing 

* Execute the *PackEggsTransaction* transaction for any farmer.
* Use `docker ps` get the name of the container that is running your chaincode (e.g. *dev-peer0.org1.example.com-egg-tracking-0.0.2*)
* Execute the command `docker logs <your-container>`. Find the log statements that confirm that the call was executed for the peer

If you want to test a situation where the farmer is not allowed to pack eggs, you can use the id F2 (Farmer 2).

### Adding a peer to the same org

You might be interested in testing a situation where a service produces different results when peers execute transactions. Our development environment is based on the fabric-dev-servers distribution that has only one peer. Thus, it is not possible for testing this situation.

Now, we will create a spare new peer to allow the consensus test. Please follow the instructions in your environment:

#### Generating crypto material for the new peer

We will use **cryptogen* tool which makes part of the composer tools set. The command is **extend**. The cryptogen extend command allows to extend an existing network, meaning generating all the additional key material needed by the newly added entities.

The commands need a config file to generate new crypto material. The config file in our case is crypto-config.yaml. We will open that file in the editor and change the template count from 1 to 2 for Org1.

Go to the folder `~/fabric-dev-servers/fabric-scripts/hlfv12/composer` and open the file `crypto-config.yaml`

```
PeerOrgs:
 ...
 - Name: Org1
    Domain: org1.example.com
  Template:
      Count: 2    
 ...      
```

Save the new file and execute the following command in the same folder:

`cryptogen extend --config=./crypto-config.yaml`

The command will create crypto-material for the new peer. You can find the new peer (peer1 folder) and all the required crypto material at:

```
./crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com
```

To spawn a new peer and a couchdb instance for it, you will need the docker compose definitions for it. You can create a new file in this folder (e.g. docker-compose-new-peer.yaml) and copy the following content to the file:

```
version: '2'

services:
  couchdb1:
    container_name: couchdb1
    image: hyperledger/fabric-couchdb:0.4.10
    environment:
      DB_URL: http://localhost:9984/member_db
    ports:
      - "9984:5984"

  peer1.org1.example.com:
    container_name: peer1.org1.example.com
    image: hyperledger/fabric-peer:1.2.1    
    environment:
      - CORE_LOGGING_LEVEL=debug
      - CORE_CHAINCODE_LOGGING_LEVEL=DEBUG
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_PEER_ID=peer1.org1.example.com
      - CORE_PEER_ADDRESS=peer1.org1.example.com:7051
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=composer_default
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/peer/msp
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb1:5984
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: peer node start --peer-chaincodedev=true          
    volumes:
        - /var/run/:/host/var/run/
        - ./:/etc/hyperledger/configtx
        - ./crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/msp:/etc/hyperledger/peer/msp
        - ./crypto-config/peerOrganizations/org1.example.com/users:/etc/hyperledger/msp/users
    ports:
      - 9051:7051
      - 9052:7052
      - 9053:7053    
    depends_on:
      - couchdb1

```

It has docker scripts for peer1 and Couchdb. Now, you can start docker-composer:

`docker-compose -f docker-compose-new-peer.yaml up -d`

You can verify if the containers are running by executing:

`docker ps`

Now if you go to [http://localhost:9984/_utils/#database/mychannel_mycc/_all_docs](http://localhost:9984/_utils/#database/mychannel_mycc/_all_docs)

You will not find any data. The peer has been successfully spawned and accepted by the network, but it has not joined the channel to which the whole network is connected, so it doesn’t have the ledger data.

Next, we need our newly created peer to join the channel “composerchannel”. 

##### Join the channel

We will enter the peer0 container using the docker exec command, Execute it in another terminal:

`docker exec -it peer0.org1.example.com bash`

If successful you should connect to *peer0*. Time to setup some environment variables:

```
export CHANNEL_NAME=composerchannel
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/configtx/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/configtx/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer1.org1.example.com:7051
```

Now it's time to for the newly spawned peer to join the channel, execute:

`peer channel join -b composerchannel.block`

After the peer has joined the channel, browse back to:

[http://localhost:9984/_utils/#database/mychannel_mycc/_all_docs](http://localhost:9984/_utils/#database/mychannel_mycc/_all_docs)

You will know that the peer has synced the peer ledger successfully. 

##### Changing the connection profile to add the new peer

Now, we need to add the new peer to the connection profile of the created cards. 

* `cd ~/.composer/cards/PeerAdmin@hlfv1`
* replace the content of the file `connection.json` with the following:

```
{
    "name": "hlfv1",
    "x-type": "hlfv1",
    "x-commitTimeout": 300,
    "version": "1.0.0",
    "client": {
        "organization": "Org1",
        "connection": {
            "timeout": {
                "peer": {
                    "endorser": "300",
                    "eventHub": "300",
                    "eventReg": "300"
                },
                "orderer": "300"
            }
        }
    },
    "channels": {
        "composerchannel": {
            "orderers": ["orderer.example.com"],
            "peers": {
                "peer0.org1.example.com": {"endorsingPeer": true,"chaincodeQuery": true,"eventSource": true},
                "peer1.org1.example.com": {"endorsingPeer": true,"chaincodeQuery": true,"eventSource": true}
            }
        }
    },
    "organizations": {
        "Org1": {
            "mspid": "Org1MSP",
            "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
            "certificateAuthorities": ["ca.org1.example.com"]
        }
    },
    "orderers": {
        "orderer.example.com": {
            "url": "grpc://localhost:7050"
        }
    },
    "peers": {
        "peer0.org1.example.com": {
            "url": "grpc://localhost:7051"
        },
        "peer1.org1.example.com": {
            "url": "grpc://localhost:9051"
        }
    },
    "certificateAuthorities": {
        "ca.org1.example.com": {
            "url": "http://localhost:7054",
            "caName": "ca.org1.example.com"
        }
    }
}

```

Copy the connection file to the admin@egg-tracking card:

`cp ~/.composer/cards/PeerAdmin\@hlfv1/connection.json ~/.composer/cards/admin\@egg-tracking/`

Do the same for other cards that you want to use.


Now you can redeploy your network:

* Increment the version of your project
* run the compile.sh script at the dist folder of your project
* Check if the chaincode container was created for peers 1 and 2 running `docker ps`

##### Changing the endorsement policy of your application

At the beginning of this workshop, there was only one peer, and the endorsement policy was very simple. Now we are adding a policy that tells that at least two peers must sign and endorse the transaction. 

Now, change the file dist/endorsementPolicy.json to the following content:

```
{
    "identities": [
        {
            "role": {
                "name": "member",
                "mspId": "Org1MSP"
            }
        }
    ],
    "policy": {
        "2-of": [
            {
                "signed-by": 0
            },
            {
                "signed-by": 0
            }
        ]
    }
} 
```

You can see in the identities section of the json content, that there is only one organisation (Org1MSP). Then, the section policy is stating that at least two peers of organisation 0 (the first identity) should sign the transaction. We will cover endorsement policies in details later on.

You will see in the file compile.sh that this endorsement policy is used when the network is started or upgraded with the `composer network` command.

Now, change the version of your business network application and deploy it again.

##### Testing your application

To check if the consensus mechanism is working properly, you should:

1. Execute the transaction *packEggsTransaction* using the Composer REST server endpoint
2. See the logs of both chaincode peers. You can use the command `docker ps` to find all running containers. You will find two containers with the following names:

* dev-peer0.org1.example.com-egg-tracking-version.maj.min-<hash>
* dev-peer0.org1.example.com-egg-tracking-version.maj.min-<hash>

Execute the `docker logs <container-id>` to examine the logs of each peer. Try to find the corresponding log statements of the transaction.

##### Simulating consensus problems

Now, at least two peers of our organisation must endorse the transaction. Thus, if one of our peers generate a different outcome, the consensus will fail. To test that, we can change the configuration of the external API to generate an inconsistent state. More specifically, if two subsequent peers ask if a farmer is allowed to work, the API will return different values.

To change the configuration, you can use a tool like Postman to make a put call to the following endpoint:

```
PUT http://ec2-35-181-51-108.eu-west-3.compute.amazonaws.com:5000:5000/config

{
	"divergence":true,
	"each": 1
}

```

Note that we are using the AWS EC2 instance. You can change the host if you are using your own server. The divergence is marked as true, and the answer may vary each call. 

Now you can test your application again, sending a *packEggsTransaction*. The expected result is a 500 (error) mentioning that the consensus for endorsement has failed.

## Instructions for Week 4

### Setup OAuth2 for Authentication

We assume that you have the Hyperledger Development Environment configured in your machine. If not, you can find instructions on the top of this page.

#### Step 1: Install passport strategy 
Run the following command: `npm install -g passport-github`

#### Step 2: Register for OAuth2 on github.com

1. Log into github 
2. Click on the user picture 
3. Go to *Settings > Developer Settings
4. Register a new application
5. Inform the value `http://localhost:3000` for the Homepage URL
6. Inform the value `http://localhost:3000/auth/github/callback`
7. Save the information

You will get the *client_id* and *secret* from github. Make sure to have these values available for further usage.

#### Step 3: Setting-up the REST Server

Take a look at the script file in `client/rest-server/rest-server.sh`

This shell-script configures the environment variables that will be read by the composer-rest-server tool. Important values that you must check and adapt are:

* COMPOSER_CARD: The administrator card 
* COMPOSER_PROVIDERS: Configuration of the authentication provider. Make sure that you change the values of *clientId* and *clientSecret*.

#### Step 4: Execute the launch script

* Run the script file in `client/rest-server/rest-server.sh`

#### Step 5: Test the application

* Access the REST Server explorer [http://localhost:3000/explorer/](http://localhost:3000/explorer/). I recommend opening a private/incognito mode to open a brand new session.
* Execute a GET operation on some participants or assets (e.g. Farmer). You should receive a 401 (Unauthorised return code)

I have created some github accounts, so that you can test them:

<table>
<tr><th>Name</th><th>Account</th><th>password</th></tr>
<tr><th>Farmer 1</th><td>eggtrackingf1@gmail.com</td><td>Eggtrackingfone@</td></tr>
<tr><th>Farmer 2</th><td>eggtrackingf2@gmail.com</td><td>Eggtrackingftwo@</td></tr>
<tr><th>Shipper 1</th><td>eggtrackings1@gmail.com</td><td>Eggtrackingsone@</td></tr>
<tr><th>Distributor 1</th><td>eggtrackingd1@gmail.com</td><td>Eggtrackingdone@</td></tr>
</table>

Access the authentication endpoint: [http://localhost:3000/auth](http://localhost:3000/auth). 

You will be redirected to the github authentication page and might ask you to accept authorising the app you created.

If the authentication process worked fine, you should be able to query participants and assets. Note that a token was saved as a cookie and will always be sent for further requests. You can use the Chrome Inspector to check existing cookies.

### Multi-user setup

#### Setup persistence storage for wallet management

##### Create a MongoDB instance

1. For the sake of simplicity we will use a cloud-based instance of MongoDB called MongoDB Atlas. Access [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create an acccount using the *Try Free* button. Follow the sign-in workflow to get the user.
3. From the Atlas panel, create a cluster using the option *Build a cluster*
4. Inform the host options (providers, version, name). I recommend using the free setup M0. FInish, by creating the cluster. It might take some minutes to initialise the cluster
5. In the security tab, add a new user that has read and write access to the database: e.g. test/test
6. Go to IP whitelist and create a rule to allow access from anywhere (for the sake of simplicity)
7. Go to the overview and click on connect
8. Select the *Connect with the Mongo Shell option*
9. Find the string that contains the host name. We will use this name for the next step. Example of name: eggauth-zthkl.mongodb.net

##### Change the shell script that starts the REST server

Change the file client/rest-server/rest-server.sh and add the following lines before the startup command (composer-rest-server)

```
# multiuser
export COMPOSER_MULTIUSER=true

# datasource
export COMPOSER_DATASOURCES='{
  "db" : 
    {
      "name":"db",
      "host":"NAME-OF-THE-MONGO-DB-HOST",
     "database":"restauth",
      "protocol":"mongodb+srv",
      "user":"USERNAME",
      "password":"PASSWORD",
      "connector":"mongodb"
    }
}'
```

Use your values for the variables host, user and password.

Next, install the Loopback connector by executing this command: `npm install -g loopback-connector-mongodb`


#### Testing the multi-user setup

##### Creating participants

Now, we will create a list of participants for testing purposes

<table>
<tr><th>Type</th><th>ID</th><th>name</th></tr>
<tr><th>Farmer</th><td>F1</td><td>Farmer 1</td></tr>
<tr><th>Farmer</th><td>F2</td><td>Farmer 2</td></tr>
<tr><th>Shipper</th><td>S1</td><td>Shipper 1</td></tr>
<tr><th>Distributor</th><td>F2</td><td>Distributor 1</td></tr>
</table>

Execute the following commands to create each participant:


```
composer participant add -d '{ "$class": "nl.hva.blockchain.eggtracking.model.participant.Farmer",  "memberId": "F1","name": "Farmer 1","streetName": "Kipstraat, 123","postalCode": "2034HY","city": "Den Helder","country": "Netherlands"
}' -c admin@egg-tracking
```

```
composer participant add -d '{ "$class": "nl.hva.blockchain.eggtracking.model.participant.Farmer",  "memberId": "F2","name": "Farmer 2","streetName": "Kerkstraat, 721","postalCode": "1544RT","city": "Alkmaar","country": "Netherlands"
}' -c admin@egg-tracking
```

```
composer participant add -d '{ "$class": "nl.hva.blockchain.eggtracking.model.participant.Shipper",  "memberId": "S1","name": "Shipper 1","streetName": "Parkstraat, 889","postalCode": "2088GG","city": "Amsterdam","country": "Netherlands"
}' -c admin@egg-tracking
```

```
composer participant add -d '{ "$class": "nl.hva.blockchain.eggtracking.model.participant.Distributor",  "memberId": "D1","name": "Distributor 1","streetName": "Bloemstraat, 567","postalCode": "1677OP","city": "Lisse","country": "Netherlands"
}' -c admin@egg-tracking
```

#### Creating identities

Now, we will create the identities for each participant and issue a card for each one. Execute the following commands:

```
composer identity issue -u F1 -a "nl.hva.blockchain.eggtracking.model.participant.Farmer#F1" -c admin@egg-tracking
```

```
composer identity issue -u F2 -a "nl.hva.blockchain.eggtracking.model.participant.Farmer#F2" -c admin@egg-tracking
```

```
composer identity issue -u S1 -a "nl.hva.blockchain.eggtracking.model.participant.Shipper#S1" -c admin@egg-tracking
```

```
composer identity issue -u D1 -a "nl.hva.blockchain.eggtracking.model.participant.Distributor#D1" -c admin@egg-tracking
```

Note that each command will generate a card file with the name *<id>@egg-tracking.card*, where id is the member id. We will use these files to import cards to the REST server wallet.

#### Working with the multi-user setup

##### Execute the server

Now you can launch the script *client/rest-server/rest-server.sh*

##### Importing wallets

Now you can access the endpoint [http://localhost:3000/auth](http://localhost:3000/auth). Login with the github user *eggtrackingf1@gmail.com/Eggtrackingfone@*, which corresponds to the farmer 1.

Back to [http://localhost:3000](http://localhost:3000), try to query participants or assets. The server will generate an error, telling that this account does not have yet a corresponding card. Thus, an additional step is necessary.

You will see a new endpoint called *Wallet*. This endpoint is enabled in multi-user mode and allows you to manage your wallet.

Now, execute a POST operation on */wallet/import*, uploading the card *F1@egg-tracking.card*. If everything went well you would receive a 204 return code.

You can check if everything went well by executing a System Ping command. The return message should contain the attached participant to your identity.

Now, do the same to other participants (F2, S1, and D1). Make sure that you:

 * sign-out from github: [http://github.com](http://github.com)
 * login in again using the remaining accounts [http://localhost:3000/auth](http://localhost:3000/auth)
 * Import the corresponding card to the wallet

 #### Using the REST API using different users
 
 Execute the following steps:
 
1. Log in as Farmer 1
2. Pack some eggs
3. Query EggBoxes
4. Do steps 1, 2, and 3 for Farmer 2

### Angular Application

#### Creating an angular application from scratch

To create a skeleton Angular application that can interact with the Composer REST API, you can use the yo hyperledger-composer command. 

```
yo hyperledger-composer
```

Follow the below so your output matches:

```
Welcome to the Hyperledger Composer project generator
? Please select the type of project: Angular
You can run this generator using: 'yo hyperledger-composer:angular'
Welcome to the Hyperledger Composer Angular project generator
? Do you want to connect to a running Business Network? Yes
? Project name: [insert]
? Description: Hyperledger Composer Angular project
? Author name: [insert]
? Author email: [insert]
? License: Apache-2.0
? Name of the Business Network card: admin@tutorial-network
? Do you want to generate a new REST API or connect to an existing REST API?  Connect to an existing REST
 API
? REST server address: http://localhost
? REST server port: 3000
? Should namespaces be used in the generated REST API? Namespaces are uses
Created application!
```

The generated application will be within a sub directory named after the Project name entered above.

Finally enter this directory and to get the application running, run:

`npm start`

It will be available on http://localhost:4200

#### Using the existing angular application from this repository

The provided application was also generated using *yo* as a starting point. It ha additional functionality, adding login, logout functionalities and allows users to know which participant is logged in.

To use it, use your terminal app and go to the folder *client/angular*. Execute the command `npm start`

It will be available on http://localhost:4200




 
 




























