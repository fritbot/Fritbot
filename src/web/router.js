module.exports = function (app) {
    app.get('/', function (req, res) {
        res.send('hello world');
    });

    app.get('/health', function (req, res) {
        res.send('Now witness the firepower of this fully ARMED and OPERATIONAL bot-tlestation!');
    });
};
