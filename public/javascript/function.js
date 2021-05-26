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