$(document).ready(function(){
    $(".header").load("rightbar.html", function () {
        document.getElementById("name").innerHTML = getName();
    });
    getRecommendation();
})

function getRecommendation(){
    $.ajax({
        url: `/quiz/recommendation?userId=${getUserId()}`,
        type: 'GET',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            let content = "";

            if(data.length > 0){
                for(let i = 0; i < data.weakest3.length; i++){
                    if(i == 0){
                        $('.dailyquizbutton').wrap(`<a href="quiz.html?skill=${data.weakest3[i]._id}"></a>`)
                    }
                    content += `<div><a href="quiz.html?skill=${data.weakest3[i]._id}">${data.weakest3[i].skill_name}</a></div>`
                }
    
                $('.trynowbox').html(content);
            }
            else{
                console.log()
                getPopularQuiz();
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("ERROR!" + xhr.responseText);
        }
    });
}

function getPopularQuiz(){
    $.ajax({
        url: `/quiz/popular`,
        type: 'GET',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            let content = "";

            for(let i = 0; i < data.length; i++){
                if(i == 0){
                    $('.dailyquizbutton').wrap(`<a href="quiz.html?skill=${data[i]._id}"></a>`)
                }
                content += `<div><a href="quiz.html?skill=${data[i]._id}">${data[i].skill_name}</a></div>`
            }

            $('.trynowbox').html(content);

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("ERROR!" + xhr.responseText);
        }
    });
}