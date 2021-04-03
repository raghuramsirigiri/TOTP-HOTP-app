let user = {};

function getqr(uname,temp_login){
  var data = {
    "uname":uname,
    "temp_login":temp_login
  };
  console.log(data);
  
  $.ajax({
    type : 'POST',
    url  : 'http://localhost:3000/tfa/setup',
    data: JSON.stringify(data),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    success :  function(result){
      console.log(result.message);
      $("#QR").attr('src',result.user_tfa.dataURL);;
    }
});
}

function login(url){
  // var data = $("#tfa1").serializeArray();
  var data = {
    "uname":$("#uname").val(),
    "upass":$("#upass").val()
  };
  console.log(data);
  $.ajax({
      type : 'POST',
      url  : 'http://localhost:3000/'+url,
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success :  function(result){
        console.log(result.message);
        if(result.status==200){
          user.uname = result.uname;
          user.temp_login = result.temp_login;

          if(!result.tfa_enabled){
            $("#login1").css("display", "none");
            $("#login3").css("display", "block");

            getqr(result.uname,result.temp_login);
  
          }else{
            $("#login1").css("display", "none");
            $("#login2").css("display", "block");
          }
        }
        

      }
  });
};

function register(){
  // var data = $("#tfa1").serializeArray();
  var data = {
    "uname":$("#uname").val(),
    "upass":$("#upass").val()
  };
  console.log(data);
  $.ajax({
      type : 'POST',
      url  : 'http://localhost:3000/register',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success :  function(result){
        console.log(result.message);
        $("#msg").html(result.message);
        $("#msg").fadeIn(1);
        $("#msg").animate({ opacity: 0 },5000);
      }
  });
}

function checkTOTP(){
  // var data = $("#tfa1").serializeArray();
  var data = {
    "uname":user.uname,
    "temp_login":user.temp_login,
    "token": $("#token2").val()
  };
  console.log(data);
  $.ajax({
      type : 'POST',
      url  : 'http://localhost:3000/tfa/enable',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success :  function(result){
        console.log(result.message);
        if(result.status==200){
          $("#login4").css("display", "none");
          $("#login5").css("display", "block");
        }
      }
  });
}

function verifyTOTP(){
  // var data = $("#tfa1").serializeArray();
  var data = {
    "uname":user.uname,
    "temp_login":user.temp_login,
    "token": $("#token1 ").val()
  };
  console.log(data);
  $.ajax({
      type : 'POST',
      url  : 'http://localhost:3000/tfa/verify',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success :  function(result){
        console.log(result.message);
        if(result.status==200){
          $("#login2").css("display", "none");
          $("#login5").css("display", "block");
        }
      }
  });
}


$(document).ready(function() {

  $("input#register").click(function() {
    register();
  });

  $("input#login").click(function() {
    login('login');
  });

  $("input#checkTOTP").click(function() {
    $("#login3").css("display", "none");
    $("#login4").css("display", "block");
  });

  $("input#submitTOTP2").click(function() {
    checkTOTP();
  });

  $("input#submitTOTP1").click(function() {
    verifyTOTP();
  });

});