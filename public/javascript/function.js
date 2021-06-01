function getAllUsers(){
    $.ajax({
        url: 'http://localhost:3000/user',
        type: 'GET',
        dataType: "json",
        success: function(data, textStatus, xhr){
            console.log("Success in getting all users")
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("Error in getting all users")
        }
    })
}

function searchUserByEmail(email){
    $.ajax({
        url: `http://localhost:3000/user/search?query=${email}`,
        type: 'GET',
        dataType: "json",
        success: function(data, textStatus, xhr){
            console.log("Success in searching user by email")
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("Error in searching user by email")
        }
    })
}

function addNewUser(data){
    $.ajax({
        url: 'http://localhost:3000/user/signup',
        type: 'POST',
        data: data,
        dataType: "json",
        success: function(data, textStatus, xhr){
            console.log("Success in adding new user")
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("Error in adding new user");
        }
    })
}

function login(data){
    $.ajax({
        url: 'http://localhost:3000/user/login',
        type: 'POST',
        data: data,
        dataType: "json",
        success: function(data, textStatus, xhr){
            console.log("Success in login")
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("Error in login");
        }
    })
}

function updateProfileById(id,data){
    $.ajax({
        url: `http://localhost:3000/user/updateProfile/${id}`,
        type: 'PUT',
        data: data,
        dataType: "json",
        success: function(data, textStatus, xhr){
            console.log("Success in updating profile by id")
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("Error in updating profile by id")
        }
    })
}

function deleteUserById(id){
    $.ajax({
        url: `http://localhost:3000/user/deleteAccount/${id}`,
        type: 'DELETE',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data, textStatus, xhr){
            console.log("Success in deleting user by id")
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("Error in deleting user by id")
        }
    })
}

function getAllTopics(){
    $.ajax({
        url: 'http://localhost:3000/topic',
        type: 'GET',
        dataType: "json",
        success: function(data, textStatus, xhr){
            console.log("Success in getting all topics")
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("Error in getting all topics")
        }
    })
}

function updateTopicById(id,data){
    $.ajax({
        url: `http://localhost:3000/topic/${id}`,
        type: 'PUT',
        data: data,
        dataType: "json",
        success: function(data, textStatus, xhr){
            console.log("Success in updating topic by id")
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("Error in updating topic by id")
        }
    })
}

function deleteTopicById(id){
    $.ajax({
        url: `http://localhost:3000/topic/${id}`,
        type: 'DELETE',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data, textStatus, xhr){
            console.log("Success in deleting topic by id")
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("Error in deleting topic by id")
        }
    })
}

function resetDefaultTopic(){
    $.ajax({
        url: 'http://localhost:3000/topic/resetDefault',
        type: 'GET',
        dataType: "json",
        success: function(data, textStatus, xhr){
            console.log("Success in resetting topic")
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("Error in resetting topic")
        }
    })
}

// Function to generate number between min and max (both included)
function generateRandomNumber(){
    var min = 2, max = 20;
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

//Function to add fractions
function addFractions(a,b,c,d){
    // a/b + c/d
    var numerator = a * d + b * c;
    var denominator = b * d;
    return [numerator,denominator];
}

//Function to simplify fraction
function simplifyFraction(numerator,denominator,gcd){
    var wholeNumber = 0;
    numerator = numerator/gcd
    denominator = denominator/gcd

    //Improper fraction to proper fraction
    if(numerator>denominator){
        wholeNumber = Math.floor(numerator/denominator);
        numerator =  numerator - denominator
    }
    return [wholeNumber, numerator, denominator];
}

//Function for countdown 
function startCountdown() {
    var duration = 60 * 20 -1, //Duration in seconds
    displayCountdown = document.getElementById('time');

    var countdown = duration, minutes, seconds;

    var intervalId = setInterval(function () {
        minutes = parseInt(countdown / 60, 10);
        seconds = parseInt(countdown % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        //Display countdown in html
        displayCountdown.innerHTML = minutes + ":" + seconds

        //When timer reaches 0
        if (--countdown < 0) {
            clearInterval(intervalId); //Stop countdown
            $('.submit').trigger('click'); //Trigger submit 
        }

    }, 1000);
}

//Function for displaying chart
function displayChart(){ 
    //Get canvas
    var ctx = new Chart(document.getElementById('myChart').getContext('2d'));

    //Create barchart
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Latest', 'Global Avg', 'Last 10 Avg'],
            datasets:[{
                //Input data here
                data: [76,67,80],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)', //Colour here
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(201, 203, 207, 0.2)'
                ],
                //Adjust bar width here
                barPercentage: 1,
                
            }],
        },
        options: {
            //Remove legend
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        //Remove grid lines
                        drawOnChartArea: false
                    }
                }],
                yAxes: [{
                    ticks: {
                        //Y axis starts at zero
                        beginAtZero: true
                    },
                    gridLines: {
                        //Remove grid lines
                        drawOnChartArea: false
                    } 
                }]
            },

        },
    })
}