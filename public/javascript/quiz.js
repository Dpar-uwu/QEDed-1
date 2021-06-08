var skill;
var numOfQ;
var intervalId;
var fractionArray = [];
$(document).ready(function(){
    $.ajax({
        url: 'http://localhost:3000/level',
        dataType: 'JSON',
        success: function(data, textStatus, xhr) {
            var notes = [];
            for(var i=0; i<data.length; i++){
                notes.push({
                    "id": data[i]._id,
                    "display": "Primary " + data[i].level
                })
            }
            displayCard(notes,"level");
        },
        error: function(xhr, textStatus, errorThrown){
            console.log(errorThrown);
        }
    });
})

$(document).on("click",".level",function(){
    var id = this.id;
    $.ajax({
        url: `http://localhost:3000/level/${id}`,
        dataType: 'JSON',
        success: function(data, textStatus, xhr) {
            var notes = [];
            for(var i=0; i<data.topics.length; i++){
                notes.push({
                    "id": data.topics[i]._id,
                    "display": data.topics[i].topic_name
                })
            }
            displayCard(notes,"topic");
        },
        error: function(xhr, textStatus, errorThrown){
            console.log(errorThrown);
        }
    });
})
$(document).on("click",".topic",function(){
    var id = this.id;
    $.ajax({
        url: `http://localhost:3000/topic/${id}`,
        dataType: 'JSON',
        success: function(data, textStatus, xhr) {
            var notes = [];
            for(var i=0; i<data.skills.length; i++){
                notes.push({
                    "id": data.skills[i]._id,
                    "display": data.skills[i].skill_name
                })
            }
            displayCard(notes,"skill");
        },
        error: function(xhr, textStatus, errorThrown){
            console.log(errorThrown);
        }
    });
})
$(document).on("click",".skill",function(){
    var id = this.id;
    $.ajax({
        url: `http://localhost:3000/skill/${id}`,
        dataType: 'JSON',
        success: function(data, textStatus, xhr) {
            generateQuestion(data)
        },
        error: function(xhr, textStatus, errorThrown){
            console.log(errorThrown);
        }
    });
})

$(document).on("click",".submitBtn",function(){
    var container = document.getElementById('quizContainer');
    var score = 0;
    for(var i=0; i<numOfQ; i++){
        // content += `<div class='col-12 text-center'>Q${i+1} <sup>${fractionArray[i].n}</sup>&frasl;<sub>${fractionArray[i].d}</sub>`
        var sN = $(`#inputN${i}`).val();
        var sD = $(`#inputD${i}`).val();   
        if(sN == fractionArray[i].aN && sD == fractionArray[i].aD){
            score ++;
        }
    }
    container.innerHTML = `<div class='text-center'>You have scored ${score}/${numOfQ}</div>` //+ `<canvas  style="width: 512px; height: 256px" id="myChart"></canvas>` // + `<button type="button" class="btn btn-info col-4 mt-4 beginQuiz" id="${choosenTopic}">Next</button><button type="button" class="btn btn-info col-4 mt-4 showTopic" >Return</button>`;;
    // displayChart([score,0,0]);
})

function displayCard(data,name){
    var container = document.getElementById("quizContainer");
    var content = '';
    container.innerHTML = '';
    for(var i=0; i<data.length; i++){
        content = `
        <div class="card ${name}" style="cursor: pointer" id="${data[i].id}">
            <div class="card-body text-center stretch-link">
            <p>${data[i].display}<p>
            </div>
            </div>`
            container.innerHTML += content;
    }
}
function generateQuestion(data){
    var value;
    time = data.duration;
    skill = data.skill_code;
    numOfQ = data.num_of_qn;
    var percentDifficulty = data.percent_difficulty.split("-");
    var easy = numOfQ*(percentDifficulty[0]/100)
    var medium = numOfQ*(percentDifficulty[1]/100)

    for(var i=0; i<numOfQ; i++){
        var ans;
        if(i < easy){
            value = "easy_values";
        }
        else if(i < easy+medium){
            value = "medium_values";
        }
        else{
            value = "difficult_values";
        }

        min = data[value].min;
        max = data[value].max;
        var  x = true, n, d, gcd;
        while(x){
            n = generateRandomNumber(min,max);
            d = generateRandomNumber(min,max);
            gcd = getGCD(n,d)
            if(skill == 'FRAC_SIMPLIFY' && gcd != 1 && n != d){
                x = false;
            }
            else if(skill == 'FRAC_ADD' || skill == 'FRAC_MULTIPLY'){
                n1 = generateRandomNumber(min,max);
                d1 = generateRandomNumber(min,max);
                (skill == 'FRAC_ADD') ? ans = addFractions(n,d,n1,d1) : ans = multiplyFractions(n,d,n1,d1);
                x = false;
            }
        }
        fractionArray.push({
            'n': n,
            'd': d,
        })
        if(skill != 'FRAC_SIMPLIFY'){
            fractionArray[i].n1 = n1;
            fractionArray[i].d1 = d1;
            fractionArray[i].aN = ans.n;
            fractionArray[i].aD = ans.d;
        }
        else{
            fractionArray[i].aN = n/gcd;
            fractionArray[i].aD = d/gcd;
        }
    }
    displayQuestion();
}

