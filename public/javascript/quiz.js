var intervalId, countdown, quizData, questionArray = [];

/* EVENT LISTENER */
$(document).ready(function () {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    let path = 'level';
    let id = '';

    $(".header").load("rightbar.html", function () {
        document.getElementById("name").innerHTML = getName();
    });

    if (window.location.toString().includes("ongoing")) {
        location.href = '404.html';
    }

    if(params != null){
        for(key in params){
            if( params[key]!="" && params[key]!=undefined && params[key] != null){
                if(key != "assignment") {
                    path = key;
                    id = params[key];
                }
            }
            else {
                alert('ERROR!');
                location.href = 'quiz.html'
            }
        }
    }
    getQuizAjax(path, id);
})

//On back press
window.onpopstate = function (e) {
    //Clear timer 
    clearInterval(intervalId);

    //Checking for history state
    if (e.state != null) {
        let path = e.state.path;
        let id = e.state.id;

        getQuizAjax(path, id);
    }
    else {
        getQuizAjax("level", "");
    }
};

$(document).on("click", ".card", function () {
    let path;
    let id = this.id;
    let array = ['level', 'topic', 'skill'];

    for (let i = 0; i < array.length; i++) {
        let check = $(".card").hasClass(`${array[i]}`);
        if (check == true) {
            path = array[i];
            break;
        }
    }

    if (path != null || path != undefined) {
        if (path != 'skill') {
            let state = {
                path: path,
                id: id,
            }
            history.pushState(state, null, `?${path}=${id}`);
            getQuizAjax(path, id);
        }
        else {
            path = "trial";
            if (window.location.toString().includes("quiz")) {
                path = "quiz";
            }
            window.open(`${path}.html?skill=${id}`);
        }
    }
    else {
        alert("ERROR!");
    }
})

$(document).on("click", ".click", function () {
    let id = this.id;

    if (id == "beginBtn") { //Start quiz
        questionArray = [];
        funcs[quizData.topic_name].generateQuestion(quizData);

        displayQuestion();
    }
    else {
        // Submit quiz
        let id;
        let isFill = true;
        let isNumber = true;

        //Checking for empty field
        $('input').each(function () {
            if ($.trim($(this).val()) == "") {
                id = this.id;
                isFill = false;

                return false;
            }
            //Checking for invalid input
            if (isNaN($(this).val())) {
                id = this.id;
                isNumber = false;

                return false;
            }
        });


        if (isFill && isNumber || countdown < 1) {
            //Stop the timer
            clearInterval(intervalId);

            //Calculating time taken
            let timeTaken = quizData.duration * 60 - countdown;
            let time = Math.floor(timeTaken / 60) + "." + (timeTaken - (Math.floor(timeTaken / 60) * 60));

            //Marking quiz
            let result = funcs[quizData.topic_name].markQuiz(quizData, questionArray);
            let user = JSON.parse(localStorage.getItem("userInfo"));
            let status = (result[1].total >= 50) ? 'pass' : 'fail';

            //Displaying results
            $('#skillName').remove();
            $('#support').before(
                `<div class="row justify-content-center align-items-center text-center mt-4">
                    <i class="col-2 fas fa-glass-cheers fa-4x"></i>
                    <div class="col-4">
                        <h2>Congratulations!</h2>
                        <p>You ${status} the ${quizData.skill_name} quiz!</p>
                        <h6><u>${Math.round(result[1].total)} / 100 </u></h6>
                    </div>
                    <i class="col-2 fas fa-glass-cheers fa-4x"></i>
                    <a class="my-3" href="overview.html"><button class="btn btn-outline-primary">Return back</button></a>
                </div>
                <div class="text-center"> Take a look at your progress:</div>`
            );

            //Creating canvas
            createCanvas(5, ['Score', 'Time Taken', 'Easy Score', 'Medium Score', 'Hard Score'], "support");

            //Check if its trial
            if (!window.location.toString().includes("trial")) {

                //Preparing data for posting quiz
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
                var urlSearchParams = new URLSearchParams(window.location.search);
                var assignment_id = urlSearchParams.get("assignment");
                if(assignment_id != null && assignment_id != undefined) {
                    data.assignment_id = assignment_id;
                }
                submitQuiz(data);
            }
            else {

                for (let i = 0; i < 5; i++) {
                    displayChart([50, 60, 10], i);
                }

                // //Prompt user to signup for more
                let modalHtml =
                    `<div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                            <div class="modal-body text-center mb-3">
                                <h5 class="modal-title my-3" id="staticBackdropLabel">Want more? Sign up now for Free!!</h5>
                                <a href="signup.html"><button class="btn btn-outline-primary">Sign up!</button></a>
                                <a href="index.html"><button class="btn btn-outline-primary">Return to index</button></a>
                            </div>
                            </div>
                        </div>
                    </div>`
                $("body").append(modalHtml);
                $(".modal").modal('show');

                //Bluring out contetnt
                $('body>*:not(.modal)').css('filter', 'blur(10px)');
            }
            window.scrollTo(0, 0);
        }
        else {
            let err = "Complete the quiz!";
            if (isFill == true) err = "Numbers only!";

            //Focusing on field input
            document.getElementById(id).focus();

            //Showing alerts
            $.alert({
                icon: 'fas fa-exclamation-triangle',
                type: 'red',
                title: 'Alert!',
                content: err,
            });
        }
    }
})

