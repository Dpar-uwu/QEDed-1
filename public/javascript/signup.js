var schoolOption = '';

$(document).ready(function(){
    getSchool();
})

function getSchool(){
    var data = {
        resource_id: 'ede26d32-01af-4228-b1ed-f05c45a1d8ee', // the resource id
        q: 'primary', // query for 'primary'
        limit: 200
    };
    $.ajax({
        url: 'https://data.gov.sg/api/action/datastore_search',
        data: data,
        dataType: 'JSON',
        success: function(data, textStatus, xhr) {
            for(var i =0; i<data.result.records.length; i++){
                schoolOption += `<option value='${data.result.records[i].school_name}'>${data.result.records[i].school_name}</option>`;
            }   
        },
        error: function(xhr, textStatus, errorThrown){
            console.log(errorThrown);
        }
    });
}

$(document).on("change","#role",function(){
    var content = '';
    var role = $('#role').val();
    var container = document.getElementById('studentContainer');

    if(role == 'student'){
        container.style.display = "block"
        content += `            
            <div>
                <select class="form-select rounded-pill" required id="grade">
                    <option value="1">Primary 1</option>
                    <option value="2">Primary 2</option>
                    <option value="3">Primary 3</option>
                    <option value="4">Primary 4</option>
                    <option value="5">Primary 5</option>
                    <option value="6">Primary 6</option>
                </select>
            </div>
            <div class="mt-2">
                <select class="form-select rounded-pill" required id="school">
                    ${schoolOption}                
                </select>
            </div>`;
            container.innerHTML = content;
    }
    else{
        container.style.display = "none"
    }
})

$(document).on('click',".showPassword",function(){
    var id = this.id;
    var input = document.getElementById(id.slice(0, -3));
    var type = "password";

    if (input.type === "password") {
      type = "text";
    }   
    
    input.type = type;
    $(this).children().toggleClass("fas fa-eye-slash fas fa-eye");
    
})

$(document).on('click','#signupBtn',function(event){
    var data = {
        "first_name": '',
        "last_name": '',
        "email": '',
        "password": '',
        "role": '',
        "gender": '',
    }

    for(key in data){
        if(key == 'gender'){
            data[key] = $('input:radio:checked').val();
        }else{
            data[key] = $('#'+ key).val();
            if(data[key] == ""){
                showError("Field is required", key)
                return false;
            }
        }
    }

    if($('#confirmPassword').val() == "" || $('#confirmPassword').val() == null){
        showError("Field is required", "confirmPassword");
        return false;
    }

    if($('input:checkbox:checked').val() == null){
        showError("Please agree to QEDed's Terms of Service and Privacy Policy", "agreement");
        return false;
    }

    if(data.role == 'student'){
        data.grade = $('#grade').val();
        data.school = $('#school').val();  
    }

    if(data.password == $('#confirmPassword').val()){
        $.ajax({
            url: 'http://localhost:3000/user',
            type: 'POST',
            data: data,
            dataType: "json",
            xhrFields: {
                withCredentials: true
            },
            success: function(data, textStatus, xhr){
                window.location.href = './login.html';
            },
            error: function(xhr, textStatus, errorThrown){
                var key;
                if(JSON.parse(xhr.responseText).code == "INVALID_REQUEST"){
                    var error = JSON.parse(xhr.responseText).error[0];
    
                    switch(error.split(" ")[0]){
                        case 'First' : key = "first_name"; break;
                        case 'Last' : key = "last_name"; break;
                        case 'Email': key = "email"; break;
                        case 'Role' : key = "role"; break;
                        case 'Gender' : key = "gender"; break;
                        case 'Password': key = "password"; break;
                        case 'Grade': key = "grade"; break;
                    }
                }
                else {
                    error = JSON.parse(xhr.responseText).error;
                }

            
                showError(error, key);
            }
        })
    }
    else{
        showError("Passwords does not match!", "password")
    }
    event.preventDefault();
})

function showError(message, key){
    var errorBox =  document.getElementById("alertBox");
    var errorText = document.getElementById("errorMessage");

    $('#' + key).focus();

    errorText.innerHTML = message
    errorBox.style.display = "block";
}

$(document).on("click", "#loginBtn", function(event){
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
            var remember = $('input:checkbox:checked');
            
            localStorage.setItem('token', data.accessTK);
            localStorage.setItem('userInfo', JSON.stringify(data.user));
            
            if(data.user.role == "admin")  window.location.href = './control.html';
            else window.location.href = './overview.html';
        },
        error: function(xhr, textStatus, errorThrown){
            var error, key;
            var message = JSON.parse(xhr.responseText);
            
            if(message.code == "INVALID_REQUEST") { //invalid_req code err returns array
                error = JSON.parse(xhr.responseText).error[0];
                switch(error.split(" ")[0]){
                    case 'Email': key = "email"; break;
                    case 'Password': key = "password"; break;
                }
            }
            else{
                error =  message.error;
            }
            showError(error, key);
        }
    })
    event.preventDefault();
})

// TODO: Remember me 
function rememberMe(){
    console.log("hi")
}