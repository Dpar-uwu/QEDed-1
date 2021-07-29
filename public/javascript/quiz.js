var intervalId, countdown, quizData, questionArray = [];

// Function to generated number between min and max (both included)
function generateRandomNumber(min,max){
    return Math.floor( Math.random() * (max - min + 1) ) + min;
}

const fraction = {
    getGCD : (a, b) => {
        if(b == 0){
            return a;
        }
        else{
            return fraction.getGCD(b, a % b);
        }
    },
    add : (array) => {
        // a/b + c/d
        numerator = array.a * array.d + array.b * array.c;
        denominator = array.b * array.d;
        return fraction.proper(numerator, denominator);
    },
    multiply : (array) => {
        // a/b + c/d
        numerator = array.a * array.c;
        denominator = array.b * array.d;
        return fraction.proper(numerator, denominator);
    },
    proper : (numerator, denominator) => {
        var result = {"numerator": numerator, "denominator": denominator};
        if((numerator >= denominator)){
            result = {};
            result['whole'] = Math.floor(numerator/denominator);
            if(numerator != denominator && numerator%denominator != 0){
                result['numerator'] = numerator - (denominator * result['whole']);
                result['denominator'] = denominator;
            }
        }
        return result;
    },
    sort : (array) => {
        var sorted = {};
        const alphabets = ["a", "b", "c", "d"];
        for(let i = 0; i<array.length; i++){
            sorted[alphabets[i]] = array[i];
        }
        return sorted;
    },
    checkDuplicates : (sorted) => {
        for(let  i= 0; i < questionArray.length; i++){
            var dupes = true;
            for(key in sorted){
                if(questionArray[i][key] != sorted[key]){
                    dupes = false;
                    break;
                } 
            }
            if (dupes) break;
        }
        return dupes;
    },
    stringQuestion: (question) => {
        var result = question.a + "/" + question.b;
        if(quizData.skill_code != 'FRAC_SIMPLIFY'){
            (quizData.skill_code == 'FRAC_ADD') ? operator = " + " : operator = " x ";
            result = question.a + "/" + question.b + operator + question.c + "/" + question.d;
        }
        return result;
    },
    stringAnswer: (answer) => {
        var result;
        if('ansA' in answer){
            ('ans' in answer) ? result = answer.ans + " " + answer.ansA + "/" + answer.ansB : result = answer.ansA + "/" + answer.ansB;
        }
        else{
            result = answer.ans;
        }
        return result;
    },
    generateQuestion : (quizData) => {
        const numOfQ = quizData.num_of_qn;
        const percentDifficulty = quizData.percent_difficulty.split("-");
        const numOfEasy = numOfQ * (percentDifficulty[0]/100);
        const numOfMedium = numOfQ * (percentDifficulty[1]/100);

        for(let i = 0; i < numOfQ; i++){
            var checkpoint = true, key = "difficult_values", amount = 4, gcd, ans, sorted;
    
            if(i < numOfEasy){
                key = "easy_values";
            }
            else if(i < numOfEasy + numOfMedium){
                key = "medium_values";
            }
    
            if (quizData.skill_code == 'FRAC_SIMPLIFY') amount = 2;
    
            while(checkpoint){
                var numberArray = [];
                for(let l = 0; l<amount ; l++){
                    numberArray.push(generateRandomNumber(quizData[key].min, quizData[key].max));
                } 
                
                var sorted = fraction.sort(numberArray); 
                var dupes = (questionArray.length != 0) ? fraction.checkDuplicates(sorted): false;
                
                if(!dupes){
                    if(quizData.skill_code == 'FRAC_SIMPLIFY'){
                        gcd = fraction.getGCD(sorted.a, sorted.b);
                        if (gcd != 1 && sorted.a != sorted.b){
                            ans = fraction.proper(sorted.a, sorted.b);
                            checkpoint = false;
                        }
                    }
                    else{
                        if(sorted.a != sorted.b && sorted.c != sorted.d){
                            (quizData.skill_code == 'FRAC_ADD') ? ans = fraction.add(sorted) : ans = fraction.multiply(sorted);
                            if(ans.numerator != null) gcd = fraction.getGCD(ans.numerator, ans.denominator);
                            checkpoint = false;
                        }
                    }  
                }
            }
            questionArray.push(sorted);
            if('whole' in ans) questionArray[i].ans = ans.whole;
            if('numerator' in ans) questionArray[i].ansA = ans.numerator / gcd;
            if('denominator' in ans) questionArray[i].ansB = ans.denominator / gcd;
        }
    },
    arrangeQuestion : () => {
        var content = "", amount = 3;
        if(quizData.skill_code == 'FRAC_SIMPLIFY') amount = 2;

        for(let i=0; i < questionArray.length; i++){
            content += `<div class="row col-9 justify-content-center align-items-center text-center m-auto mb-3"><div class="small col-md-2">Question ${i+1}</div>`;
            for(let l = 0; l < amount; l++){
                var operator = null, wholeInput = "", className = 'col-12', name = 'col-12';
                var holderA = questionArray[i].a;
                var holderB = questionArray[i].b;
    
                if(l == 1){
                    holderA = questionArray[i].c;
                    holderB = questionArray[i].d;
                }
                if(l == amount-1) {
                    if('ans' in questionArray[i]) {
                        className = 'col-6 p-0';
                        if('ansA' in questionArray[i]) name = 'col-6 d-flex justify-content-end p-1'
                        wholeInput = `<div class="${name}"><input class="text-center" size="1" id='input${i}'></div>`
                    }
                    if('ansA' in questionArray[i]){
                        holderA = `<input class="text-center" size = "1" id='inputA${i}'>`;
                        holderB = `<input class="text-center" size = "1" id='inputB${i}'>`;
                    }   
                    else{
                        holderA = null, holderB = null;
                    }
                    
                } 
                content += `<div class="row col-md-2 align-items-center">` + wholeInput ;
                
                if(holderA != null) {
                    content +=`<div class="${className}"><div style="border-bottom:solid 1px" class="pb-1">${holderA}</div><div class="pt-1">${holderB}</div></div>`;
                }
                
                content +="</div>";

                if(l == amount-2) operator = "=";
                if (quizData.skill_code != 'FRAC_SIMPLIFY') if (l == 0) (quizData.skill_code == 'FRAC_ADD') ? operator = "+" : operator = "x";
                if(operator != null){
                    content +=
                    `<div class="col-md-1">
                        <div>${operator}</div>
                    </div>`
                }
            }
            content += `<div class='col-md-2'><span id='review${i}'></span></div></div>`;
        }
        return content;
    },
    markQuiz : () => {
        var score, easy = 0, medium = 0, difficult = 0, questions = [];
        const numOfQ = quizData.num_of_qn, percentDifficulty = quizData.percent_difficulty.split("-");
        const numOfEasy = numOfQ * (percentDifficulty[0]/100);
        const numOfMedium = numOfQ * (percentDifficulty[1]/100);
        const numOfDifficult = numOfQ * (percentDifficulty[2]/100);

        for(let i=0; i<numOfQ; i++){
            var review = '<i class="fas fa-check"></i>';
            var isCorrect = false, difficulty = 'difficult', studentAns = {};
           
            var input = ('ans' in questionArray[i]) ? $(`#input${i}`).val(): undefined;
            var inputA = ('ansA' in questionArray[i]) ? $(`#inputA${i}`).val(): undefined;
            var inputB = ('ansB' in questionArray[i]) ? $(`#inputB${i}`).val(): undefined;

            if(input!=undefined) studentAns['ans'] = input;
            if(inputA!=undefined) studentAns['ansA'] = inputA;
            if(inputB!=undefined) studentAns['ansB'] = inputB;

            if(inputA == questionArray[i].ansA && inputB == questionArray[i].ansB && input == questionArray[i].ans){
                if(i < numOfEasy){
                    difficulty = 'easy';
                    easy++;
                }
                else if(i < numOfEasy + numOfMedium){
                    difficulty = 'medium';
                    medium++;
                }
                else{
                    difficult++;
                }
                isCorrect = true;
            }
            else{
                review = '<i class="fas fa-times"></i>  Ans: ';
                if('ans' in questionArray[i]) review += `${questionArray[i].ans}`
                if('ansA' in questionArray[i]) review += `<sup>${questionArray[i].ansA}</sup>&frasl;<sub>${questionArray[i].ansB}</sub>`;
            }
            document.getElementById(`review${i}`).innerHTML = review;

            questions.push({
                "skill_id": quizData.skillId,
                "question_number": i+1,
                "question": fraction.stringQuestion(questionArray[i]),
                "answer": fraction.stringAnswer(studentAns), 
                "correct_answer": fraction.stringAnswer(questionArray[i]),
                "isCorrect": isCorrect,
                "difficulty": difficulty
            });
        }
        score = {
            "easy": (easy/numOfEasy)*100,
            "medium": (medium/numOfMedium)*100,
            "difficult": (difficult/numOfDifficult)*100,
        }
        score["total"] =  ((score.easy / 100 ) * numOfEasy + (score.medium / 100) * numOfMedium + (score.difficult/100) * numOfDifficult)/ 10 * 100;
        return [questions, score];
    }
}

