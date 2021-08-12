const urlSearchParams = new URLSearchParams(window.location.search);
var groupId = urlSearchParams.get("groupId");
var selectedName;
var userId;

/* EVENT LISTENERS */
$(document).ready(function () {
    getGroupById();
    getGroupMembers();
    getGroupBenchmark();
})

$(document).on("click", ".member", function () {
    userId = this.id;
    selectedName = $(this).text();

    getUserGroupBenchmark(userId, "");
})

$(document).on("click", ".dropdown-item", function () {
    let x = this.id;
    console.log(x)
    let params = "&" + x;
    console.log(params)

    getUserGroupBenchmark(userId, params);
})


/* API CALLS */
function getGroupById() {
    if (!groupId) window.location.href = "/group.html";

    $.ajax({
        url: `/group/${groupId}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            displayGroup(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            window.location.href = "/404.html";
        }
    });
}

function getGroupMembers() {
    $.ajax({
        url: `/group/members?groupId=${groupId}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            displayMembers(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            // window.location.href = "/404.html";
        }
    });
}

function getGroupBenchmark() {
    $.ajax({
        url: `/group/benchmark?groupId=${groupId}`,
        type: 'POST',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            if (data.group == null) {
                displayNth();
            }
            else {
                let extractedData = extractGroupBenchmarkData(data);
                displayStats(extractedData, 0);
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            // window.location.href = "/404.html";
        }
    });
}

function getUserGroupBenchmark(userId, params) {
    $.ajax({
        url: `/group/benchmarkByUser?groupId=${groupId}&user=${userId}${params}`,
        type: 'POST',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            let title = []
            let isAvailable = true;
            let extractedData = [];

            isAvailable = jQuery.isEmptyObject({data});;

            Object.keys(data).forEach(key => {
                if (data[key].recent != undefined) {
                    title.push(key)
                    extractedData.push(extractUserBenchmarkData(data[key]));

                    getFilter(userId);
                }
                else {
                    isAvailable = false;
                    return false;
                }
            })

            if (isAvailable) {
                createCanvas(title.length, title);

                for (let i = 0; i < extractedData.length; i++) {
                    displayStats(extractedData[i], i);
                }

            }
            else {
                displayNth();
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            // window.location.href = "/404.html";
        }
    });
}

function getFilter(userId) {
    $.ajax({
        url: `/group/benchmarkFilter?groupId=${groupId}&user=${userId}`,
        type: 'POST',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            createFilter(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            // window.location.href = "/404.html";
        }
    });
}

/* Create Canvas */
function createCanvas(amount, title) {
    let heading = "Primary";
    let container = document.getElementById('benchmarkContainer');
    container.innerHTML = "";

    for (let i = 0; i < amount; i++) {
        if (isNaN(title[i])) heading = "";

        container.innerHTML += `
        <div class="mt-5 col-md-8 col-sm-12 p-0 justify-content-center container">
            <h6 class="text-center">${heading} ${title[i]}</h6>
            <canvas id="chart${i}" class="myChart"></canvas>
        </div>
        `
        clearGraph(i);
    }

    $('#benchmarkContainer').prepend(
        `<div class="misc d-flex m-auto justify-content-between align-items-center m-0">
            <a href="" class="p-3" id="back"><i class="fas fa-chevron-left"></i></a>
            <h5 class="m-0" id="name">Name</h5>
            <div class="dropdown">
                <button class="dropdown-toggle btn filter" href="#" id="mainDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-sliders-h"></i> 
                    <span>filter</span>
                </button>
                <ul class="dropdown-menu" id="firstDropList" aria-labelledby="mainDropdown">
                </ul>
            </div>
        </div>`
    )

    document.getElementById('name').innerHTML = selectedName;
}

/* Create Filter Dropdown */
function createFilter(data) {
    let content = '';

    for (let i = 0; i < data.length; i++) {
        content +=
            `<li class="dropdown-submenu">
                <span class="dropdown-item" id="level=${data[i]._id}">Primary ${data[i]._id}</span>
            `;

        for (let index = 0; index < data[i].topics.length; index++) {
            if (index == 0) {
                content += `<ul class="dropdown-menu">`;
            }

            content +=
                `<li class="dropdown-item" id="topic=${data[i].topics[index].topic}">
                ${data[i].topics[index].topic}
            </li>`

            if (index + 1 == data[i].topics.length) content += "</ul>";
        }

        content += "</li>"
    }

    if (content != '') document.getElementById('firstDropList').innerHTML = content;
}

/* Display Data */
function displayGroup(data) {
    document.querySelector(".title").textContent = data.group_name;
}

function displayMembers(data) {
    // main page
    let studentList = document.querySelector("#student");

    // display members
    if (data.members && data.members.length >= 1) {
        data.members.forEach(member => {
            if (member.role == "student") {
                studentList.innerHTML += `
                    <div class="member" id="${member.user_id}">
                        <span class="member-name">${member.user_name}</span>
                    </div>
                `;
            }
        });
    }

    // display count (minus 1 to exclude header)
    document.querySelector("#student-count").innerHTML = document.querySelector("#student").children.length - 1 + " students";
}

function displayStats(data, id) {
    let chart;
    let labels = ['Last 10 Avg', 'Group Avg', 'Global Avg'];

    if (data.length == 2) {
        labels.splice(0, 1);
    }

    chart = new Chart(document.getElementById(`chart${id}`).getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
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

function displayNth() {
    document.getElementById("benchmarkContainer").innerHTML =
        `<div class="text-center mt-5">
        <div><i class = "fa-5x fas fa-chart-bar" style="color: #EF798A; text-shadow: 5px 5px 0px #98c5ff, -5px -5px 0px #ffcb45;"></i></div>
        <div>Do a quiz to unlock!</div>
    </div>
    `;
}

function clearGraph(id) {
    Chart.helpers.each(Chart.instances, function (instance) {
        if (instance.canvas.id == 'chart' + id) {
            instance.destroy();
        }
    })
}

/* Extract Data */
function extractGroupBenchmarkData(data) {
    let result = [];

    result.push(data.group.average_score);
    result.push(data.global.total_average_score);

    return result;
}

function extractUserBenchmarkData(data) {
    let result = [];

    result.push(data.recent);
    result.push(data.group);
    result.push(data.global);

    return result;
}