let userInfo = JSON.parse(localStorage.getItem('userInfo'));

$(document).ready(function(){
    getSchool();
    
    $("#account-fn").val(userInfo.first_name);
    $("#account-ln").val(userInfo.last_name);
    $("#account-email").val(userInfo.email);
    $("input:radio[name=inlineRadioOptions][value=" + userInfo.gender + "]").attr('checked',true);
    $("#account-role").val(userInfo.role);
    $("#levelOption").val(userInfo.grade);

    if(userInfo.role != "student"){
        $("#schoolOption").attr('disabled', 'disabled');
        $("#levelOption").attr('disabled', 'disabled');
    }
})

$(document).on("change","#account-role", function(){
    let role = $("#account-role").val();

    if(role != 'student'){
        $("#schoolOption").attr('disabled', 'disabled');
        $("#levelOption").attr('disabled', 'disabled');
    }
    else{
        $("#schoolOption").removeAttr('disabled');
        $("#levelOption").removeAttr('disabled');
    }
})
$(document).on("click", "#updateBtn", function(){

    let first_name = $("#account-fn").val();
    let last_name = $("#account-ln").val();
    let gender = $('input:radio:checked').val();
    let role = $("#account-role").val();

    let data = {
        "first_name": first_name,
        "last_name": last_name,
        "gender": gender,
        "role": role
    }

    if(role == 'student'){
        data["school"] = $("#schoolOption").val();
        data["grade"] = $("#levelOption").val();
    }

    updateAccount(data);
})

function getSchool() {
    let data = {
        resource_id: 'ede26d32-01af-4228-b1ed-f05c45a1d8ee', // the resource id
        q: 'primary', // query for 'primary'
        limit: 200 // Recieving limit
    };
    $.ajax({
        url: 'https://data.gov.sg/api/action/datastore_search',
        data: data,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            let schoolOption = document.getElementById("schoolOption");
            
            for (let i = 0; i < data.result.records.length; i++) {
                schoolOption.innerHTML += `<option value='${data.result.records[i].school_name}'>${data.result.records[i].school_name}</option>`;
            }

            $("#schoolOption").val(userInfo.school);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function updateAccount(data){
    let id = userInfo._id;
    $.ajax({
        url: `/user/${id}`,
        data: data,
        method: "PUT",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            console.log(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            let key;
            var error;
            console.log(xhr.responseText)
            if (JSON.parse(xhr.responseText).code == "INVALID_REQUEST") {
                error = JSON.parse(xhr.responseText).error[0];

                switch (error.split(" ")[0]) {
                    case 'First':
                        key = "account-fn";
                        break;
                    case 'Last':
                        key = "account-ln";
                        break;
                    case 'Role':
                        key = "account-role";
                        break;
                    case 'Gender':
                        key = "account-gender";
                        break;
                    case 'School':
                        key = "schoolOption";
                        break;
                    case 'Grade':
                        key = "levelOption";
                        break;
                }
                $(`#${key}`).focus();
            }
            else {
                error = JSON.parse(xhr.responseText).error;
            }
            document.getElementById("err").innerHTML = error;
        }
    })
}