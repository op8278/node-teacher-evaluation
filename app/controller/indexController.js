//var request = require('request');
var request = require("superagent"); //res.headers  res.header 共存
var charset = require("superagent-charset");
var cheerio = require("cheerio");
var fs = require("fs");
var url = require("url");

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
      return getCheckCodeProminse(ApiAddress.checkCode,assginHeaders);
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
  });

  // console.log(postData);
  // console.log(cookie);

  postFormDataProminse(ApiAddress.login,assginHeaders,postData)
    .then(function(data){
            console.log('-----登录-----结束');
            // console.log(data);
            //解析data数据(result.text) -- html页面;
            var $ = cheerio.load(data.text);

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
                  courseHrefList[i]=ApiAddress.basePath+course.attribs.href;
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
              // return saveAllCourseDataProminse(assginHeaders,courseHrefList);

              //尝试保存最后一个课程
                var assginHeaders2 = Object.assign({},HeaderUtil.BASE_HEADER,{
                  Cookie:cookie,
                  Referer:"http://210.38.137.126:8016/xs_main.aspx?xh=201411672222"
                });
                console.log(assginHeaders2);

                getDataProminse(courseHrefList[0],assginHeaders2)
                .then((data1)=>{
                  // console.log(data1.text);
                    //利用 cheerio 获取 需要传递的参数
                    var $ = cheerio.load(data1.text);
                      /*获取隐藏表单域字符，每一次提交评价必须带上*/
                    var hiddenDom = $('input[type="hidden"]');
                    // var hiddenValue={
                    //   Button1          :  "保存",
                    //   __EVENTTARGET:hiddenDom.eq(0).val() || "",
                    //   __EVENTARGUMENT:hiddenDom.eq(1).val() || "",
                    //   __VIEWSTAT:hiddenDom.eq(2).val() || ""
                    // }
                    //OK
                    // console.log(hiddenValue);

                    //获取课程号
                    var args = url.parse(courseHrefList[0],true);
                    console.log(args);
                    console.log('-------');
                    console.log(args.query);
                    console.log('-------');
                    console.log(args.query['xkkh']);

                    // var xkkh = args.query['xkkh'];
                    // var xkkh = {
                    //   pjkc : args.query['xkkh']
                    // }
                    var hiddenValue={
                      Button1:"保存",
                      pjkc:args.query['xkkh'],
                      __EVENTTARGET:hiddenDom.eq(0).val() || "",
                      __EVENTARGUMENT:hiddenDom.eq(1).val() || "",
                      __VIEWSTAT:hiddenDom.eq(2).val() || ""
                    }

                    //组装postData
                    var sendData = Object.assign({},hiddenValue,HeaderUtil.postParmEvaluationOneTeacher);
                    // console.log(sendData);
                    var assginHeaders3 = Object.assign({},HeaderUtil.BASE_HEADER,{
                      Cookie:cookie,
                      Referer:courseHrefList[0]
                    });
                    postFormDataProminse(courseHrefList[0],assginHeaders3,sendData)
                      .then((data2)=>{
                        console.log('完成该课程验证');
                        console.log(courseHrefList[0]);
                        console.log(assginHeaders3);
                        console.log(data.headers);
                        // console.log(data2.text);
                      })

                });

            }
    });
    _res.render('err');
    // .then(function(datas){
    //   console.log('全部课程保存成功');
    // })
    // .catch(err){
    //   console.log(err);
    // }
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

//保存所有课程后的prominse
function saveAllCourseDataProminse(headers,courseHrefList){
  var prominses = courseHrefList.map(function(href){
    // var courseProminse = getDataProminse(href,headers);
    // return courseProminse;
    getDataProminse(href,headers).then(function(data){
      return saveSingleCourseDataProminse(data);
    })
  });
  return Promise.all(prominses);
}

//保存单个课程的prominse 
function saveSingleCourseDataProminse(data){

  //利用 cheerio 获取 需要传递的参数
  var $ = cheerio.load(data);
    /*获取隐藏表单域字符，每一次提交评价必须带上*/
  var hiddenDom = $('input[type="hidden"]');
  var hiddenValue={
    __EVENTTARGET:hiddenDom.eq(0).val(),
    __EVENTARGUMENT:hiddenDom.eq(1).val(),
    __VIEWSTAT:hiddenDom.eq(2).val()
  }

  var prominse=new Promise(function(resolve,reject){


    console.log(postPath);

});
  return prominse;
}


function getDataProminse(path,headers,charset){
  console.log('prominse -- getDataProminse --start');
  var prominse = new Promise(function(resolve,reject){
    request.get(path)
            .charset("gb2312")
            // .charset(null)
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
//TODO 解决charset问题
function getCheckCodeProminse(path,headers){
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

function postFormDataProminse(path,headers,postData){
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
            // resolve(result.text);
            resolve(result);
          });

  });
  return prominse;
}