$(document).on("click", ".returnBtn", function () {
    $.confirm({
        icon: 'fas fa-exclamation-triangle',
        title: 'Are you sure?',
        content: 'This quiz will not be saved and the action cannot be undone.',
        type: 'red',
        buttons: {
            ok: {
                text: "Confirm",
                btnClass: 'btn-outline-danger',
                keys: ['enter'],
                action: function () {
                    window.close();
                }
            },
            cancel: function () {
            }
        }
    });
})

/* API CALLS */
function getQuizAjax(path, id) {
    $.ajax({
        url: `${path}/${id}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            if (id == "") {
                path = 'alevel';
                url = "/quiz";
            }
            after(path, data);
        },
        error: function (xhr, textStatus, errorThrown) {
            alert("ERROR!");
            location.href = '404.html';
        }
    });
}

function submitQuiz(data) {
    $.ajax({
        url: `quiz`,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data, textStatus, xhr) {
            $('.submitBtn').remove();
            $('.returnBtn').remove();
            
            getDetailedBenchmark("", "support");

            let container = document.getElementById("support");

            container.className = "row m-0 m-auto justify-content-center";
            $(container).after('<h4 class="my-5 text-center">Review Quiz</h4>');
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(xhr);
        }
    })
};

function after(path, data) {
    let vname;
    let head = '';
    let notes = [];
    let end = '_name';

    if (path != "skill") {
        if (path == 'level') {
            data = data.topics;
            vname = "topic";
        }
        else if (path == 'topic') {
            data = data.skills;
            vname = "skill";
        }
        else {
            head = 'Primary ';
            vname = "level";
            end = '';
        }

        for (let i = 0; i < data.length; i++) {
            notes.push({
                "id": data[i]._id,
                "display": head + data[i][vname + end]
            })
        }
        
        document.getElementById("subtitle").innerHTML = vname.charAt(0).toUpperCase() + vname.slice(1);
        displayCard(notes, vname);
    }
    else {
        $("body").html(
            `<div class="row justify-content-center m-2">
                <div  class="d-flex justify-content-center">
                   <img src="images/Psleonline_logo_transparent.png" alt="Logo" style="width: 30%">
                </div>
                <div class="col-12 col-sm-10 border rounded" id="content">
                    <div class="row flex-nowrap noBar justify-content-center">
                        <div class="d-flex flex-column justify-content-center align-items-center p-5">       
                            <h4 class="text-center">${data.skill_name}</h4>
                            <div class="border p-5 mt-2 border-round">
                                <div class="pl-5">
                                    <p class="h5 text-center mb-5">Instructions</p>
                                    <p class="m-1">The quiz has a time limit of <span id="time">${data.duration}</span> minutes.</p>
                                    <p>The test will save and submit automatically when the time expires.</p>
                                </div>
                                <div class="text-end mt-5">
                                    <button class="btn btn-warning click" id="beginBtn">Begin Quiz</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`);
        quizData = data;
    }
}

// Display Data
function displayQuestion() {
    let container = document.getElementById("content");
    
    container.innerHTML =
        `<div class="h5 text-center my-3" id="skillName">${quizData.skill_name}</div>
            <div class="container row m-auto">
                <div class="col-10 container m-auto justify-content-center" id="support">
                    <div class="row align-items-center">
                        <div class="col-2 text-end">
                            <i class="fas fa-stopwatch fa-lg"></i>
                        </div>
                        <div class="progress col-10 p-0">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" id="timebar"></div>
                        </div>
                    </div>
                    <p class="text-center">Remaining Time <span id='time' class='text-center'> ${quizData.duration}:00</span></p>
                </div>
            </div>`;

    let content = funcs[quizData.topic_name].arrangeQuestion(quizData, questionArray);
    container.innerHTML += content + '<div class=" justify-content-center d-flex text-center mb-3"><button class="btn-light btn returnBtn me-2">Cancel</button><button class="btn-outline-primary btn click submitBtn">Submit</button></div>';
    $(".reviewClass").css("display","none");
    
    //Starting timer
    startCountdown();
}

function displayCard(data, name) {
    let container = document.getElementById("container");
    container.innerHTML = '';

    //Checking if quiz is available
    if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            let content =
                `<div class="card ${name} col-5 m-2 text-center" style="cursor: pointer" id="${data[i].id}">
                    <div class="card-body stretch-link d-flex justify-content-center align-items-center">
                        <p class="m-0">${data[i].display}</p>
                    </div>
                </div>`;
            container.innerHTML += content;
        }
    }
    else {
        container.innerHTML =
            `<div class='d-flex flex-column align-items-center justify-content-center notAvailable'>
                <i class="icon-blue fas fa-atom fa-4x"></i>
                <p class="h5 mt-3">No Quiz Available!</p>
            </div>`;
    }
}

//Function for countdown 
function startCountdown() {
    let seconds; 
    let minutes;
    let duration = 60 * quizData.duration - 1;//Duration in seconds

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
        displayTimebar.style.width = ((duration - countdown) / duration) * 100 + '%';

        //When timer reaches 0
        if (--countdown < 0) {
            clearInterval(intervalId); //Stop countdown
            $('.submitBtn').trigger('click'); //Trigger submit 
        }

    }, 1000);
}

// Function to generated number between min and max (both included)
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Fractions
const fraction = {
    getGCD: (a, b) => {
        if (b == 0) {
            return a;
        }
        else {
            return fraction.getGCD(b, a % b);
        }
    },
    add: (array) => {
        // a/b + c/d
        numerator = array.a * array.d + array.b * array.c;
        denominator = array.b * array.d;
        
        return fraction.proper(numerator, denominator);
    },
    multiply: (array) => {
        // a/b + c/d
        numerator = array.a * array.c;
        denominator = array.b * array.d;

        return fraction.proper(numerator, denominator);
    },
    proper: (numerator, denominator) => {
        let result = { "numerator": numerator, "denominator": denominator };

        if ((numerator >= denominator)) {
            result = {};
            result['whole'] = Math.floor(numerator / denominator);
            if (numerator != denominator && numerator % denominator != 0) {
                result['numerator'] = numerator - (denominator * result['whole']);
                result['denominator'] = denominator;
            }
        }

        return result;
    },
    sort: (array) => {
        let sorted = {};
        const alphabets = ["a", "b", "c", "d"];

        for (let i = 0; i < array.length; i++) {
            sorted[alphabets[i]] = array[i];
        }

        return sorted;
    },
    checkDuplicates: (sorted) => {
        for (let i = 0; i < questionArray.length; i++) {
            var dupes = true;

            for (key in sorted) {
                if (questionArray[i][key] != sorted[key]) {
                    dupes = false;
                    break;
                }
            }
            if (dupes) break;
        }

        return dupes;
    },
    stringQuestion: (question) => {
        let result = question.a + "/" + question.b;

        if (quizData.skill_code != 'FRAC_SIMPLIFY') {
            (quizData.skill_code == 'FRAC_ADD') ? operator = " + " : operator = " x ";
            result = question.a + "/" + question.b + operator + question.c + "/" + question.d;
        }

        return result;
    },
    stringAnswer: (answer) => {
        let result;

        if ('ansA' in answer) {
            ('ans' in answer) ? result = answer.ans + " " + answer.ansA + "/" + answer.ansB : result = answer.ansA + "/" + answer.ansB;
        }
        else {
            result = answer.ans;
        }

        return result;
    },
    generateQuestion: (quizData) => {
        const numOfQ = quizData.num_of_qn;
        const percentDifficulty = quizData.percent_difficulty.split("-");
        const numOfEasy = numOfQ * (percentDifficulty[0] / 100);
        const numOfMedium = numOfQ * (percentDifficulty[1] / 100);

        for (let i = 0; i < numOfQ; i++) {
            let gcd;
            let ans;
            let sorted;
            let amount = 4;
            let checkpoint = true;
            let key = "difficult_values";

            if (i < numOfEasy) {
                key = "easy_values";
            }
            else if (i < numOfEasy + numOfMedium) {
                key = "medium_values";
            }

            if (quizData.skill_code == 'FRAC_SIMPLIFY') amount = 2;

            while (checkpoint) {
                let numberArray = [];

                for (let l = 0; l < amount; l++) {
                    numberArray.push(generateRandomNumber(quizData[key].min, quizData[key].max));
                }

                sorted = fraction.sort(numberArray);
                let dupes = (questionArray.length != 0) ? fraction.checkDuplicates(sorted) : false;

                if (!dupes) {
                    if (quizData.skill_code == 'FRAC_SIMPLIFY') {
                        gcd = fraction.getGCD(sorted.a, sorted.b);
                        
                        if (gcd != 1 && sorted.a != sorted.b) {
                            ans = fraction.proper(sorted.a, sorted.b);
                            checkpoint = false;
                        }
                    }
                    else {
                        if (sorted.a != sorted.b && sorted.c != sorted.d) {
                            (quizData.skill_code == 'FRAC_ADD') ? ans = fraction.add(sorted) : ans = fraction.multiply(sorted);
                            if (ans.numerator != null) gcd = fraction.getGCD(ans.numerator, ans.denominator);
                            checkpoint = false;
                        }
                    }
                }
            }

            questionArray.push(sorted);
            if ('whole' in ans) questionArray[i].ans = ans.whole;
            if ('numerator' in ans) questionArray[i].ansA = ans.numerator / gcd;
            if ('denominator' in ans) questionArray[i].ansB = ans.denominator / gcd;
        }
    },
    arrangeQuestion: () => {
        let amount = 3;
        let content = "";

        if (quizData.skill_code == 'FRAC_SIMPLIFY') amount = 2;

        for (let i = 0; i < questionArray.length; i++) {
            content += `<div class="row col-9 justify-content-center align-items-center text-center m-auto mb-3"><div class="small col-md-2">Question ${i + 1}</div>`;
           
            for (let l = 0; l < amount; l++) {
                let name = 'col-12';
                let operator = null;
                let wholeInput = "";
                let className = 'col-12';
                let holderA = questionArray[i].a;
                let holderB = questionArray[i].b;

                if (l == 1) {
                    holderA = questionArray[i].c;
                    holderB = questionArray[i].d;
                }

                if (l == amount - 1) {
                    if ('ans' in questionArray[i]) {
                        className = 'col-6 p-0';

                        if ('ansA' in questionArray[i]) name = 'col-6 d-flex justify-content-end p-1';

                        wholeInput = `<div class="${name}"><input class="text-center" size="1" id='input${i}'></div>`;
                    }
                    if ('ansA' in questionArray[i]) {
                        holderA = `<input class="text-center" size = "1" id='inputA${i}'>`;
                        holderB = `<input class="text-center" size = "1" id='inputB${i}'>`;
                    }
                    else {
                        holderA = null, holderB = null;
                    }

                }
                content += `<div class="row col-md-2 align-items-center">` + wholeInput;

                if (holderA != null) {
                    content += `<div class="${className}"><div style="border-bottom:solid 1px" class="pb-1">${holderA}</div><div class="pt-1">${holderB}</div></div>`;
                }

                content += "</div>";

                if (l == amount - 2) operator = "=";

                if (quizData.skill_code != 'FRAC_SIMPLIFY'){
                    if (l == 0) (quizData.skill_code == 'FRAC_ADD') ? operator = "+" : operator = "x";
                } 

                if (operator != null) {
                    content +=
                        `<div class="col-md-1">
                            <div>${operator}</div>
                        </div>`;
                }
            }
            content += `<div class='col-md-2 reviewClass'><span id='review${i}'></span></div></div>`;
        }

        return content;
    },
    markQuiz: () => {
        let score
        let easy = 0;
        let medium = 0;
        let difficult = 0;
        let questions = [];
        
        const numOfQ = quizData.num_of_qn, percentDifficulty = quizData.percent_difficulty.split("-");
        const numOfEasy = numOfQ * (percentDifficulty[0] / 100);
        const numOfMedium = numOfQ * (percentDifficulty[1] / 100);
        const numOfDifficult = numOfQ * (percentDifficulty[2] / 100);

        for (let i = 0; i < numOfQ; i++) {
            let review = '<i class="fas fa-check"></i>';
            let difficulty = 'difficult';
            let isCorrect = false;
            let studentAns = {};

            let input = ('ans' in questionArray[i]) ? $(`#input${i}`).val() : undefined;
            let inputA = ('ansA' in questionArray[i]) ? $(`#inputA${i}`).val() : undefined;
            let inputB = ('ansB' in questionArray[i]) ? $(`#inputB${i}`).val() : undefined;

            if (input != undefined) studentAns['ans'] = input;
            if (inputA != undefined) studentAns['ansA'] = inputA;
            if (inputB != undefined) studentAns['ansB'] = inputB;

            $(".reviewClass").css("display","block");

            if (inputA == questionArray[i].ansA && inputB == questionArray[i].ansB && input == questionArray[i].ans) {
                if (i < numOfEasy) {
                    difficulty = 'easy';
                    easy++;
                }
                else if (i < numOfEasy + numOfMedium) {
                    difficulty = 'medium';
                    medium++;
                }
                else {
                    difficult++;
                }
                isCorrect = true;
            }
            else {
                review = '<i class="fas fa-times"></i>  Ans: ';

                if ('ans' in questionArray[i]) review += `${questionArray[i].ans}`;
                if ('ansA' in questionArray[i]) review += `<sup>${questionArray[i].ansA}</sup>&frasl;<sub>${questionArray[i].ansB}</sub>`;
            }
            document.getElementById(`review${i}`).innerHTML = review;

            questions.push({
                "skill_id": quizData.skillId,
                "question_number": i + 1,
                "question": fraction.stringQuestion(questionArray[i]),
                "answer": fraction.stringAnswer(studentAns),
                "correct_answer": fraction.stringAnswer(questionArray[i]),
                "isCorrect": isCorrect,
                "difficulty": difficulty
            });
        }

        score = {
            "easy": (easy / numOfEasy) * 100,
            "medium": (medium / numOfMedium) * 100,
            "difficult": (difficult / numOfDifficult) * 100,
        }
        score["total"] = ((score.easy / 100) * numOfEasy + (score.medium / 100) * numOfMedium + (score.difficult / 100) * numOfDifficult) / numOfQ * 100;
        
        return [questions, score];
    }
}

const funcs = {
    'Fractions': fraction,
};
