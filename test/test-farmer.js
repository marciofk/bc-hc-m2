/**
 * Week 5: Composer Tests: Adding a farmer to the network
 * Marcio Fuckner
 * Inspired by the examples provided by Rajeev Sakhuja @ http://ACloudFan.com
 */

var assert = require('chai').assert;

// You need to change this to your specific directory
const utHarness = require('./ut-harness.js');

// This points to the model project folder
var modelFolder = __dirname + '/..';

var businessNetworkConnection = {}
var bnDefinition = {}

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

const nameSpace = 'nl.hva.blockchain.eggtracking.model.participant';
const resourceName = 'Farmer';

// Test Suite # 1
describe('Farmer Participant # Adding and checking', () => {

    // Test Case # 1
    // 1. Add a Participant of type "Farmer"
    // 2. Get the participant instance that was added
    // 3. Assert values
    it('should have 1 participant instance with name=Farmer 1', async () => {
        let registry ={}
        // Add the participant
        // Get the participant registry using the BN Connection

        let participantRegistry = await businessNetworkConnection.
                                    getParticipantRegistry(nameSpace+'.'+resourceName);
        
        let factory = bnDefinition.getFactory();

        // Create the instance
        let farmer = factory.newResource(nameSpace,resourceName,'F1');
        farmer.name ='Farmer 1';
        farmer.streetName ='Kipstraat, 123';
        farmer.postalCode ='2032PP';
        farmer.city = 'Haarlem';

        await participantRegistry.add(farmer);

        let farmerFromNet = await participantRegistry.get('F1');
        assert.equal(farmerFromNet.name,"Farmer 1","Wrong name");
        assert.equal(farmerFromNet.country,"Netherlands","Wrong country");
    });
});


