const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json())

var dict = [];
dict['F2'] = { id: 'F2', allowed: false};

var divergence = false;
var each = 0;
var count = 0;
var allowed = false;

app.get('/farmer/:id', (req,res) => {

    // return true if farmer was not found

    console.log("divergence : " + divergence + " each: " + each + " count: " + count);

    if(!divergence) {
        console.log(`the endpoint /farmer/${req.params.id} was invoked using get at ${new Date()}`);
        if(dict[req.params.id] == null) {
            res.json({ id: `${req.params.id}`, 'allowed' : true});
        } else {    
            res.json(dict[req.params.id]);
        }
        
    } else {
        count ++;
        if (count % each == 0) {
            allowed = !allowed;
        }
        console.log(`the endpoint /farmer/${req.params.id} was invoked using get at ${new Date()} and the return was ${allowed}`);
        res.json({ id: `${req.params.id}`, 'allowed' : allowed});
    }
});

app.put('/config', (req,res) => {
    console.log("divergence: " + req.body.divergence + " each: " + req.body.each);
    divergence = req.body.divergence;
    console.log("divergence : " + divergence + " each: " + each + " count: " + count);
    each = req.body.each;
    res.end();

});

app.listen(5000, () => console.log(`server running on port ${PORT}`))