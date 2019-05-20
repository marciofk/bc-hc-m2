/**
 * Part of a course on Hyperledger Fabric: 
 * http://ACloudFan.com
 * 
 * This is the sample test case used in the lecture
 * "Unit Testing of Network Apps"
 */
var assert = require('chai').assert;

// You need to change this to your specific directory
const utHarness = require('./ut-harness.js');

// This points to the model project folder
var modelFolder = __dirname+'/..';

var adminConnection = {}
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
describe('Farmer Participant # Add & Check', () => {

    // Test Case # 1
    // 1. Add a Participant of type "Farmer"
    // 2. Get the participant instance that was added
    // 3. Assert Equal >> Value in received asset should be "10"
    it('should have 1 participant instance with name=Farmer 1', () => {
        let registry ={}
        // Add the asset
        // Get the asset registry using the BN Connection
        return businessNetworkConnection.getParticipantRegistry(nameSpace+'.'+resourceName).then((reg)=>{
            registry = reg;
            // Get the factory using the BN Definition
            const  factory = bnDefinition.getFactory();
            // Create the instance
            let    sampleAsset = factory.newResource(nameSpace,resourceName,'F1');
            sampleAsset.name='Farmer 1';
            sampleAsset.streetName='Kipstraat, 123';
            sampleAsset.postalCode='2032PP';
            sampleAsset.city='Haarlem';

            // Add to registry
            return registry.add(sampleAsset);
        }).then((asset)=>{

            // Get the asset now
            return registry.get('F1');
        }).then((asset)=>{

            // Assert
            assert.equal(asset.name,"Farmer 1","Value not equal or undefined");
        }).catch((error)=>{
            throw error;
        });
    });


});


