const urlSearchParams = new URLSearchParams(window.location.search);
let token = urlSearchParams.get("token");
let id = urlSearchParams.get("id");

/* EVENT LISTENER */
$(document).ready(function(){
    // tokenExist();
    if(window.location.toString().includes("token=")){
        $("#forget").attr("id","reset");
        $("#input").attr("type", "Password");
        $("#input").attr("placeholder", "Password");
        $("#instructions").text('Please enter your new password');
    }
})

$(document).on("click", "#forget", function(){
    let email = $('#input').val();
    console.log("forget 1");
    requestPasswordReset(email);
})

$(document).on("click", "#send", function(){
    sendEmail();
})

//sendEmail();

$(document).on("click", "#reset", function(){
    let password = $('#input').val();
    console.log("forget 2");
    resetPassword(password);
})

/* API CALLS */
function requestPasswordReset(email){
    $.ajax({
        url: '/user/resetPasswordRequest',
        type: "POST",
        data: {"email": email},
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            console.log("success requestPasswordReset");
            document.getElementsByClassName('round')[0].style.display = "none";
            document.body.innerHTML += "<h5>An email has been sent to your account for resetting of password</h5>";
        },
        error: function (xhr, textStatus, errorThrown) {
            const err = xhr.responseJSON;

            if(err.code == "INVALID_REQUEST"){
                document.getElementById("errMessage").innerHTML= err.error[0];
            }
            else{
                document.getElementById("errMessage").innerHTML = err.error;
            }

            $('#input').focus();
        }
    });
}

function resetPassword(password){
    let data = {
        "userId": id,
        "token": token,
        "password": password
    };
    $.ajax({
        url: '/user/resetPassword',
        type: "PUT",
        data: data,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            console.log("success resetPassword");
            document.getElementsByClassName('round')[0].style.display = "none";
            document.body.innerHTML += "<h5>Your password have been successfully updated!</h5><a href='login.html'>Return to Login</a>";
          
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(xhr)
            const err = xhr.responseJSON;

            if(err.code == "INVALID_REQUEST"){
                document.getElementById("errMessage").innerHTML= err.error[0];
            }
            else{
                document.getElementById("errMessage").innerHTML = err.error;
            }

            $('#input').focus();

        }
    });
}

function sendEmail(){
    $.ajax({
        url: '/user/sendemail',
        type: "POST",
        success: function (data, textStatus, xhr) {
            console.log("success email sent");
        },
        error: function (xhr, textStatus, errorThrown) {
            const err = xhr.responseJSON;

            if(err.code == "INVALID_REQUEST"){
                document.getElementById("errMessage").innerHTML= err.error[0];
            }
            else{
                document.getElementById("errMessage").innerHTML = err.error;
            }

            $('#input').focus();
        }
    });
}

function contact(email){
    $.ajax({
        url: '/user/contact',
        type: "POST",
        data: {"email": email},
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            console.log("success email sent");
            //document.getElementsByClassName('round')[0].style.display = "none";
            //document.body.innerHTML += "<h5>An email has been sent to your account for resetting of password</h5>";
        },
        error: function (xhr, textStatus, errorThrown) {
            const err = xhr.responseJSON;

            if(err.code == "INVALID_REQUEST"){
                document.getElementById("errMessage").innerHTML= err.error[0];
            }
            else{
                document.getElementById("errMessage").innerHTML = err.error;
            }

            $('#input').focus();
        }
    });
}


// function tokenExist(){
//     $.ajax({
//         url: 'http://localhost:3000/user/refresh_token',
//         method: 'POST',
//         dataType: 'JSON',
//         xhrFields: {
//             withCredentials: true
//         },
//         success: function(data, textStatus, xhr) {
//             let token = data.accessToken;
//             let base64Url = token.split('.')[1]; // token you get
//             let base64 = base64Url.replace('-', '+').replace('_', '/');
//             let decodedData = JSON.parse(window.atob(base64));
            
//             localStorage.setItem('token', token);

//                 if (decodedData.issuedRole == "admin") {
//                     window.location.href = './control.html'; //Admin to control page
//                 }
//                 else {
//                     window.location.href = './overview.html';
//                 }

//         },
//         error: function(xhr, textStatus, errorThrown){
//             document.body.style.display = "block";
//             document.getElementsByClassName('lds-ellipsis')[0].style.display = "none";
//         }
//     });
// }