function displayQuestion(){
    var container = document.getElementById("quizContainer");
    var content = `</div><div id='time' class='text-center'>${time}:00</div>`;
    container.innerHTML = '';
    for(var i=0; i<fractionArray.length; i++){
        content += 
        `<div class='col-12 row justify-content-center'>
        <table class="table table-borderless col-1">
            <tbody>
                <tr>
                    <td class="text-center font-weight-bold">Q${i+1}</td>
                </tr>
            </tbody>
        </table>     
        <table class="table table-borderless col-1">
            <tbody>
                <tr>
                    <td class="text-center" style="border-bottom:solid 1px">${fractionArray[i].n}</td>
                </tr>
                <tr>            
                    <td class="text-center">${fractionArray[i].d}</td>
                </tr>
            </tbody>
        </table>`
        if(skill != 'FRAC_SIMPLIFY' ){
            content += `<h4 class='align-self-center text-center col-1'>`;
            (skill == 'FRAC_ADD') ? content += '&#43' : content += '&#215';
            content += `</h4>   
            <table class="table table-borderless col-1">
                <tbody>
                    <tr>
                        <td class="text-center" style="border-bottom:solid 1px">${fractionArray[i].n1}</td>
                    </tr>
                    <tr>            
                        <td class="text-center">${fractionArray[i].d1}</td>
                    </tr>
                </tbody>
            </table>
            `;
        }
        content += `<h4 class='align-self-center text-center col-1'>&#61;</h4>
        <table class="table table-borderless col-1">
            <tbody>
                <tr>
                    <td class="text-center" style="border-bottom:solid 1px"><input class="text-center" size = "2" id="inputN${i}"></td>
                </tr>
                <tr>            
                    <td class="text-center"><input class="text-center" size = "2" id="inputD${i}"> </td>
                </tr>
            </tbody>
        </table></div>`
    }
    container.innerHTML += content + '<div class=text-center><button class="btn-primary btn submitBtn">Submit</div>'
    startCountdown();
}

// Function to generated number between min and max (both included)
function generateRandomNumber(min,max){
    return Math.floor( Math.random() * (max - min + 1) ) + min;
}

// Function to get Greatest Common Divisor
function getGCD(a, b){
    if(b == 0){
        return a
    }
    else{
        return getGCD(b, a % b)
    }
}

function addFractions(a,b,c,d){
    // a/b + c/d
    numerator = a * d + b * c;
    denominator = b * d;
    return {
        'n': numerator,
        'd' : denominator
    };
}

function multiplyFractions(a,b,c,d){
    // a/b + c/d
    numerator = a * c;
    denominator = b * d;
    var gcd = getGCD(numerator,denominator);
    return {
        'n': numerator / gcd,
        'd' : denominator / gcd
    };
}

//Function for countdown 
function startCountdown() {
    var duration = 60 * time -1, //Duration in seconds
    displayCountdown = document.getElementById('time');

    var countdown = duration, minutes, seconds;

    intervalId = setInterval(function () {
        minutes = parseInt(countdown / 60, 10);
        seconds = parseInt(countdown % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        //Display countdown in html
        displayCountdown.innerHTML = minutes + ":" + seconds

        //When timer reaches 0
        if (--countdown < 0) {
            clearInterval(intervalId); //Stop countdown
            $('.submitBtn').trigger('click'); //Trigger submit 
        }

    }, 1000);
}
