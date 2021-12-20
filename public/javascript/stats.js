var type = "topic";
let userId = JSON.parse(localStorage.getItem("userInfo"))._id;

let topicArray=["Decimals","Fractions","Algebra"];
let topicObj={Decimals:["Rounding off","Addition_Subtraction","Multiplication_Decimals","Division"],Fractions:["Simplify","Addition","Multiplication_Fractions"],Algebra:["Addition_Algebra","Multiplication_Algebra","Division_Algebra"]};
let subtopicArray;
let count=0;

let postQuizArray=["Score", "Time"]
//data will look like [[1,2,3],[4,5,6]]

/* EVENT LISTENER */
$(document).ready(function () {
    document.getElementById("mainDropdown").style.display="none";
    getFilter();
    //For stats page only
    if (window.location.toString().includes("stats")) {

        $(".header").load("rightbar.html", function () {
            document.getElementById("name").innerHTML = getName();
        })

          //getDetailedBenchmark("", "container");  
         

       for(var i=0;i<topicArray.length;i++){
           // const queryLine="&topic="+topicArray[i]
          getDetailedBenchmark2(topicArray[i], "container");
          

        }
            createCanvas(topicArray.length, topicArray, "container");
            
     
       
     
    }
})

$(document).on("click", '.select', function () {
    let selected = $(this).children().text();
    $("li").removeClass("active");
    $(this).addClass("active");
    console.log(selected)

    if (selected != "Topic") {
        document.getElementById("mainDropdown").style.display="block";
        type = "subtopic";
       displaySub();
    }
    else {
        document.getElementById("mainDropdown").style.display="none";
        type = "topic";
    window.location.reload();
    };

});
//filter
$(document).on("click", '.dropdown-item', function () {
    count=0;
    let topicObj={Decimals:["Rounding off","Addition_Subtraction","Multiplication_Decimals","Division"],Fractions:["Simplify","Addition","Multiplication_Fractions"],Algebra:["Addition_Algebra","Multiplication_Algebra","Division_Algebra"]};
    
    console.log(Object.values(topicObj)[Object.keys(topicObj).indexOf(this.id)])

subtopicArray = Object.values(topicObj)[Object.keys(topicObj).indexOf(this.id)]

   for(var i=0;i<subtopicArray.length;i++){

   getDetailedBenchmark3(subtopicArray[i], "container");
   

 }
     createCanvas2(subtopicArray.length, subtopicArray, "container");

        
  
});

/* API CALLS*/
function getDetailedBenchmark(query, containerName) {
    
    $.ajax({
        url: `/quiz/benchmark?user=${userId}${query}`,
        type: 'POST',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            if (data.recent != undefined) {
                createCanvas(5, ['Score', 'Time Taken', 'Easy Score', 'Medium Score', 'Hard Score'], containerName);
                extractDetailedData(data);
                //console.log(data.recent.total_average_score)
                
            }
            else {
                $('#zoom').css("display", "none");
                displayNth();
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("ERROR!" + xhr.responseText);
        }
    });
}
function getDetailedBenchmark2(query, containerName) {
    console.log(query)
    $.ajax({
        url: `/quiz/benchmark?user=${userId}`+`&topic=`+`${query}`,
        type: 'POST',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
                let scoreArray=[];
                let average;
                let global;
                if(data.average==undefined){
                    //topicArray.splice(topicArray.indexOf(query),1,0)
                    average=0;
                   
                }
                
                if(data.global==undefined){
                    global=0;
                }
                if(data.average!=undefined){
                    average=data.average.total_average_score;
                }
                if(data.global!=undefined){
                    global=data.global.total_average_score;
                }
                scoreArray.push(average,global);
                topicArray.splice(topicArray.indexOf(query),1,scoreArray);
                console.log(topicArray)
                
                count++

               if(count==topicArray.length){
                   for(let i=0;i<topicArray.length;i++){
                    displayChart2(topicArray[i],i)
                   }
               }
               //displayChart2(topicArray,0)
               //dataArray.splice(0,1,topicArray)
               //dataArray=topicArray
              
               
              
             
            
            

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("ERROR!" + xhr.responseText);
        }
    });
}
function getDetailedBenchmark3(query, containerName) {
    console.log(query)
    console.log(subtopicArray)
    $.ajax({
        url: `/quiz/benchmark?user=${userId}`+`&skill=`+`${query}`,
        type: 'POST',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
                let scoreArray=[];
                let average;
                let global;
                if(data.average==undefined){
                    //topicArray.splice(topicArray.indexOf(query),1,0)
                    average=0;
                   
                }
                
                if(data.global==undefined){
                    global=0;
                }
                if(data.average!=undefined){
                    average=data.average.total_average_score;
                }
                if(data.global!=undefined){
                    global=data.global.total_average_score;
                }
                console.log(global)
                scoreArray.push(average,global);
                subtopicArray.splice(subtopicArray.indexOf(query),1,scoreArray);
                
                
                count++
                console.log(subtopicArray)

               if(count==subtopicArray.length){
                   for(let i=0;i<subtopicArray.length;i++){
                    displayChart3(subtopicArray[i],i)
                   }
               }
               
              
               
              
             
            
            

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("ERROR!" + xhr.responseText);
        }
    });
}
function getDetailedBenchmark4(query, containerName) {
    console.log(query)
    console.log(subtopicArray)
    $.ajax({
        url: `/quiz/benchmark?user=${userId}`+`&skill=`+`${query}`,
        type: 'POST',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
                let scoreArray=[];
                let timeArray=[];

                let currentScore;
                let recentScore;
                let globalScore;

                let currentTime;
                let recentTime;
                let globalTime;

               if(data.current==undefined){
                    currentScore=0;
                    currentTime=0;
               }
               
                if(data.recent==undefined){
                    recentScore=0;
                    recentTime=0;
                   
                }
                
                if(data.global==undefined){
                    globalScore=0;
                    globalTime=0;
                }

                if(data.current!=undefined){
                    currentScore=data.current.total_average_score;
                    currentTime=data.current.average_time_taken;
                }

                if(data.recent!=undefined){
                    recentScore=data.recent.total_average_score;
                    recentTime=data.recent.average_time_taken;

                }


                if(data.global!=undefined){
                    globalScore=data.global.total_average_score;
                    globalTime=data.global.average_time_taken;
                }

                
                scoreArray.push(currentScore,recentScore,globalScore);
                postQuizArray.splice(0,1,scoreArray);

                timeArray.push(currentTime,recentTime,globalTime);
                postQuizArray.splice(1,1,timeArray);
                
                
               console.log(postQuizArray)
               displayChart4(postQuizArray[0],0)
               displayChart4(postQuizArray[1],1)

                

               
              
               
              
             
            
            

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("ERROR!" + xhr.responseText);
        }
    });
}