var funcs = {
    'Fractions': fraction,
};

$(document).ready(function(){
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    
    var path = 'level', id = '';

    $(".header").load("rightbar.html",function(){
        document.getElementById("name").innerHTML = getName();
    });

    if(window.location.toString().includes("ongoing")){
        alert('No longer exist. Redirecting...');
        location.href = 'quiz.html'
    }

    if(params != null){
        for(key in params){   
            if( params[key]!="" && params[key]!=undefined && params[key] != null){
                path = key;
                id = params[key];
            }
            else{
                alert('ERROR!')
                location.href = 'quiz.html'
            }
        }
    }
    getQuizAjax(path,id);
})

window.onpopstate = function(e) {
    clearInterval(intervalId);
    if (e.state != null){
        var path = e.state.path;
        var id = e.state.id;
        getQuizAjax(path, id);
    }
    else{
        if(window.location.toString().includes("ongoing")){
            alert('No longer exist. Redirecting...');
        }
        getQuizAjax("level","");
    }
};

$(document).on("click",".card",function(){
    var path;
    var id = this.id;
    var array = ['level','topic','skill'];

    for(var i = 0; i < array.length; i++){
        var check = $(".card").hasClass(`${array[i]}`);
        if (check == true){
            path = array[i] ;
            break;
        } 
    }

    if(path != null || path != undefined){
        var state = {
            path : path,
            id : id,
        }
        history.pushState(state, null, `?${path}=${id}`); 
        getQuizAjax(path, id);
    }
    else{
        alert("ERROR!");
    }    
})

