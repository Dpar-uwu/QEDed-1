const urlSearchParams = new URLSearchParams(window.location.search);
let quizId = urlSearchParams.get("quizId");
var topicName;

$(document).ready(function(){
    getPastQuiz();

})

function getPastQuiz(){
    $.ajax({
        url: `/quiz/${quizId}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            topicName = data.topic_name;
            displayQuestion(data.questions)
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            window.location.href = "/404.html";
        }
    });
}

function displayQuestion(data){
    let container = document.getElementById("questions");

    for(let i = 0; i<data.length; i++){
        let icon = (data[i].isCorrect) ? '<i class="far fa-check-circle"></i>': '<i class="far fa-times-circle"></i>';

        if(topicName == 'Fractions'){
            let result = makeItFraction(data[i]);
            data[i]["question"] = result["question"];
            data[i]["answer"] = result["answer"];
            data[i]["correct_answer"] = result["correct_answer"];
        }

        container.innerHTML += `
        <tr>
            <th class="align-middle">${data[i].question_number}</th>
            <td class="align-middle">${data[i].question}</td>
            <td class="align-middle">${data[i].answer}</td>
            <td class="align-middle">${data[i].correct_answer}</td>
            <td class="align-middle">${icon}</td>
        </tr>
        `
    }
}

function makeItFraction(data){
    let needed = ["question","answer","correct_answer"];
    let result = {};

    for(let i = 0; i<3 ; i++){
        console.log(data)
        let fraction = '';
        let x = (data[needed[i]]).split(" ");

        if(x.length == 1){
            if(x[0].includes('/')){
                let y = x.toString().split('/');
                fraction = 
                `<span class="f">
                    <div class="n">${y[0]}</div>
                    <div class="d">${y[1]}</div>
                </span>`
            }
            else{
                fraction = `${data[needed[i]]}`
            }
        }
        else if(x.length == 2){
            let y = x[1].toString().split('/');
            fraction = 
            `<div class="d-flex justify-content-center align-items-center">${x[0]}
                <span class="f">
                        <div class="n">${y[0]}</div>
                        <div class="d">${y[1]}</div>
                </span>
            </div>`;
        }
        else if(x.length == 3){
            let y = x[0].toString().split('/');
            let z = x[2].toString().split('/');
            fraction = 
            `<div class="d-flex justify-content-center align-items-center">
                <div class="d-flex justify-content-center align-items-center me-3">
                    <span class="f">
                        <div class="n">${y[0]}</div>
                        <div class="d">${y[1]}</div>
                    </span>
                </div>
                ${x[1]}
                <div class="d-flex justify-content-center align-items-center ms-3">
                    <span class="f">
                        <div class="n">${z[0]}</div>
                        <div class="d">${z[1]}</div>
                    </span>
                </div>
            </div>
            `
        }
        
        result[needed[i]] = fraction;
    }
    return result;
}