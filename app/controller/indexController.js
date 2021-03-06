
var request = require("superagent"); //res.headers res.header 共存
var charset = require("superagent-charset");
var cheerio = require("cheerio");
var qs = require("querystring");
var fs = require("fs");
var url = require("url");

var ApiAddress = require('../../config/apiAddress.js');
var DataConfig = require('../../config/dataConfig.js');

charset(request);

// 组装Error对象
function assembleError(code,msg){
  var err = new Error(msg);
  err.code = code;
  err.msg = msg;
  return err;
}

// 刷新验证码接口
exports.refreshCheckCode=function(req,res,next){
  var cookie = req.body.cookie || "";
  var _res = res;
  var randomSuffix=Math.floor(Math.random() * 10);
  if (!cookie) {
    console.log('请传入正确的cookie');
    return _res.apiError({code:1,msg:'请传入正确的cookie'});
  }
  // 带着cookie请求验证码
  var assginHeaders=Object.assign({},DataConfig.BASE_HEADER,{Cookie:cookie});
  // 访问验证码 
  getCheckCodeProminse(ApiAddress.checkCode,assginHeaders)
    .then((data)=>{
      fs.writeFile('public/img/CheckCodeRefresh'+randomSuffix+'.gif',data.body,(err)=>{
        if(err){
          console.log(err);
          return Promise.reject(assembleError(1,'写入图片错误'));
        };
        console.log('CheckCodeRefresh.gif写入成功');
        return _res.apiSuccess('刷新验证码成功','/img/CheckCodeRefresh'+randomSuffix+'.gif');
      });
    })
    .catch((err)=>{
      console.log(err);
      console.log('刷新验证码失败');
      return _res.apiError('刷新验证码失败');
    });
}
// 首页
exports.index = function(req,res,next){
  var cookie = req.session.saveCookie || '';
  var date = new Date();
  console.log('-----首页-----' + date);
  res.render('index',{
      title: "海大一键评教系统",
      CheckCode : '',
      cookie : cookie
  });
}

