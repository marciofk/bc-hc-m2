/**
 * Testing a transaction execution
 */
var assert = require('chai').assert;

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
    it('should create an eggbox asset', () => {

        let theFarmer;

        businessNetworkConnection.getParticipantRegistry(nameSpace+'.'+'participant.Farmer').then((reg)=>{
            return farmer = reg.get('F1');
        }).then((farmer) => {
            theFarmer = farmer;
            return businessNetworkConnection.getTransactionRegistry(nameSpace+"."+"PackEggsTransaction");
        }).then((reg) => {
            const  factory = bnDefinition.getFactory();
            // Create the instance
            let transaction = factory.newResource(nameSpace,"PackEggsTransaction","1");
            transaction.producer = factory.newRelationship(nameSpace+".participant",'Farmer',theFarmer.memberId);
            transaction.packingTimestamp = new Date();

            return businessNetworkConnection.submitTransaction(transaction);
        }).then((transaction) => {
            return businessNetworkConnection.getAssetRegistry(nameSpace+'.'+'EggBox');
        }).then((registry) => {
            return registry.getAll();
        }).then((eggboxes) => {
            assert.equal(eggboxes.length,1,"should have one eggbox");
            assert.equal(eggboxes[0].quantity,30,'should have 30 eggs');
        }).catch((error) => {
            throw error;
        })

    });
});


