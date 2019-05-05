function init() {
    var ws = new WebSocket("ws://localhost:3000");

    ws.onopen = function() {
        console.log('connection opened');
    };

    ws.onerror = error => {
        console.log(`connection error: ${error}`)
    };    

    ws.onmessage = function (evt) { 
        var msg = evt.data;
        console.log(msg);
        var event = JSON.parse(msg);
        switch(event.$class){
            case 'nl.hva.blockchain.eggtracking.model.ShipmentCreated':
                appendToList(event);
                break;
            default:
                console.log("Ignored event: ", event.$class);
        }
    };
      
    ws.onclose = function() {         
        console.log("Connection is closed..."); 
    };    
}

function appendToList(event) {

    document.getElementById("lg").innerHTML += 
        '<a href="#" class="list-group-item list-group-item-action flex-column align-items-start">' + 
        '<div class="d-flex w-100 justify-content-between"><h5 class="mb-1">' + 
            event.shipmentId + '</h5>' +
        '<small>' + new Date() + '</small></div><p class="mb-1">' + 
        'Shipper: ' + event.shipperId + '</p></a>';    
}