$(document).on("click",".btn",function(){
    var id = this.id;
    if(id == "beginBtn"){
        history.pushState(null, null, `?ongoing=true`);
        questionArray = [];
        funcs[quizData.topic_name].generateQuestion(quizData);

        displayQuestion();
    }
    else{
        var isFill = true, isNumber = true;

        $('input').each(function() {
            if ($.trim($(this).val()) == "") {
                isFill = false;
                return false;
            }
            if (isNaN($(this).val())) {
                isNumber = false;
                return false;
            }
        });

        if(isFill && isNumber || countdown < 1){  
            clearInterval(intervalId); 

            var timeTaken = quizData.duration * 60 - countdown;
            var time = Math.floor(timeTaken/60) + "." + (timeTaken - (Math.floor(timeTaken/60)*60));

            var result = funcs[quizData.topic_name].markQuiz(quizData, questionArray);
            var user = JSON.parse(localStorage.getItem("userInfo"));
            var status = (result[1].total >= 50) ? 'pass' : 'fail';
            
            const data = {
                    "skill_id": quizData.skillId, 
                    "level": quizData.level,
                    "skill_name": quizData.skill_name, 
                    "topic_name": quizData.topic_name, 
                    "done_by": user._id,
                    "score": result[1], 
                    "questions": result[0],
                    "num_of_qn": quizData.num_of_qn,
                    "percent_difficulty": quizData.percent_difficulty, 
                    "time_taken": time,
                    "isCompleted": true, 
                    "created_at": Date.now, 
            }

            $('#skillName').remove();
            $('#support').before(
                `<div class="row justify-content-center align-items-center text-center mt-4">
                    <i class="col-2 fas fa-glass-cheers fa-4x"></i>
                    <div class="col-4">
                        <h2>Congratulations!</h2>
                        <p>You ${status} the ${quizData.skill_name} quiz!</p>
                        <h6><u>${result[1].total} / 100 </u></h6>
                    </div>
                    <i class="col-2 fas fa-glass-cheers fa-4x"></i>
                </div>
                <div class="text-center">
                    Take a look at your progress:
                </div>`
            )

            history.pushState(null, null, `?ongoing=done`); 
            submitQuiz(data);
            window.scrollTo(0,0);
        }
        else{
            var err = "Complete the quiz!"
            if(isFill == true) err = "Numbers only!"
            alert(err);
        }
    }
})

function displayCard(data,name){
    var container = document.getElementById("container");
    container.innerHTML = '';

    $("#withBars").css("display", "");
    $('#withBars').nextAll().remove();

    for(var i=0; i<data.length; i++){
        var content =
        `<div class="card ${name} col-5 m-2 text-center" style="cursor: pointer" id="${data[i].id}">
            <div class="card-body text-center stretch-link">
                <p>${data[i].display}</p>
            </div>
        </div>`;
        container.innerHTML += content;
    }
}

