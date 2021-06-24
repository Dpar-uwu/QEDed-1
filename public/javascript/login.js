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
            var result = "";
            if(message.code == "INVALID_REQUEST") { //invalid_req code err returns array
                message.error.forEach(err => {
                    result += err + "<br>";
                })
            }
            else result =  message.error;
            document.getElementById("errorMessage").innerHTML = result;
        }
    })
    event.preventDefault();
})