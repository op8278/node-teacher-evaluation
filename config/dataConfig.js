
//评价等级
var ALL_LEVEL=['A','B','C','D','E'];


var HIGH_LEVEL=['A','D'];




exports.BASE_HEADER = {
  "Host"                    : "210.38.137.126:8016",
  "User-Agent"              : "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:53.0) Gecko/20100101 Firefox/53.0",
  "Accept"                  : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language"         : "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3",
  "Accept-Encoding"         : "gzip, deflate",
  "Referer"                 : "http://210.38.137.126:8016/default2.aspx",
  "Connection"              : "keep-alive",
  "Upgrade-Insecure-Requests": "1"
};

exports.LOGIN_CONFIG = {
  "__VIEWSTATE"             :   "dDwtNTE2MjI4MTQ7Oz61L6x6++KxDmUi3mVHED4viE+96g==",
  "RadioButtonList1"        :   "学生",
  "Textbox1"                :   "", //
  "Button1"                 :   "",
  "lbLanguage"              :   "",
  "hidPdrs"                 :   "",
  "hidsc"                   :   ""
  
};
// postParmEvaluationOneTeacher
exports.EVALUATION_CONFIG  = {
  //评价教师 
  // String.fromCharCode(66 + Math.floor(Math.random() * 2)
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
  "pjxx"                    : "是个负责任的老师!!棒!", 
  "txt1"                    : "",
  "TextBox1"                : 0

};
