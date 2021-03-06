var mongoose = require('mongoose');

var BusinessSchema = new mongoose.Schema({
    name: String,
    location: Object,
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    services: [{type: mongoose.Schema.Types.ObjectId, ref: 'Service'}],
    category: String,
    employees: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    placesId: String,
    customers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    address: String,
    phoneNumber: String,
    dateCreated: String,
    pending: Boolean,
    claimed: Boolean,
    tier: Number,
    payments: Boolean,
    accountType: String,
    shopModel: String,
    shopSize: String,
    stripeId: String,
    stripeKeys: Object,
    stripeAccount: Object
});
mongoose.model('Business', BusinessSchema);
