const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const cardType = { type: 'composer-wallet-filesystem' }

const connection = new BusinessNetworkConnection(cardType);

connection.connect('admin@egg-tracking').then(function () { main(); });

function main() {
    console.log("Starting event subscriber");
    connection.on('event',(event) => {
        var namespace = event.$namespace;
        var eventtype = event.$type;

        var eventName = namespace + '.' + eventtype;
        console.log('event name ' + eventName);

        switch(eventName){
            case 'nl.hva.blockchain.eggtracking.model.ShipmentCreated':  
                console.log('handling event');      
                handleShipmentEvent(event);
                break;
            default:    
                console.log("Ignored event: ", eventName);
        }
    });

}
function handleShipmentEvent(event) {
    console.log("Handling event - shipmentId: " + event.shipmentId + " shipperId: " + event.shipperId);
}



