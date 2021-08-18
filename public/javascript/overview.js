$(document).ready(function(){
    let role = JSON.parse(localStorage.getItem('userInfo')).role
    if(role == "admin") {
        window.location.href = "/control.html";
    }
    else if(role == "parent" || role == "teacher") {
        window.location.href = "/group.html";
    }
    $(".header").load("rightbar.html", function () {
        document.getElementById("name").innerHTML = getName();
    });
    getRecommendation();

    let user = JSON.parse(localStorage.getItem("userInfo"));
    let width = (user.exp_points / ((user.rank_level + 1) * 1000)) * 100;

    $('.progress-bar').css("width", width + '%');
    $('.progress-bar').html(Math.floor(width) + "%");
})

function getRecommendation(){
    let newSkills = [];
    $.ajax({
        url: `/quiz/recommendation?userId=${getUserId()}`,
        type: 'GET',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            let content = "";
            console.log(data)
            newSkills = data.newSkills;
            if(data.weakest3.length > 0){
                for(let i = 0; i < data.weakest3.length; i++){
                    if(i == 0){
                        $('.dailyquizbutton').wrap(`<a href="quiz.html?skill=${data.weakest3[i]._id}"></a>`)
                    }
                    content += `<div><a href="quiz.html?skill=${data.weakest3[i]._id}">${data.weakest3[i].skill_name}</a></div>`
                }
    
                $('.trynowbox').html(content);
            }
            else{
                getPopularQuiz(newSkills);
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("ERROR!" + xhr.responseText);
        }
    });
}

function getPopularQuiz(fallback){
    $.ajax({
        url: `/quiz/popular`,
        type: 'GET',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            let content = "";

            if(data.length >= 1)  {
                for(let i = 0; i < data.length; i++){
                    if(i == 0){
                        $('.dailyquizbutton').wrap(`<a href="quiz.html?skill=${data[i]._id}"></a>`)
                    }
                    content += `<div><a href="quiz.html?skill=${data[i]._id}">${data[i].skill_name}</a></div>`
                }
            }
            else {
                for(let i = 0; i < fallback.length; i++){
                    if(i == 0){
                        $('.dailyquizbutton').wrap(`<a href="quiz.html?skill=${fallback[i].skillId}"></a>`)
                    }
                    content += `<div><a href="quiz.html?skill=${fallback[i].skillId}">${fallback[i].skill_name}</a></div>`
                }
            }
            
            
            

            $('.trynowbox').html(content);

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("ERROR!" + xhr.responseText);
        }
    });
}