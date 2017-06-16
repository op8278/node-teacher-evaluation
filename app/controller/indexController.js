
var request = require("superagent"); //res.headers  res.header 共存
var charset = require("superagent-charset");
var cheerio = require("cheerio");
var qs = require("querystring");
var fs = require("fs");
var url = require("url");

var ApiAddress = require('../../config/apiAddress.js');
var DataConfig = require('../../config/dataConfig.js');

charset(request);

//组装Error对象
function assembleError(code,msg){
  var err = new Error(msg);
  err.code = code;
  err.msg = msg;
  return err;
}

//首页
exports.index = function(req,res,next){
  var cookie = "";
  var _res=res;
  console.log('-----首页-----');
  getDataProminse(ApiAddress.login,DataConfig.BASE_HEADER)
    .then((data)=>{
      console.log('-------进入getDataProminse登录的then');
      // console.log(data.headers);
      //获取cookie并保存cookie
      //cookie替换前 ASP.NET_SessionId=dcifgrq5vtvlnkmiwy5jpvvf; path=/
      cookie = String(data.headers["set-cookie"][0]).replace(/; path=\// , "");
      //cookie替换后 ASP.NET_SessionId=dcifgrq5vtvlnkmiwy5jpvvf
      req.session.saveCookie=cookie;
      var assginHeaders=Object.assign({},DataConfig.BASE_HEADER,{Cookie:cookie});

      //访问验证码 
      return getCheckCodeProminse(ApiAddress.checkCode,assginHeaders);
    })
    .then((data)=>{
      console.log('-------进入getDataProminse验证码的then');
      // console.log(data.headers);
      fs.writeFile('public/img/CheckCode.gif',data.body,(err)=>{
        if(err){
          console.log(err);
          throw new Error('写入图片错误');
        };
        console.log('checkCode.gif写入成功');
        _res.render('index',{
          title:"评价首页",
          CheckCode : "/img/CheckCode.gif",
          cookie1 : cookie
        });
      });
    })
    .catch((err)=>{
      console.log(err);
      console.log('登入首页错误');
      return _res.render('err');
    });
}

//登录 Post请求
exports.login = function(req,res,next){

  console.log('-----登录-----开始');
  var _res=res;//全局res对象
  var courseHrefList=[];//评价课程Url地址
  var courseNameList=[];//评价课程名字

  //获取post过来的account,password,验证码
  var receiveParam={
    txtUserName:req.body.account || "",
    TextBox2:req.body.password || "",
    txtSecretCode:req.body.checkCode || ""
  }
  //获取cookie
  var cookie = req.session.saveCookie || "" ;
  //组装Post参数和请求头
  var assemblePostParam = Object.assign({},DataConfig.LOGIN_CONFIG,receiveParam);
  var assembleLoginHeader = Object.assign({},DataConfig.BASE_HEADER,{
    Cookie:cookie,
  });

  //带有Referer
  postFormDataProminse(ApiAddress.login,assembleLoginHeader,assemblePostParam)
    .then((data)=>{
        console.log('-----登录-----结束');
        //解析data数据(result.text) -- html页面;
        var $ = cheerio.load(data.text);
        //判断是否登录成功
        var studentName=$('#xhxm').text(); //"XXX同学"
        var studentTrueName=studentName.replace("同学",""); //"XXX"
        if (!studentName) {
          console.log('-----登录-----失败');
          //找出错误信息(正则表达式)
          var text=$('#form1 script').html();
          var reg=/'([^']*)'/;
          var loginFailInfo=reg.exec(text)[1];
          console.log(loginFailInfo);
          //错误信息 保存在locals变量中,供页面调用
          req.session.loginFailInfo=loginFailInfo;
          //退出
           return Promise.reject(assembleError(1,loginFailInfo));
        }else{
          console.log('-----登录-----成功-----' + studentName);
          console.log('-----获取评价课程信息列表-----开始');
          //清空错误信息
          req.session.loginFailInfo = null;
          req.session.isEvaluated = false;
          req.session.courseFailInfo = null;
          //保存学号 例如201311672201
          req.session.account=receiveParam.txtUserName;
          //保存course数据
          // var courses   = $('.sub');
          //eq(0)--网上选课 eq(1)--报名或申请 eq(2)--教学质量评价
          var courses   = $('.sub').eq(2).find('a');
          if (courses && courses.length > 0) {
            for(var i=0,len=courses.length;i<len;i++){
              var course = courses[i];
              courseNameList[i]=course.children[0].data;
              courseHrefList[i]=ApiAddress.basePath+course.attribs.href;
            }
            console.log(courseNameList);
            console.log(courseHrefList);
            req.session.courseHrefList=courseHrefList;
          }else{
            console.log('-----获取评价课程信息列表-----失败----或者评价完成');
            //清空 course数据 列表
            courseNameList=[];
            courseHrefList=[];
            courseFailInfo = '你已评教完or现在不是评教时候'
            req.session.isEvaluated = false;
            req.session.courseFailInfo=courseFailInfo;

            return Promise.reject(assembleError(1,courseFailInfo));
          }
          var assembleCourseHeader = Object.assign({},DataConfig.BASE_HEADER,{
            Cookie:cookie,
            Referer:"http://210.38.137.126:8016/xs_main.aspx?xh="+req.session.account
          });
          console.log('-----获取评价课程信息列表-----结束');
          console.log('-----总体评教-----保存所有评教----开始');
          // var testCourseHrefList=[]
          // testCourseHrefList[0]=courseHrefList[0];
          // console.log(testCourseHrefList);
          return saveAllCourseProminse(req,cookie,courseHrefList);
        }
    })
    .then((data)=>{
      console.log('-----总体评教-----保存所有评教----结束----等待提交环节开始');
      console.log('-----总体评教-----提交所有评教----开始');
      console.log(data);
      req.session.isEvaluated=true;
      var lastData={
        path:data[data.length-1].path,
        headers:data[data.length-1].headers
      }
      console.log(lastData);
      return submitAllCourseProminse(req,cookie,lastData.path,lastData.headers);
    })
    .then((data)=>{
      console.log('-----总体评教-----提交所有评教----结束');
      console.log('-----总体评教-----结束----成功!!!');
      //TODO 响应提示信息
      return _res.apiSuccess('评教成功!!!');
    })
    .catch((err)=>{
      console.log(err);
      console.log('-----总体评教-----结束----失败!!!');
      return _res.apiError(err);
    });
}
//保存所有课程后的prominse
function saveAllCourseProminse(req,cookie,courseHrefList){
  var assembleCourseHeader = Object.assign({},DataConfig.BASE_HEADER,{
      Cookie:cookie,
      // Referer:"http://210.38.137.126:8016/xs_main.aspx?xh=201411672223" //TODO修改
      Referer:"http://210.38.137.126:8016/xs_main.aspx?xh="+req.session.account 
  });
  var prominses = courseHrefList.map((href,index)=>{
    console.log("ALL_PROMINSE"+href);
    return saveSingleCourseProminse(req,cookie,href,assembleCourseHeader,index);
  });
  return Promise.all(prominses);
}
//保存单个课程的prominse
function saveSingleCourseProminse(req,cookie,path,headers,index){
  return new Promise((resolve,reject)=>{
      //get请求获取单个课程信息
      getDataProminse(path,headers)
        .then((data)=>{
            //利用 cheerio 获取 需要传递的参数
            var $ = cheerio.load(data.text);
            //获取隐藏表单域字符，每一次提交评价必须带上
            var hiddenDom = $('input[type="hidden"]');

            var currentCourseName = $('#pjkc').find("option:selected").text();

            //不行因为
            // req.session.currentCourseName = currentCourseName;

            console.log('-----评教-----' + currentCourseName + '----开始');
            //获取课程号
            var args = url.parse(path,true);
            var button1Value = $('#Button1').val();
            var hiddenValue={
              Button1:"保存",
              pjkc:args.query['xkkh'],
              __EVENTTARGET:hiddenDom.eq(0).val() || "",
              __EVENTARGUMENT:hiddenDom.eq(1).val() || "",
              __VIEWSTATE:hiddenDom.eq(2).val() || ""
            }
            //组装Headers和PostParam
            var assembleEvaluationHeader = Object.assign({},DataConfig.BASE_HEADER,{
              Cookie:cookie,
              Referer:path
            });
            var assemblePostParam = Object.assign({},hiddenValue,DataConfig.EVALUATION_CONFIG);
            if (index === req.session.courseHrefList.length-1) {
              console.log('最后一个');
              req.session.lastPostData=assemblePostParam; //TODO解决undefind
            }
            return postFormDataProminse(path,assembleEvaluationHeader,assemblePostParam)
        })
        .then((data)=>{
            var $ = cheerio.load(data.text);
            var currentCourseName = $('#pjkc').find("option:selected").text();
            console.log('-----评教-----' + currentCourseName + '----成功'+'---'+index);
            var returnData={
              cookie:cookie,
              path:path,
              headers:headers
            }
            resolve(returnData);
        });
        //TODO 需要在这catch吗?
        // .catch((err)=>{
        //   console.log(err);
        //   reject(err);
        // });
  });
}
function submitAllCourseProminse(req,cookie,path,headers){
  return new Promise((resolve,reject)=>{
    var lastPostData=req.session.lastPostData || "";
    if (!lastPostData) {reject();}
    var assemblePostParam = Object.assign({},lastPostData,{
      Button2:"提交",
    });
    console.log(assemblePostParam);
    postFormDataProminse(path,headers,assemblePostParam)
      .then((data)=>{
        var $ = cheerio.load(data.text);
        var text=$('#Form1 script').html();
        console.log(text);
        // var reg=/'([^']*)'/;
        // var resultInfo=reg.exec(text)[1];
        // console.log(resultInfo);
        console.log('恭喜你评价完成'); //alert('你已完成评价')
        resolve();
      });
  });
}


function getDataProminse(path,headers){
  console.log('prominse -- getDataProminse --start');
  // console.log(headers);
  var prominse = new Promise((resolve,reject)=>{
    request.get(path)
            .charset("gb2312")  //获取的text是中文?  => 是的
            .set(headers)
            .end((err,result,body)=>{
              if (err) {
                console.log('prominse -- getDataProminse --error');
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
  var prominse = new Promise((resolve,reject)=>{
    request.get(path)
            .set(headers)
            .end((err,result,body)=>{
              if (err) {
                console.log('prominse -- getDataProminse -- error');
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
  console.log('prominse -- postFormData -- start');
  // console.log(path);
  // console.log(headers);
  // console.log(postData);
  var prominse = new Promise((resolve,reject)=>{
      request.post(path)
          .charset("gb2312")
          .set(headers)
          .type("form")
          .send(postData)
          .end((err,result,body)=>{
            if (err) {
              console.log('prominse -- postFormData -- error');
              console.log(err);
              reject(err);
            }
            console.log('prominse -- postFormData -- end');
            resolve(result);
          });
  });
  return prominse;
}