function getQuizAjax(path, id){
    $.ajax({
        url: `${path}/${id}`,
        dataType: 'JSON',
        success: function(data, textStatus, xhr) {
            if (id == ""){
                path = 'alevel' 
                url = "/quiz"
            }
            after(path, data);
        },
        error: function(xhr, textStatus, errorThrown){
            alert("ERROR!");
            location.href = 'quiz.html'
        }
    });
}

function after(path, data){
    var vname, head = '', end = '_name', notes = [];
    if(path != "skill"){
        if(path == 'level'){
            data = data.topics;
            vname = "topic";
        }
        else if(path == 'topic'){
            data = data.skills;
            vname = "skill";
        }
        else{
            head = 'Primary ';
            vname = "level";
            end = '';
        }

        for(let i=0; i<data.length; i++){
            notes.push({
                "id": data[i]._id,
                "display": head + data[i][vname + end]
            })
        }
        document.getElementById("subtitle").innerHTML =  vname.charAt(0).toUpperCase() + vname.slice(1);
        displayCard(notes, vname);
    }
    else{
        document.getElementById('withBars').style.display = "none";
        $('#withBars').nextAll().remove();
        $( "#withBars" ).after( 
            `<div class="row justify-content-center m-2">
                <div  class="d-flex justify-content-center">
                   <img src="images/QEDed.jpg" alt="Logo">
                </div>
                <div class="col-10 border rounded" id="content">
                    <div class="row flex-nowrap noBar justify-content-center">
                        <div class="d-flex flex-column justify-content-center align-items-center p-5">       
                            <h4 class="text-center">${data.skill_name}</h4>
                            <div class="border p-5 mt-2 rounded">
                                <div class="pl-5">
                                    <p class="h5 text-center mb-5">Instructions</p>
                                    <p class="m-1">The quiz has a time limit of <span id="time">${data.duration}</span> minutes.</p>
                                    <p>The test will save and submit automatically when the time expires.</p>
                                </div>
                                <div class="text-end mt-5">
                                    <button class="btn btn-primary" id="beginBtn">Begin Quiz</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`)
        quizData = data;
    }
}

function displayQuestion(){
    var container = document.getElementById("content");
    container.innerHTML =  
    `<div class="h5 text-center my-3" id="skillName">${quizData.skill_name}</div>
    <div class="container row">
        <div class="col-10 container justify-content-center" id="support">
            <div class="row align-items-center">
                <div class="col-1 text-end">
                    <i class="fas fa-stopwatch fa-lg"></i>
                </div>
                <div class="progress col-11 p-0">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" id="timebar"></div>
                </div>
            </div>
            <p class="text-center">Remaining Time <span id='time' class='text-center'> ${quizData.duration}:00</span></p>
        </div>
    </div>`;

    var content = funcs[quizData.topic_name].arrangeQuestion(quizData, questionArray);   
    container.innerHTML += content + '<div class="text-center mb-3"><button class="btn-primary btn submitBtn">Submit</div>'
    startCountdown();
}

//Function for countdown 
function startCountdown() {
    var duration = 60 * quizData.duration - 1, minutes, seconds //Duration in seconds
    displayCountdown = document.getElementById('time');
    displayTimebar = document.getElementById('timebar');

    countdown = duration;

    intervalId = setInterval(function () {
        minutes = parseInt(countdown / 60, 10);
        seconds = parseInt(countdown % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        //Display countdown in html
        displayCountdown.innerHTML = minutes + ":" + seconds
        displayTimebar.style.width = ((duration - countdown)/duration) * 100 + '%' ;

        //When timer reaches 0
        if (--countdown < 0) {
            clearInterval(intervalId); //Stop countdown
            $('.submitBtn').trigger('click'); //Trigger submit 
        }

    }, 1000);
}

function submitQuiz(data) {
    $.ajax({
        url: `quiz`,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(data, textStatus, xhr){
            $('.submitBtn').remove();
            createCanvas("support");
            updateStats(""); 

            var container = document.getElementById("support");
            container.className = "row m-0 justify-content-center";
            container.innerHTML += '<h4 class="my-5 text-center">Review Quiz</h4>';
        },
        error: function(xhr, textStatus, errorThrown){
            console.log(xhr);
        }
    })
};
