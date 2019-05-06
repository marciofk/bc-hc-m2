const EXTERNAL_API_SERVER = "http://ec2-35-181-51-108.eu-west-3.compute.amazonaws.com:5000"

/**
 * Create a new egg box (1)
 * @param {nl.hva.blockchain.eggtracking.model.PackEggsTransaction} transaction - the transaction
 * @transaction
 */
async function packEggs(transaction) {
    console.log('@packEggs start')
    // validate the existence of the farmer
    let farmerRegistry = await getParticipantRegistry("nl.hva.blockchain.eggtracking.model.participant.Farmer")
    if(await farmerRegistry.exists(transaction.producer.memberId) == false) {
        throw new Error("Farmer does not exist V1")
    }

    // Check if farmer is allowed to pack eggs
    if(!await isAllowed(transaction.producer.memberId)) {
        throw new Error("Farmer is not allowed to pack food");
    }

    // Create a new asset by using a factory
    let factory = getFactory()
    let eggBox = factory.newResource('nl.hva.blockchain.eggtracking.model','EggBox',
        generatePackId(transaction.producer,transaction.packingTimestamp))

    // Using transaction information to build new asset
    eggBox.origin = transaction.producer
    eggBox.holder = transaction.producer
    eggBox.packingTimestamp = transaction.packingTimestamp
    eggBox.quantity = transaction.quantity
    eggBox.status = 'PACKED'

    // save asset by using the registry
    let registry = await getAssetRegistry("nl.hva.blockchain.eggtracking.model.EggBox")
    await registry.add(eggBox);
}

async function isAllowed(farmerId) {
    console.log('@debug isAllowed was called')
    const json = await request.get({ uri: `${EXTERNAL_API_SERVER}/farmer/${farmerId}`, json: true })
    console.log('@debug json = ' + json)
    console.log('@debug allowed = ' + json.allowed)

    return json.allowed
}

/**
 * Loads the truck with eggs 
 * @param {nl.hva.blockchain.eggtracking.model.CreateShipmentTransaction} transaction - create shipment
 * @transaction
 */
async function createShipment(transaction) {
    
    // get egg boxes to load to the truck
    const packs = await query('AllEggBoxesLimit',{ farmer: transaction.from.toURI(), limit: transaction.max} )

    if(packs.length < transaction.min) {
        throw new Error("Unable to create shipment - available eggs are " + 
            packs.length + " and the minimum load is " + transaction.min)
    }


    // get the egg box registry for further usage (update status)
    const eggRegistry = await getAssetRegistry('nl.hva.blockchain.eggtracking.model.EggBox')

    console.log("@debug farmer: " + transaction.from)

    // create a shipment asset
    let factory = getFactory()
    let shipment = factory.newResource('nl.hva.blockchain.eggtracking.model','EggShipment',
        generateShipmentId(transaction.from,transaction.to,transaction.creation))

    // Using transaction information to build new asset
    shipment.creation = transaction.creation
    shipment.from = transaction.from
    shipment.to = transaction.to
    shipment.shipper = transaction.shipper
    shipment.status = 'READY'
    shipment.eggs = []

    // update each pack with the status and add eggboxes to the shipment
    for(var n=0;n<packs.length;n++) {
        const pack = await eggRegistry.get(packs[n].boxId)
        pack.status = 'READY_FOR_SHIPMENT'
        shipment.eggs.push(pack)
        await eggRegistry.update(pack)
    }

    // save shipment by using the registry
    let registry = await getAssetRegistry("nl.hva.blockchain.eggtracking.model.EggShipment")
    await registry.add(shipment)

    // emitting the event for the shipment
    let event = factory.newEvent('nl.hva.blockchain.eggtracking.model', 'ShipmentCreated');

    event.shipmentId = shipment.shipmentId
    event.shipperId = shipment.shipper.memberId

    emit(event)
}


/**
 * Loads the truck
 * @param {nl.hva.blockchain.eggtracking.model.LoadTruckTransaction} transaction - the load transaction
 * @transaction
 */
