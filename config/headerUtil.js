
//评价等级
var ALL_LEVEL=['A','B','C','D','E'];
var HIGH_LEVEL=['A','B'];

exports.BASE_HEADER = {
  
  "Host"                    : "210.38.137.126:8016",
  "User-Agent"              : "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:46.0) Gecko/20100101 Firefox/46.0",
  "Accept"                  : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language"         : "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3",
  "Accept-Encoding"         : "gzip, deflate",
  "Referer"                 : "http://210.38.137.126:8016/default2.aspx",
  "Connection"              : "keep-alive"
  
};

exports.LOGIN_CONFIG = {
  //  dDwtNTE2MjI4MTQ7Oz61L6x6++KxDmUi3mVHED4viE+96g==
  // dDwtNTE2MjI4MTQ7Oz61L6x6++KxDmUi3mVHED4viE+96g==
  // dDwtNTE2MjI4MTQ7Oz61L6x6++KxDmUi3mVHED4viE+96g==
  // "__VIEWSTATE"             :   "dDwyODE2NTM0OTg7Oz47AX3Zzu1TpcW9kTBcf7gpTWfX4g==",
  "__VIEWSTATE"             :   "dDwtNTE2MjI4MTQ7Oz61L6x6++KxDmUi3mVHED4viE+96g==",
  "RadioButtonList1"        :   "学生",
  "Button1"                 :   "",
  "lbLanguage"              :   "",
  "hidPdrs"                 :   "",
  "hidsc"                   :   ""
  
};

exports.postParmEvaluationOneTeacher = {

  // 评教 (A/B之间随机取值)
  //Math.floor(向下取整) // String.fromCharCode(66 + Math.floor(Math.random() * 2)
  "DataGrid1:_ctl2:JS1"     : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl2:txtjs1"  : "",
  "DataGrid1:_ctl3:JS1"     : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl3:txtjs1"  : "",
  "DataGrid1:_ctl4:JS1"     : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl4:txtjs1"  : "",
  "DataGrid1:_ctl5:JS1"     : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl5:txtjs1"  : "",
  "DataGrid1:_ctl6:JS1"     : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl6:txtjs1"  : "",
  "DataGrid1:_ctl7:JS1"     : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl7:txtjs1"  : "",
  "DataGrid1:_ctl8:JS1"     : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl8:txtjs1"  : "",
  "DataGrid1:_ctl9:JS1"     : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl9:txtjs1"  : "",
  "DataGrid1:_ctl10:JS1"    : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl10:txtjs1" : "",
  "DataGrid1:_ctl11:JS1"    : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl11:txtjs1" : "",
  "DataGrid1:_ctl12:JS1"    : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl12:txtjs1" : "",
  "DataGrid1:_ctl13:JS1"    : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl13:txtjs1" : "",
  "DataGrid1:_ctl14:JS1"    : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl14:txtjs1" : "",
  "DataGrid1:_ctl15:JS1"    : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl15:txtjs1" : "",
  "DataGrid1:_ctl16:JS1"    : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl16:txtjs1" : "",
  "DataGrid1:_ctl17:JS1"    : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl17:txtjs1" : "",
  "DataGrid1:_ctl18:JS1"    : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl18:txtjs1" : "",
  "DataGrid1:_ctl19:JS1"    : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl19:txtjs1" : "",
  "DataGrid1:_ctl20:JS1"    : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl20:txtjs1" : "",
  "DataGrid1:_ctl21:JS1"    : HIGH_LEVEL[Math.floor(Math.random() * 2)],
  "DataGrid1:_ctl21:txtjs1" : "",

   //评语
  "pjxx"                    : "是个负责人的老师", 
  "txt1"                    : "",
  "TextBox1"                : 0
}


 // console.log('-----登录-----开始');
 //  request.post(ApiAddress.login)
 //          .charset("gb2312")
 //          .set(HeaderUtil.BASE_HEADER)
 //          .set("Cookie",cookie)
 //          .set("Referer" , "http://210.38.137.126:8016/default2.aspx")
 //          .type("form")
 //          .send(HeaderUtil.LOGIN_CONFIG)
 //          .send(postData)
 //          .end(function(err,result,body){
 //            if (err) {
 //              console.log('err');
 //              console.log(err);
 //              req.session.loginFailInfo=err;
 //              _res.redirect('/err');
 //            }
 //            console.log('-----登录-----结束');
 //            console.log(result.text);


 //            var $ = cheerio.load(result.text);
 //            if ($('#xhxm').text()) {
 //              console.log('学生存在 -- 登录成功');
 //              console.log($('#xhxm').text());

 //              req.session.loginFailInfo=null;

 //              //保存course数据
 //              // var courses   = $('.sub');
 //              //eq(0)--网上选课 eq(1)--报名或申请 eq(2)--教学质量评价
 //              var courses   = $('.sub').eq(2).find('a');
 //              // console.log(courses[0]);
 //              // console.log(courses[0].attribs.href);
 //              // console.log(courses[0].children[0].data);
 //              if (courses) {
 //                for(var i=0,len=courses.length;i<len;i++){
 //                  var course = courses[i];
 //                  courseNameList[i]=course.children[0].data;
 //                  courseHrefList[i]=course.attribs.href;
 //                }
 //                console.log(courseNameList);
 //                console.log(courseHrefList);

 //                req.session.courseHrefList=courseHrefList;
 //              }else{
 //                console.log('无法获取课程');
 //                courseNameList=[];
 //                courseHrefList=[];
 //              }
 //            }else{
 //              console.log('登录失败')
 //              //正则表达式
 //              var text=$('#form1 script').html();
 //              var reg=/'([^']*)'/;
 //              var loginFailInfo=reg.exec(text)[1];
 //              console.log(loginFailInfo);

 //              //错误信息 保存在locals变量中,供页面调用
 //              req.session.loginFailInfo=loginFailInfo;
 //              // var prom = new Promise((resolve,reject)=>{
 //              //   console.log('prominse');
 //              //   resolve();
 //              // });
 //              // prom.then(()=>{
 //              //   console.log('then - prominse');
 //              // });
 //            }
 //            //转发到评价页
 //            res.redirect('/');
 //          });