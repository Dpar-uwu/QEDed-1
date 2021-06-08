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
    var content = ''
    var role = $('#role').val();
    var container = document.getElementById('container');
    container.innerHTML = '';

    if(role == 'student'){
        content += `            
            <div class="form-group">
                <select class="form-control" required id="grade">
                    <option value="1">Primary 1</option>
                    <option value="2">Primary 2</option>
                    <option value="3">Primary 3</option>
                    <option value="4">Primary 4</option>
                    <option value="5">Primary 5</option>
                    <option value="6">Primary 6</option>
                </select>
            </div>
            <div class="form-group">
                <select class="form-control" required id="school">
                    ${schoolOption}                
                </select>
            </div>`;
            container.innerHTML = content;
    }
})
$(document).on("submit",function(event){
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
        }
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
            success: function(data, textStatus, xhr){
                window.location.href = './quiz.html';
            },
            error: function(xhr, textStatus, errorThrown){
                var message =  JSON.parse(xhr.responseText);
                document.getElementById("errorMessage").innerHTML = message.error[0];
            }
        })
    }
    else{
        document.getElementById("errorMessage").innerHTML = 'Passwords does not match!';
    }
    event.preventDefault();
})