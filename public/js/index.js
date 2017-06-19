$(document).ready(function(){
  //开启particles Canvas背景效果
  particlesJS.load('particles-js', '/js/particles.json', function() {
    // console.log('callback - particles.js config loaded');
  });

  var btnDefaultText='开始评教';
  var isEvaluated=false;
  var isEvaluating=false;

  var Dom={
    checkCode:$('#check-code'),
    btnSubmit:$('#btn-submit'),
    btnText:$('#btn-text'),
    loading:$('#loading'),
    formAccount:$('#account'),
    formPassowrd:$('#password'),
    formCheckCode:$('#checkCode'),
    hiddenCookie:$('#hiddenCookie'),
    imgCheckCode:$('#check-code')
  }

  //Ajax获取Cookie信息和验证码
  getCookieAndCheckCode(function(res){
    //判断是否成功
    //{code: 1, msg: "登入正方首页错误,网络有点差or海大服务器宕机"}
    //{"code":0,"msg":"获取cookie和首次验证码成功","data":{"cookie":"ASP.NET_SessionId=k20fpwzw5x5zfu45iktssz45","CheckCode":"/img/CheckCode.gif"}}
    console.log(res);
    //如果不成功,提示信息
    if (res.code ==1) {
      toogleBtnSubmit(res.msg);
      return ;
    }
    //关闭Loading状态栏
    toogleBtnSubmit(btnDefaultText);
    var responseData = res.data;
    Dom.hiddenCookie.text(responseData.cookie)
    Dom.imgCheckCode.attr('src',responseData.CheckCode);
  });

  Dom.checkCode.click(function(event){
    event.preventDefault();
    var cookie = Dom.hiddenCookie.text();
    //Ajax获取最新验证码图片
    refreshCheckCode(cookie,function(res){
      Dom.imgCheckCode.attr('src',res.data);
    });
  });
  Dom.btnSubmit.click(function(event){
    event.preventDefault(); //阻止默认表单提交行为Post
    Dom.btnSubmit.attr('disabled',true);
    var receiveParam={
      account:Dom.formAccount.val() || "",
      password:Dom.formPassowrd.val() || "",
      checkCode:Dom.formCheckCode.val() || ""
    }
    // console.log(receiveParam);
    if (!receiveParam.account || !receiveParam.password || !receiveParam.checkCode) {
       Dom.btnSubmit.attr('disabled',false);
       toogleBtnSubmit('请检查输入参数是否完整!');
       return ;
    }
    //AJAX请求
    //TODO AJAX请求时,屏蔽第二次Ajax请求
    $.ajax({
      url:'/login',
      type:'POST',
      dataType:'json',
      data:receiveParam,
      cache:false,
      beforeSend:function(){
        if (isEvaluating) {
          return false;
        }
        toogleBtnSubmit('正在评价...耐心等待...');
      },
      success:function(res){
        // console.log('返回评价信息--OK');
        //判断是否成功
        //{code: 1, msg: "你已评教完or现在不是评教时候"}
        //{code: 0, msg: "评教成功!!!"}
        console.log(res);
        Dom.btnSubmit.attr('disabled',false);
        toogleBtnSubmit(res.msg);
        //如果不成功,刷新验证码
        if (res.code ==1) {
          var cookie = Dom.hiddenCookie.text();
          // console.log('如果不成功,刷新验证码');
          isEvaluated = false;
          refreshCheckCode(cookie,function(checkCodeRes){
            Dom.imgCheckCode.attr('src',checkCodeRes.data);
            return ;
          });
        }
        //评价状态为成功
        //TODO 利用改值做些什么
        isEvaluated = true;
      },
      error:function(xhr,textStatus,errorThrown){
        console.log(xhr);
        console.log(textStatus);
        console.log(errorThrown);
        Dom.btnSubmit.attr('disabled',false);
        toogleBtnSubmit(textStatus);
      }
    });
  });
  function getCookieAndCheckCode(callback) {
    //开启Loading状态提示
    toogleBtnSubmit();
    $.ajax({
      url:'/getCookieAndCheckCode',
      type:'GET',
      dataType:'json',
      cache:false,
      success:function(res){
        //{code: 1, msg: "登入正方首页错误,网络有点差or海大服务器宕机"}
        //{"code":0,"msg":"获取cookie和首次验证码成功","data":{"cookie":"ASP.NET_SessionId=k20fpwzw5x5zfu45iktssz45","CheckCode":"/img/CheckCode.gif"}}
        callback(res);
      },
      error:function(xhr,textStatus,errorThrown){
        console.log(xhr);
        console.log(textStatus);
        console.log(errorThrown);
        toogleBtnSubmit(textStatus);
      }
    });
  }
  function refreshCheckCode(cookie,callback){
    var receiveParam = {
      cookie:cookie
    }
    // console.log(cookie);
    if (!cookie) {
      toogleBtnSubmit('刷新验证码错误!');
      return ;
    }
    $.ajax({
      url:'/refreshCheckCode',
      type:'POST',
      dataType:'json',
      data:receiveParam,
      cache:false,
      success:function(res){
        // console.log('返回刷新验证码信息--OK');
        // console.log(res);
        callback(res);
      },
      error:function(xhr,textStatus,errorThrown){
        console.log(xhr);
        console.log(textStatus);
        console.log(errorThrown);
        toogleBtnSubmit(textStatus);
      }
    });
  }
  function toogleBtnSubmit(showText){
    isEvaluating = !isEvaluating
    // console.log('isEvaluating=='+isEvaluating);
    if (showText) {
      Dom.btnText.text(showText);
    }else{
      Dom.btnText.text(btnDefaultText);
    }
    if (isEvaluating) {
      // Dom.btnText.hide();
      Dom.loading.show();
    }else{
      // Dom.btnText.show();
      Dom.loading.hide();
    }
  }



  function sleep(numberMillis) {
   var now = new Date();
   var exitTime = now.getTime() + numberMillis;
   while (true) {
      now = new Date();
      if (now.getTime() > exitTime)
      　　return;
      }
   }
});