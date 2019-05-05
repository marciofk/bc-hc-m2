
##  HvA Blockchain Techniek 2 :: Practicum
This project aims at presenting an implementation of a permissioned blockchain network using Hyperledger Composer/Fabric. 

## Prerequisites
You must have the Hyperledger Development Environment configured in your machine or a spare VM. If you do not have it yet, you can follow the instructions:

* Install Hyperledger Composer Pre-requisites: [link](https://hyperledger.github.io/composer/latest/installing/installing-prereqs.html)
* Installing the Development Environment: [link](https://hyperledger.github.io/composer/latest/installing/development-tools.html)


## Installation & Configuration

### Generating the BNA file

First, you need to generate a business network archive (bna). To do so, use these commands, assuming that you are located in the root folder of the project:

`$ cd dist`<br/>
`$ composer archive create -t dir -n ..`

A .bna file with name and version specified in the file `package.json` will be generated (e.g. `egg-tracking@0.0.1.bna`). You can deploy your network to the composer playground  environment or your local installation.

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

The card `PeerAdmin@hlfv1` is the network peer administrator. You can see  all cards in your wallet by using the command `composer card list`.

#### Starting the network

You can use the command composer network to start your network

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

* First, take a look at the [model file](models/nl.hva.blockchain.eggtracking.model.cto). Look up and examine two declared events.

* Then, take a look at the [script file](lib/script.js) and examine how the transactions **createShipment** and **deliverEggs** are emitting events.

As mentioned earlier, events can be captured using two mechanisms (via API and WebSockets. You can see the source-code example using different strategies, by opening:

* The API-based version: It is a nodejs application and you can open the sub-project here [here](client/nodejs). Take a look at the app.js file that contains the logic to listen to events and the package.json with the Client API dependencies.

* The WebSocket-based version: It is a simple HTML/CSS/Javascript example  that connects to the Composer REST server and listens to events. You can see the sub-project folder [here](client/web)

#### Running the example application

We assume that you have the  the Hyperledger Development Environment configured in your machine. If not, you can find instructions on the top of this page.

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

##### Testing the events generation

Now you have an empty blockchain network. You should feed the network with some information.

1. Open the [REST Server Explorer at http://localhost:3000](http://localhost:3000/explorer/)
2. Add participants - at least one farmer, one shipper and one distributor. Use the post operation of each participant.
3. Pack at least one egg box (use the *PackEggsTransaction*)
4. Create at least one shipment (use the *CreateShipmentTransaction*)


After creating the shipment, both clients should have received the event. Check the logs of the nodejs application and the updated browser.