// 获取Cookie和验证码
exports.getCookieAndCheckCode = function(req,res,next){
  var cookie = '';
  var _res = res;
  getDataProminse(ApiAddress.login,DataConfig.BASE_HEADER)
    .then((data)=>{
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
      fs.writeFile('public/img/CheckCode.gif',data.body,(err)=>{
        if(err){
          console.log(err);
          return Promise.reject(assembleError(1,'写入图片错误'));
        };
        console.log('checkCode.gif写入成功');
        return _res.apiSuccess('获取cookie和首次验证码成功',{
          cookie: cookie,
          CheckCode : '/img/CheckCode.gif'
        });
      });
    })
    .catch((err)=>{
      console.log(err);
      console.log('登入正方首页错误,可能网络有点差or海大服务器宕机');
      return _res.apiError(err);
    });
}
// 登录 Post请求
exports.login = function(req,res,next){
  var loginDate = new Date();
  console.log('-----登录-----开始-----' + loginDate);

  var _res=res; // 全局res对象
  var courseHrefList=[]; // 评价课程Url地址
  var courseNameList=[]; // 评价课程名字
  
  var isEvaluating = req.session.isEvaluating || false; // 是否正在评教标志位
  console.log('isEvaluating ---' + isEvaluating)
  if (isEvaluating) {
    // 防止多次提交
    console.log('阻止多次提交');
    return _res.apiError(3,'阻止多次提交');
  }
  req.session.isEvaluating = true;

  // 获取post过来的account,password,验证码
  var receiveParam={
    txtUserName:req.body.account || "",
    TextBox2:req.body.password || "",
    txtSecretCode:req.body.checkCode || ""
  }
  // 获取cookie
  var cookie = req.session.saveCookie || "" ;
  // 组装Post参数和请求头
  var assemblePostParam = Object.assign({},DataConfig.LOGIN_CONFIG,receiveParam);
  var assembleLoginHeader = Object.assign({},DataConfig.BASE_HEADER,{
    Cookie:cookie,
  });

  // 带有Referer
  postFormDataProminse(ApiAddress.login,assembleLoginHeader,assemblePostParam)
    .then((data)=>{
        console.log('-----登录-----结束----正在验证登录结果');
        // 解析data数据(result.text) -- html页面;
        var $ = cheerio.load(data.text);
        // 判断是否登录成功
        var studentName = $('#xhxm').text(); //"XXX同学"
        // var studentTrueName=studentName.replace("同学",""); //"XXX"
        if (!studentName) {
          console.log('-----登录-----失败');
          // 找出错误信息(正则表达式)
          var text = $('#form1 script').html();
          var reg = /'([^']*)'/;
          var loginFailInfo = reg.exec(text)[1];
          console.log(loginFailInfo);
          // 错误信息 保存在locals变量中,供页面调用
          req.session.loginFailInfo = loginFailInfo;
          req.session.isEvaluating = false;
          // 退出
          return Promise.reject(assembleError(1,loginFailInfo));
        }else{
          var getCoursesInfoDate = new Date();
          console.log('-----登录-----成功-----' + studentName);
          console.log('-----获取评价课程信息列表-----开始-----' + getCoursesInfoDate);
          // 清空错误信息
          req.session.loginFailInfo = null;
          req.session.isEvaluated = false; // 是否评教完成
          req.session.courseFailInfo = null;
          // 保存学号 例如201311672201
          req.session.account = receiveParam.txtUserName;
          req.session.studentName = studentName;

          console.log('-----获取评价课程信息列表-----结束-----正在验证获取课程信息结果');
          // 保存course数据
          // var courses   = $('.sub');
          // eq(0)--网上选课 eq(1)--报名或申请 eq(2)--教学质量评价
          var courses   = $('.sub').eq(2).find('a');
          if (courses && courses.length > 0) {
            for(var i=0,len=courses.length;i<len;i++){
              var course = courses[i];
              courseNameList[i]=course.children[0].data;
              courseHrefList[i]=ApiAddress.basePath+course.attribs.href;
            }
            console.log('-----获取评价课程信息列表-----成功-----展示课程信息...');
            console.log(courseNameList);
            req.session.courseHrefList=courseHrefList;
          }else{
            console.log('-----获取评价课程信息列表-----失败-----或者评价完成');
            // 清空 course数据 列表
            courseNameList=[];
            courseHrefList=[];
            courseFailInfo = '你已评教完成 或 目前正方评教接口未开放'
            req.session.isEvaluated = false;
            req.session.isEvaluating = false;
            req.session.courseFailInfo=courseFailInfo;
            return Promise.reject(assembleError(1,courseFailInfo));
          }
          var assembleCourseHeader = Object.assign({},DataConfig.BASE_HEADER,{
            Cookie:cookie,
            Referer:"http://210.38.137.126:8016/xs_main.aspx?xh="+req.session.account
          });
          var saveCoursesDate = new Date();
          console.log('-----总体评教-----保存所有评教-----开始-----' + saveCoursesDate);
          return saveAllCourseProminse(req,cookie,courseHrefList);
        }
    })
    .then((data)=>{
      console.log('-----总体评教-----保存所有评教-----结束-----等待提交环节开始');
      console.log('-----总体评教-----提交所有评教-----开始');
      req.session.isEvaluated=true;
      var lastData={
        path:data[data.length-1].path,
        headers:data[data.length-1].headers
      }
      return submitAllCourseProminse(req,cookie,lastData.path,lastData.headers);
    })
    .then((data)=>{
      var completeDate = new Date();
      console.log('-----总体评教-----提交所有评教-----结束');
      console.log('-----总体评教-----结束-----成功!!!-----'+completeDate);
      return _res.apiSuccess('评教成功!请登录教务系统进一步确认');
    })
    .catch((err)=>{
      console.log(err);
      console.log('-----总体评教-----结束-----失败!!!');
      req.session.isEvaluating = false;
      req.session.isEvaluated = false;
      return _res.apiError(err);
    });
}
// 保存所有课程后的prominse
function saveAllCourseProminse(req,cookie,courseHrefList){
  var assembleCourseHeader = Object.assign({},DataConfig.BASE_HEADER,{
      Cookie:cookie,
      Referer:"http://210.38.137.126:8016/xs_main.aspx?xh="+req.session.account 
  });
  var prominses = courseHrefList.map((href,index)=>{
    return saveSingleCourseProminse(req,cookie,href,assembleCourseHeader,index);
  });
  return Promise.all(prominses);
}
// 保存单个课程的prominse
function saveSingleCourseProminse(req,cookie,path,headers,index){
  return new Promise((resolve,reject)=>{
      // get请求获取单个课程信息
      getDataProminse(path,headers)
        .then((data)=>{
            // 利用 cheerio 获取 需要传递的参数
            var $ = cheerio.load(data.text);
            // 获取隐藏表单域字符，每一次提交评价必须带上
            var hiddenDom = $('input[type="hidden"]');
            var currentCourseName = $('#pjkc').find("option:selected").text();
            // 判断是否需要判断是有需要 评价2个教师 3个教师 教材
            var isNeedTextBook = $('#lblPjc').text();
            var isTwoTeacher = $('#DataGrid1__ctl2_JS2');
            var isThreeTeacher = $('#DataGrid1__ctl2_JS3');

            console.log('-----评教-----' + currentCourseName + '----开始');

            // 获取课程号
            var args = url.parse(path,true);
            var hiddenValue={
              Button1:"保存",
              pjkc:args.query['xkkh'],
              __EVENTTARGET:hiddenDom.eq(0).val() || "",
              __EVENTARGUMENT:hiddenDom.eq(1).val() || "",
              __VIEWSTATE:hiddenDom.eq(2).val() || ""
            }
            // 组装Headers和PostParam
            var assembleEvaluationHeader = Object.assign({},DataConfig.BASE_HEADER,{
              Cookie:cookie,
              Referer:path
            });

            // 组装需要post的参数
            var assemblePostParam = Object.assign({},hiddenValue,DataConfig.EVALUATION_CONFIG);
            if (isNeedTextBook) {
              assemblePostParam = Object.assign({},assemblePostParam,DataConfig.EVALUATION_TEXTBOOK)
            }
            if (isTwoTeacher) {
               assemblePostParam = Object.assign({},assemblePostParam,DataConfig.EVALUATION_CONFIG_TWO_TEACHER)
            }
            if (isThreeTeacher) {
               assemblePostParam = Object.assign({},assemblePostParam,DataConfig.EVALUATION_CONFIG_THREE_TEACHER)
            }
            
            if (index === req.session.courseHrefList.length-1) {
              console.log('最后一个');
              req.session.lastPostData=assemblePostParam; // TODO:解决undefind
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
        })
        .catch((err)=>{
          console.log(err);
          reject(err);
        });
  });
}

// 最终提交
function submitAllCourseProminse(req,cookie,path,headers){
  return new Promise((resolve,reject)=>{
    var lastPostData=req.session.lastPostData || "";
    var studentName=req.session.studentName || "";
    if (!lastPostData) {reject();}
    var assemblePostParam = Object.assign({},lastPostData,{
      Button2:"提交",
    });
    postFormDataProminse(path,headers,assemblePostParam)
      .then((data)=>{
        var $ = cheerio.load(data.text);
        var text=$('#Form1 script').eq(1).html();
        console.log(text);
        var reg=/'([^']*)'/;
        var resultInfo=reg.exec(text)[1];
        console.log(resultInfo);
        console.log(studentName +' 恭喜你评价完成'); //alert('你已完成评价')
        resolve();
      });
  });
}
// 普通get请求获取数据
function getDataProminse(path,headers){
  var prominse = new Promise((resolve,reject)=>{
    request.get(path)
            .charset("gb2312") // 获取的text是中文? => 是的
            .set(headers)
            .end((err,result,body)=>{
              if (err) {
                err.msg="正方服务器错误(确保海大正方网页能登上去)";
                reject(err);
              }
              resolve(result);
            });
  });
  return prominse;
}
// TODO: 解决charset问题(同getDataProminse复用代码)
// 获取验证码
function getCheckCodeProminse(path,headers){
  var prominse = new Promise((resolve,reject)=>{
    request.get(path)
            .set(headers)
            .end((err,result,body)=>{
              if (err) {
                err.msg="获取验证码错误";
                reject(err);
              }
              resolve(result);
            });
  });
  return prominse;
}
// 提交单个课程
function postFormDataProminse(path,headers,postData){
  var prominse = new Promise((resolve,reject)=>{
      request.post(path)
          .charset("gb2312")
          .set(headers)
          .type("form")
          .send(postData)
          .end((err,result,body)=>{
            if (err) {
              err.msg="正方服务器错误(确保海大正方网页能登上去)";
              reject(err);
            }
            resolve(result);
          });
  });
  return prominse;
}
