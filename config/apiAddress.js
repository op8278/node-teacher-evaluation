
//注意,此IP经常变动 192.168.1.103为 PC端 局域网的地址
//TODO此地址可以 用127.0.0.1来代替吗?
// const baseUrl="http://115.159.209.60/ocean";         //公网IP
// const baseApiUrl="http://115.159.209.60/ocean/api";  //公网IP
// const addApiUrl=baseApiUrl+"/ad" //后台添加数据的相关接口
const baseUrl="http://210.38.137.126:8016";
module.exports = {

  basePath:baseUrl+"/",

  login:baseUrl+"/default2.aspx",
  
  checkCode:baseUrl+"/CheckCode.aspx",

  courseTable:baseUrl+'/xskbcx.aspx'
  // http://210.38.137.126:8016/xskbcx.aspx?xh=201411672222&xm=%C2%AC%CE%B0%C1%C1&gnmkdm=N121602
}