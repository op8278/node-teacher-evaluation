$(document).ready(function(){
  // 开启particles Canvas背景效果
  particlesJS.load('particles-js', '/js/particles.json', function() {
    // console.log('callback - particles.js config loaded');
  });

  var btnDefaultText='开始评教';
  var isEvaluated=false; // 是否评估完成
  var isEvaluating=false; // 是否评估中

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

  // Ajax获取Cookie信息和验证码
  getCookieAndCheckCode(function(res){
    // 判断是否成功
    // {code: 1, msg: "登入正方首页错误,网络有点差or海大服务器宕机"}
    // {"code":0,"msg":"获取cookie和首次验证码成功","data":{"cookie":"ASP.NET_SessionId=k20fpwzw5x5zfu45iktssz45","CheckCode":"/img/CheckCode.gif"}}
    // 如果不成功,提示信息
    if (res.code == 1) {
      toogleBtnSubmit(res.msg,false);
      return ;
    }
    // 关闭Loading状态栏
    toogleBtnSubmit(btnDefaultText,false);
    var responseData = res.data;
    Dom.hiddenCookie.text(responseData.cookie) // 更新cookie
    Dom.imgCheckCode.attr('src',responseData.CheckCode); // 更新图片
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
    event.preventDefault(); // 阻止默认表单提交行为Post
    Dom.btnSubmit.attr('disabled',true); // 防止重复提交
    var receiveParam={
      account:Dom.formAccount.val() || "",
      password:Dom.formPassowrd.val() || "",
      checkCode:Dom.formCheckCode.val() || ""
    }
    if (!receiveParam.account || !receiveParam.password || !receiveParam.checkCode) {
       Dom.btnSubmit.attr('disabled',false);
       toogleBtnSubmit('请检查输入参数是否完整!',false);
       isEvaluating=false;
       return ;
    }
    // AJAX请求
    // TODO: AJAX请求时,屏蔽第二次Ajax请求
    $.ajax({
      url:'/login',
      type:'POST',
      dataType:'json',
      data:receiveParam,
      cache:false,
      beforeSend:function(){
        if (isEvaluating) {
          return false; // 防止重复提交
        }
        toogleBtnSubmit('正在评价...耐心等待...',true); // 里面会改变isEvaluating
        isEvaluating = true
      },
      success:function(res){
        // console.log('返回评价信息--OK');
        // 判断是否成功
        // {code: 1, msg: "你已评教完or现在不是评教时候"}
        // {code: 0, msg: "评教成功!!!"}
        // {code: 3, msg: "阻止多次提交!!!"}
        console.log(res);
        if (res.code === 3) { // 重复多次提交
          return // 不做任何处理
        }
        toogleBtnSubmit(res.msg,false);
        // 如果不成功,刷新验证码
        if (res.code ==1) {
          var cookie = Dom.hiddenCookie.text();
          isEvaluated = false;
          // 重新刷新验证码
          refreshCheckCode(cookie,function(checkCodeRes){
            Dom.imgCheckCode.attr('src',checkCodeRes.data);
            Dom.btnSubmit.attr('disabled',false); // 提交按钮复原
          });
          return;
        }
        // 评价状态为成功
        // TODO: 利用改值做些什么
        isEvaluated = true;
        Dom.btnSubmit.attr('disabled',false); // 提交按钮复原
      },
      error:function(xhr,textStatus,errorThrown){
        console.log(xhr);
        console.log(textStatus);
        console.log(errorThrown);
        Dom.btnSubmit.attr('disabled',false);
        toogleBtnSubmit(textStatus,false);
      },
      complete:function(){
        isEvaluating = false
      }
    });
  });
  function getCookieAndCheckCode(callback) {
    Dom.btnSubmit.attr('disabled',true);
    // 开启Loading状态提示
    toogleBtnSubmit(btnDefaultText,true);
    $.ajax({
      url:'/getCookieAndCheckCode',
      type:'GET',
      dataType:'json',
      cache:false,
      success:function(res){
        // {code: 1, msg: "登入正方首页错误,网络有点差or海大服务器宕机"}
        // {"code":0,"msg":"获取cookie和首次验证码成功","data":{"cookie":"ASP.NET_SessionId=k20fpwzw5x5zfu45iktssz45","CheckCode":"/img/CheckCode.gif"}}
        callback(res);
        // Dom.btnSubmit.attr('disabled',false);
      },
      error:function(xhr,textStatus,errorThrown){
        console.log(xhr);
        console.log(textStatus);
        console.log(errorThrown);
        toogleBtnSubmit(textStatus,false);
        // Dom.btnSubmit.attr('disabled',false);
      },
      complete:function(){
        Dom.btnSubmit.attr('disabled',false);
      }
    });
  }
  function refreshCheckCode(cookie,callback){
    var receiveParam = {
      cookie:cookie
    }
    if (!cookie) {
      toogleBtnSubmit('刷新验证码错误!',false);
      return ;
    }
    $.ajax({
      url:'/refreshCheckCode',
      type:'POST',
      dataType:'json',
      data:receiveParam,
      cache:false,
      success:function(res){
        callback(res);
      },
      error:function(xhr,textStatus,errorThrown){
        console.log(xhr);
        console.log(textStatus);
        console.log(errorThrown);
        toogleBtnSubmit(textStatus,false);
      }
    });
  }
  function toogleBtnSubmit(showText,isShowLoading){
    isEvaluating = !isEvaluating
    if (showText) {
      Dom.btnText.text(showText);
    }else{
      Dom.btnText.text(btnDefaultText);
    }
    if (isShowLoading) {
      Dom.loading.show();
    }else{
      Dom.loading.hide();
    }
  }
});