var type = "detailed";
let userId = JSON.parse(localStorage.getItem("userInfo"))._id;

/* EVENT LISTENER */
$(document).ready(function () {
    //For stats page only
    if (window.location.toString().includes("stats")) {

        $(".header").load("rightbar.html", function () {
            document.getElementById("name").innerHTML = getName();
        })

        getDetailedBenchmark("", "container");
        getFilter();
    }
})

$(document).on("click", '.select', function () {
    let selected = $(this).children().text();
    $("li").removeClass("active");
    $(this).addClass("active");

    if (selected != "Detailed") {
        type = "comparison";
        getComparisonBenchmark("");
        $(".hide").css("display", "none");
    }
    else {
        type = "detailed";
        getDetailedBenchmark("", "container");
        $(".hide").css("display", "");
    };

});

$(document).on("click", '.dropdown-item', function () {
    if (type == "detailed") {
        getDetailedBenchmark(this.id, "container");
    }
    else {
        getComparisonBenchmark(this.id);
    };
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
    let content = '<li span class="dropdown-item" id=""><span>-</span></li>';

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

        if (type == 'detailed' && i == 1) {
            content += '<div class="col-12 text-center mt-3 mb-3 h5"> The Percentage Scores </div>'
        }
    }
    document.getElementById(containerName).innerHTML = content;
}

function displayChart(data, id) {
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

function extractDetailedData(datasets) {
    let keyArray = ['total_average_score', 'average_time_taken', 'easy_average_score', 'medium_average_score', 'difficult_average_score'];

    for (let i = 0; i < 5; i++) {
        let data = [];
        let key = keyArray[i];

        ('current' in datasets) ? data.push(datasets.current[key]) : data.push(0);
        ('global' in datasets) ? data.push(datasets.global[key]) : data.push(0);
        ('recent' in datasets) ? data.push(datasets.recent[key]) : data.push(0);

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