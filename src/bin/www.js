var app = require('../app');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
  console.log('\n--------App runned on port: ' + server.address().port + '----------\n');
});
