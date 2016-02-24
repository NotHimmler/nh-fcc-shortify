var mongoose = require('mongoose');

var shortenerSchema = mongoose.Schema({
    address: String,
    id: Number,
    date: String,
});

var Shortener = mongoose.model('Shortener', shortenerSchema);

module.exports = Shortener;