function getComparisonBenchmark(query) {
    $.ajax({
        url: `/quiz/benchmarkComparison?user=${userId}${query}`,
        type: 'POST',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            let title = []
            let extractedData = [];

            console.log(data)
            Object.keys(data).forEach(key => {

                title.push(key);
                extractedData.push(extractComparisonData(data[key]));
            });
            createCanvas(title.length, title, "container");

            for (let i = 0; i < extractedData.length; i++) {
                displayChart(extractedData[i], i);
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("ERROR!" + JSON.stringify(xhr));
        }
    });
}

function getFilter() {
    $.ajax({
        url: `/quiz/filter?user=${userId}`,
        type: 'GET',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            if (data.length < 1) {
                $('#title').nextAll().remove();
                $('#title').after(
                    `<div class="text-center mt-5">
                        <div><i class = "fa-5x fas fa-chart-bar" style="color: #EF798A; text-shadow: 5px 5px 0px #98c5ff, -5px -5px 0px #ffcb45;"></i></div>
                        <div>Do a quiz to unlock!</div>
                    </div>
                    `);
            }
            else{
                createFilter(data);
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            // window.location.href = "/404.html";
        }
    })
}

//Displaying filter options
function createFilter(data) {
    console.log(data)
    let content = '<li span class="dropdown-item" id=""><span>-</span></li>';
    /*

    for (let i = 0; i < data.length; i++) {
        content +=
            `<li>
                <span class="dropdown-item" id="&level=${data[i]._id}">
                    Primary ${data[i]._id}
                </span>
            `;

        for (let index = 0; index < data[i].topics.length; index++) {
            if (index == 0) {
                content += `<ul class="dropdown-submenu dropdown-menu">`;
            }
            content +=
                `<li>
                    <span class="dropdown-item" id="&topic=${data[i].topics[index].topic}">
                        ${data[i].topics[index].topic}
                    </span>
                `

            for (let indicator = 0; indicator < data[i].topics[index].skills.length; indicator++) {
                if (indicator == 0) {
                    content += `<ul class="dropdown-submenu dropdown-menu hide">`;
                }

                content +=
                    `<li>
                        <span class="dropdown-item" id="&skill=${data[i].topics[index].skills[indicator]}">
                            ${data[i].topics[index].skills[indicator]}
                        </span>
                    </li>`

                if (indicator + 1 == data[i].topics[index].skills.length) content += "</ul>";
            }

            content += "</li>"

            if (index + 1 == data[i].topics.length) content += "</ul>";
        }

        content += "</li>"
    }
    */
    for (let i = 0; i < Object.keys(topicObj).length; i++) {
        content +=
            `<li>
                <span class="dropdown-item" id="${Object.keys(topicObj)[i]}">
                ${Object.keys(topicObj)[i]}
                </span>
             </li>
            `;
    }

    if (content != '') document.getElementById('firstDropList').innerHTML = content;
}