async function loadTruck(transaction) {

    // get the egg box registry for further usage (update status)
    const eggRegistry = await getAssetRegistry('nl.hva.blockchain.eggtracking.model.EggBox')

    // update egg boxes
    for(var n=0;n<transaction.shipment.eggs.length;n++) {
        const box = await eggRegistry.get(transaction.shipment.eggs[n].boxId)
        // only ready for shipment eggs (avoid getting a damaged eggbox)
        if(box.status == 'READY_FOR_SHIPMENT') {
            box.status = 'IN_TRANSIT'
            box.holder = transaction.shipment.shipper
            await eggRegistry.update(box)       
        }
    }

    // get the shipmentregistry for further usage (update status)
    const shipmentRegistry = await getAssetRegistry('nl.hva.blockchain.eggtracking.model.EggShipment')

    // update transaction
    transaction.shipment.status = 'LOADED'
    transaction.shipment.loadTimestamp = transaction.loadTimestamp
    await shipmentRegistry.update(transaction.shipment)

}

/**
 * Deliver eggs
 * @param {nl.hva.blockchain.eggtracking.model.DeliverEggsTransaction} transaction - delivering eggs to the distributor
 * @transaction
 */
async function deliverEggs(transaction) {

    // get the egg box registry for further usage (update status)
    const eggRegistry = await getAssetRegistry('nl.hva.blockchain.eggtracking.model.EggBox')

    // update egg boxes
    for(var n=0;n<transaction.shipment.eggs.length;n++) {
        const box = await eggRegistry.get(transaction.shipment.eggs[n].boxId)
        // only consider in transit egg boxes (avoiding getting damaged boxes)
        if(box.status == 'IN_TRANSIT') {
            box.status = 'IN_DISTRIBUTION_CENTRE'
            box.holder = transaction.shipment.to
            await eggRegistry.update(box)       
        }
    }

    // get the shipmentregistry for further usage (update status)
    const shipmentRegistry = await getAssetRegistry('nl.hva.blockchain.eggtracking.model.EggShipment')

    // update transaction
    transaction.shipment.status = 'DELIVERED'
    transaction.shipment.deliveryDate = transaction.deliveryDate
    await shipmentRegistry.update(transaction.shipment)

    // emitting the event for the shipment delivered
    let event = factory.newEvent('nl.hva.blockchain.eggtracking.model', 'ShipmentDelivered');

    event.shipmentId = transaction.shipment.shipmentId
    event.shipperId = transaction.shipment.to.memberId

    emit(event)
}

/**
 * Report Damage
 * @param {nl.hva.blockchain.eggtracking.model.ReportDamageTransaction} transaction - the damage report
 * @transaction
 */
async function reportDamage(transaction) {

    // get the egg box registry for further usage (update status)
    const eggRegistry = await getAssetRegistry('nl.hva.blockchain.eggtracking.model.EggBox')

    if(transaction.box.status == 'DAMAGED') {
        throw new Error('Egg box is already damaged')
    }

    transaction.box.status = 'DAMAGED'
    await eggRegistry.update(transaction.box)       
}

/****
 * Creates the pack id key 
 */
function generatePackId(producer, timestamp){
    return producer.memberId + '-' + formatDate(timestamp)
}

/****
 * Creates the pack id key 
 */
function generateShipmentId(from,to, timestamp){
    return from.memberId + '-' + to.memberId + '-' + formatDate(timestamp)
}

/****
 * Format date (refactor)
 */
function formatDate(timestamp) {
    var dt = new Date(timestamp)

    var month = dt.getMonth()+1;
    if((month+'').length == 1)  
        month = '0'+month;

    var dayNum = dt.getDate();
    if((dayNum+'').length == 1)
        dayNum = '0'+dayNum;
    
    var hour = dt.getHours();
    if((hour+'').length == 1) 
        hour = '0'+hour;
    
    var minutes = dt.getMinutes();
    if((minutes+'').length == 1) 
        minutes = '0'+minutes;

    var seconds = dt.getSeconds()
    if((seconds+'').length == 1) 
        seconds = '0'+seconds;
    
    return dt.getFullYear() + "-" + month 
            + "-" + dayNum + "-" + hour + ":" + minutes + ":" + seconds
}