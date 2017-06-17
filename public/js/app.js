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
    toogleBtnSubmit();
    var receiveParam={
      account:Dom.formAccount.val() || "",
      password:Dom.formPassowrd.val() || "",
      checkCode:Dom.formCheckCode.val() || ""
    }
    // console.log(receiveParam);
    if (!receiveParam.account || !receiveParam.password || !receiveParam.checkCode) {
       toogleBtnSubmit('请检查输入参数是否完整!');
       return ;
    }
    //AJAX请求
    $.ajax({
      url:'/login',
      type:'POST',
      dataType:'json',
      data:receiveParam,
      cache:false,
      success:function(res){
        // console.log('返回评价信息--OK');
        //判断是否成功
        //{code: 1, msg: "你已评教完or现在不是评教时候"}
        //{code: 0, msg: "评教成功!!!"}
        console.log(res);
        toogleBtnSubmit(res.msg);
        //如果不成功,刷新验证码
        if (res.code ==1) {
          var cookie = Dom.hiddenCookie.text();
          // console.log('如果不成功,刷新验证码');
          refreshCheckCode(cookie,function(checkCodeRes){
            Dom.imgCheckCode.attr('src',checkCodeRes.data);
            return ;
          });
        }
        //评价状态为成功
        //TODO 利用改值做些什么
        isEvaluated = true;
      }
    });
  });
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
      Dom.btnText.hide();
      Dom.loading.show();
    }else{
      Dom.btnText.show();
      Dom.loading.hide();
    }
  }
});