//var request = require('request');
var request = require("superagent"); //res.headers  res.header 共存
var charset = require("superagent-charset");
var cheerio = require("cheerio");
var fs = require("fs");

var ApiAddress = require('../../config/apiAddress.js');
var HeaderUtil = require('../../config/headerUtil.js');

charset(request);

exports.test=function(req,res){
  console.log(HeaderUtil.postParmEvaluationOneTeacher);
  res.send(HeaderUtil.postParmEvaluationOneTeacher);  
}

//首页
exports.index = function(req,res){
  var cookie = "";
  var _res=res;
  console.log('-----index-----');

  getDataProminse(ApiAddress.login,HeaderUtil.BASE_HEADER)
    .then(function(data){
      console.log('-------进入getLoginProminse登录的then');
      console.log(data.headers);
      //保存cookie
      console.log(data.headers["set-cookie"][0]); 
      cookie = String(data.headers["set-cookie"][0]).replace(/; path=\// , "");
      req.session.saveCookie=cookie;
      var assginHeaders=Object.assign({},HeaderUtil.BASE_HEADER,{Cookie:cookie});

      //访问验证码 
      return getDataProminse(ApiAddress.checkCode,assginHeaders);
      // return 
    })
    .then(function(data){
      console.log('-------进入getLoginProminse验证码的then');
      console.log(data.headers);
      fs.writeFile('public/img/'+'CheckCode.gif',data.body,function(err){
        if(err){
          console.log(err);
          throw new Error('Something bad happened');
        };
        console.log('checkCode.gif写入成功');
        _res.render('index',{
          title:"评价首页",
          CheckCode : "/img/" + "CheckCode.gif",
          CheckCode1 : ApiAddress.checkCode,
          cookie1 : cookie
        });
      });
    });
}

//登录 Post请求
exports.login = function(req,res){

  var _res=res;
  var courseHrefList=[];
  var courseNameList=[];

  //获取post过来的account,password,验证码
  var receiveParam={
    txtUserName:req.body.account || "",
    TextBox2:req.body.password || "",
    txtSecretCode:req.body.checkCode || ""
  }
  console.log(receiveParam);
  console.log('-----login-----');

  var cookie="";
  if (req.session.saveCookie) {
    console.log('saveCookie = '+req.session.saveCookie);
    cookie = req.session.saveCookie;
  }
  
  var postData = Object.assign({},HeaderUtil.LOGIN_CONFIG,receiveParam);
  var assginHeaders = Object.assign({},HeaderUtil.BASE_HEADER,{
    Cookie:cookie,
    Referer:"http://210.38.137.126:8016/default2.aspx"
  });

  // console.log(postData);
  // console.log(cookie);

  postFormDataProminse(ApiAddress.login,assginHeaders,postData)
    .then(function(data){
            console.log('-----登录-----结束');
            // console.log(data);
            //解析data数据(result.text) -- html页面;
            var $ = cheerio.load(data);

            //判断是否登录成功
            var studentName=$('#xhxm').text();
            if (!studentName) {
              // return
              console.log('登录失败')
              //找出错误信息(正则表达式)
              var text=$('#form1 script').html();
              var reg=/'([^']*)'/;
              var loginFailInfo=reg.exec(text)[1];
              console.log(loginFailInfo);
              //错误信息 保存在locals变量中,供页面调用
              req.session.loginFailInfo=loginFailInfo;
              //退出
              _res.json(loginFailInfo);
              // _res.redirect('/err');
            }else{
              console.log(studentName + ' -- 登录成功');
              //清空错误信息
              req.session.loginFailInfo=null;
              //保存course数据
              // var courses   = $('.sub');
              //eq(0)--网上选课 eq(1)--报名或申请 eq(2)--教学质量评价
              var courses   = $('.sub').eq(2).find('a');
              if (courses) {
                for(var i=0,len=courses.length;i<len;i++){
                  var course = courses[i];
                  courseNameList[i]=course.children[0].data;
                  courseHrefList[i]=course.attribs.href;
                }
                console.log(courseNameList);
                console.log(courseHrefList);

                req.session.courseHrefList=courseHrefList;
              }else{
                console.log('无法获取课程');
                courseNameList=[];
                courseHrefList=[];
              }

              //TODO 保存每个课程成绩
            }
    });
}

exports.evaluation=function(req,res){
  var cookie="";
  if (req.session.saveCookie) {
    console.log('saveCookie = '+req.session.saveCookie);
    cookie = req.session.saveCookie;
  }else{
    res.json('请传cookie');
  }

}

function saveCourse(cookie,courseId,postData){

  var prominse=new Promise(function(resolve,reject){

    if (!cookie) {
      console.log('cookie not found');
      reject();
    }
    //组装post参数
    var postPath=ApiAddress.basePath+courseId;

    console.log(postPath);



  });



  return prominse;
}


function getDataProminse(path,headers,callback){
  console.log('prominse -- getDataProminse --start');
  var prominse = new Promise(function(resolve,reject){
    request.get(path)
            .set(headers)
            .end(function(err,result,body){
              if (err) {
                console.log(err);
                reject(err);
              }
              console.log('prominse -- getDataProminse --end');
              resolve(result);

            });
  });


  return prominse;
}

function postFormDataProminse(path,headers,postData,callback){
  console.log('prominse -- postFormData');
  var prominse=new Promise(function(resolve,reject){

      request.post(path)
          .charset("gb2312")
          .set(headers)
          .type("form")
          .send(postData)
          .end(function(err,result,body){
            if (err) {
              console.log('err');
              console.log(err);
              reject(err);
            }
            console.log(result.text);
            resolve(result.text);
          });

  });
  return prominse;
}