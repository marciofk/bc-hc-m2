/**
 * Week 5: Composer Tests: Executing a transaction (packing eggs)
 * Marcio Fuckner
 * Inspired by the examples provided by Rajeev Sakhuja @ http://ACloudFan.com
 */

var assert = require('chai').assert;
var fail = require('chai').fail;


// You need to change this to your specific directory
const utHarness = require('./ut-harness.js');

// This points to the model project folder
var modelFolder = __dirname+'/..';

var businessNetworkConnection = {}
var bnDefinition = {}

const nameSpace = 'nl.hva.blockchain.eggtracking.model';

// Synchronous call so that connections can be established
before((done) => {
    utHarness.debug = false;
    utHarness.initialize(modelFolder, (adminCon, bnCon, definition) => {
        adminConnection = adminCon;
        businessNetworkConnection = bnCon;
        bnDefinition = definition;
        done();
    });
})

// Creating a farmer to be used afterwards`
before((done) => {
    let registry ={}
    // Add the required participant to be used further on
    // Get the participant registry using the BN Connection
    businessNetworkConnection.getParticipantRegistry(nameSpace+'.'+'participant.Farmer').then((reg)=>{
        registry = reg;
        // Get the factory using the BN Definition
        const  factory = bnDefinition.getFactory();
        // Create the instance
        let participant = factory.newResource(nameSpace+'.'+ 'participant','Farmer','F1');
        participant.name = 'Farmer 1';
        participant.streetName = 'Kipstraat, 123';
        participant.postalCode = '2032PP';
        participant.city = 'Haarlem';

        // Add to registry
        registry.add(participant);
        done();
    });

})

// Test Suite # 1
describe('Package Eggs', () => {

    // Test Case # 1 packing eggs
    it('should create an eggbox asset', async () => {

        // get the farmer registry
        let farmerRegistry = await businessNetworkConnection.
                            getParticipantRegistry(nameSpace+'.'+'participant.Farmer');

        // get the previously added farmer
        let farmer = await farmerRegistry.get('F1');

        // get the factory
        let factory = bnDefinition.getFactory();

        // create a transaction
        let transaction = factory.newResource(nameSpace,"PackEggsTransaction","id");
        transaction.producer = factory.newRelationship(nameSpace+".participant",'Farmer',farmer.memberId);
        transaction.packingTimestamp = new Date();

        // submit the transaction
        await businessNetworkConnection.submitTransaction(transaction);

        // check if the eggbox was created
        let eggBoxRegistry = await businessNetworkConnection.getAssetRegistry(nameSpace+'.'+'EggBox');
        let eggBoxes = await eggBoxRegistry.getAll();

        assert.equal(eggBoxes.length,1,"should have one eggbox");
        assert.equal(eggBoxes[0].quantity,30,'should have 30 eggs');
    });
});


