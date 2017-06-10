var request = require('request');
var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var session=require('express-session');
var routers = require('./config/router.js');

var app = express();

var port = process.env.PORT||8888;



//前端页面 目录
app.set('views','./app/views/');

//前端引擎
app.set('view engine','ejs');


//静态资源库
app.use(serveStatic('public'));

//中间件
app.use(bodyParser.urlencoded({extend:true})); //解析post传过来的body;

app.use(session({
  secret:'teacher evalution',
  cookie:{
    maxAge:1000*60*60  //1 hour   不设置/默认为 会话结束(关闭浏览器)
  }
}));

app.use(function(req,res,next){

  // if (res.locals.loginFailInfo) {
    console.log('排查locals');
    // console.log(res.locals.loginFailInfo);
    // res.locals.loginFailInfo = res.locals.loginFailInfo?res.locals.loginFailInfo:"无错误";
  // }
  var loginFailInfo = req.session.loginFailInfo;
  if (loginFailInfo) {
    res.locals.loginFailInfo = loginFailInfo;
  }else{
    res.locals.loginFailInfo = "无错误";
  }
  console.log(res.locals.loginFailInfo);
  next();
});


app.listen(port,function(err){
  if (err) {
    console.log(err);
  }
  console.log('server has start at' + port);
});

//添加路由
routers(app);



// var COOKIE="";
// //拿cookie
// request('http://210.38.137.126:8016/default2.aspx',function(error,response,body){
//   COOKIE=String(response.headers['set-cookie']).replace(/; path=\// , "");
//   // console.log(String(response.headers['set-cookie']).replace(/; path=\// , ""));
//   console.log(response.headers);
//   console.log(COOKIE);


// });
// request.get('http://210.38.137.126:8016/default2.aspx').end()