/*CREATE CANVAS*/
function createCanvas(amount, title, containerName) {
    let content = "";

    for (let i = 0; i < amount; i++) {
        (i < 2) ? classname = 'col-lg-5' : classname = 'col-lg-4 ';
        content += `
            <div class='${classname} col-sm-12 mt-3'>
                <h6 class="text-center">${title[i]}</h6>
                <canvas id="chart${i}" class="myChart"></canvas>
            </div>
            `;

        if (type == 'topic' && i == 1) {
           // content += '<div class="col-12 text-center mt-3 mb-3 h5"> The Percentage Scores </div>'
        }
    }
    document.getElementById(containerName).innerHTML = content;
}
function createCanvas2(amount, title, containerName) {
    let content = "";

    for (let i = 0; i < amount; i++) {
        (i < 2) ? classname = 'col-lg-5' : classname = 'col-lg-4 ';
        content += `
            <div class='${classname} col-sm-12 mt-3'>
                <h6 class="text-center">${title[i]}</h6>
                <canvas id="chart${i}" class="myChart"></canvas>
            </div>
            `;

        if (type == 'topic' && i == 1) {
           // content += '<div class="col-12 text-center mt-3 mb-3 h5"> The Percentage Scores </div>'
        }
    }
    document.getElementById(containerName).innerHTML = content;
}

function displayChart(data, id) {
    console.log(data)
    chart = new Chart(document.getElementById(`chart${id}`).getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Last Quiz', 'Global Avg', 'Recent 10 Avg'],
            datasets: [{
                //Input data here
                data: data,
                backgroundColor: [
                    '#EF798A', //Colour here
                    '#98C5FF',
                    '#FFCB45'
                ],
                //Adjust bar width here
                barPercentage: 0.5,

            }],
        },
        options: {
            //Remove legend
            plugins: {
                legend: {
                    display: false
                }
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
                        beginAtZero: true,
                    },
                    gridLines: {
                        //Remove grid lines
                        drawOnChartArea: false
                    },
                }]
            },

        }
    })
}

function displayChart2(data, id) {
    
    chart = new Chart(document.getElementById(`chart${id}`).getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Average', 'Global Average'],
            datasets: [{
                //Input data here
                data: data,
                backgroundColor: [
                    '#00008B',
                    '#8B0000' //Colour here
                    
                ],
                //Adjust bar width here
                barPercentage: 0.5,

            }],
        },
        options: {
            //Remove legend
            plugins: {
                legend: {
                    display: false
                }
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
                        beginAtZero: true,
                    },
                    gridLines: {
                        //Remove grid lines
                        drawOnChartArea: false
                    },
                }]
            },

        }
    })
}
function displayChart3(data, id) {
    console.log(data);
    chart = new Chart(document.getElementById(`chart${id}`).getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Average', 'Global Average'],
            datasets: [{
                //Input data here
                data: data,
                backgroundColor: [
                    '#00008B',
                    '#8B0000' //Colour here
                    
                ],
                //Adjust bar width here
                barPercentage: 0.5,

            }],
        },
        options: {
            //Remove legend
            plugins: {
                legend: {
                    display: false
                }
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
                        beginAtZero: true,
                    },
                    gridLines: {
                        //Remove grid lines
                        drawOnChartArea: false
                    },
                }]
            },

        }
    })
}
function displayChart4(data, id) {
    console.log(data);
    chart = new Chart(document.getElementById(`chart${id}`).getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Latest', 'Last 10 Avg',"Global Avg"],
            datasets: [{
                //Input data here
                data: data,
                backgroundColor: [
                    '#00008B',
                    '#8B0000',
                    '#ffdf00' //Colour here
                    
                ],
                //Adjust bar width here
                barPercentage: 0.5,

            }],
        },
        options: {
            //Remove legend
            plugins: {
                legend: {
                    display: false
                }
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
                        beginAtZero: true,
                    },
                    gridLines: {
                        //Remove grid lines
                        drawOnChartArea: false
                    },
                }]
            },

        }
    })
}

function extractDetailedData(datasets) {
    console.log(datasets)
    let keyArray = ['total_average_score', 'average_time_taken', 'easy_average_score', 'medium_average_score', 'difficult_average_score'];

    for (let i = 0; i < 5; i++) {
        let data = [];
        let key = keyArray[i];

        ('current' in datasets) ? data.push(datasets.current[key]) : data.push(0);
        ('global' in datasets) ? data.push(datasets.global[key]) : data.push(0);
        ('recent' in datasets) ? data.push(datasets.recent[key]) : data.push(0);
        ('average' in datasets) ? data.push(datasets.average[key]) : data.push(0);

console.log(data)
        displayChart(data, i);
    }
}




function extractComparisonData(data) {
    let result = [];

    result.push(data.current);
    result.push(data.global);
    result.push(data.recent);

    return result;
}

function displayNth() {
    document.getElementById("container").innerHTML =
        `<div class="text-center mt-5">
        <div><i class = "fa-5x fas fa-chart-bar" style="color: #EF798A; text-shadow: 5px 5px 0px #98c5ff, -5px -5px 0px #ffcb45;"></i></div>
        <div>Do a quiz to unlock!</div>
    </div>
    `;
}

function displaySub(){
    document.getElementById("container").innerHTML =
    `<div class="text-center mt-5">
    <div><i class = "fa-5x fas fa-chart-bar" style="color: #EF798A; text-shadow: 5px 5px 0px #98c5ff, -5px -5px 0px #ffcb45;"></i></div>
    <div>Choose a Topic to display statistics</div>
</div>
`;
}
