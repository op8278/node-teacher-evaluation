var app = require('express');

var IndexController = require('../app/controller/indexController.js');

module.exports = function(app){
  
  app.get('/',IndexController.index);
  app.post('/login',IndexController.login);
  app.post('/refreshCheckCode',IndexController.refreshCheckCode);
  app.get('/err',function(req,res){
    res.render('err');
  })
}