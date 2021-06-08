$(document).on("submit",function(event){
    var email = $('#email').val();
    var password = $('#password').val();

    var data = {
        "email": email,
        "password": password,
    }

    $.ajax({
        url: 'http://localhost:3000/user/login',
        type: 'POST',
        data: data,
        dataType: "json",
        success: function(data, textStatus, xhr){
            window.location.href = './quiz.html';
        },
        error: function(xhr, textStatus, errorThrown){
            var message =  JSON.parse(xhr.responseText);
            document.getElementById("errorMessage").innerHTML = message.error[0];
        }
    })
    event.preventDefault();
})