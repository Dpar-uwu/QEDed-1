
// onload get all levels
$(document).ready(function () {
    $.ajax({
        url: '/level',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            if(data.length >= 1) {
                var notes = [];
                for (var i = 0; i < data.length; i++) {
                    notes.push({
                        "id": data[i]._id,
                        "display": "Primary " + data[i].level
                    })
                }
                displayLevel(notes, "level");
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
})

//get level by id when level is clicked
$(document).on("click", ".level", function () {
    var id = this.id;
    $.ajax({
        url: `/level/${id}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            displayTopic(data, "topic");
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
})

$(document).on("click", ".skill", function () {
    var id = this.id; // get id of skill being clicked

    // get skill details by id
    $.ajax({
        url: `/skill/${id}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            displaySkillDetail(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
});

// set default levels if no levels
$(document).on("click", "#setDefault", function () {
    
    // get skill details by id
    $.ajax({
        url: `/level/resetDefault`,
        method: "POST",
        data: JSON.stringify({}),
        dataType: 'JSON',
        contentType: 'application/json',
        headers: {
            Authorization: (localStorage.getItem("token") != null) ? "Bearer " + localStorage.getItem("token") : ""
        },
        success: function (data, textStatus, xhr) {
            location.reload();
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            const res = xhr.responseJSON;

            if(res.code == "UNAUTHENTICATED_USER") {
                window.location.href = "/login.html";
            }
            else if(res.code == "UNAUTHORIZED_USER") {
                window.location.href = "/403.html";
            }
        }
    });
});

// on change percentage difficulty update ui of total qns
$(document).on("keyup change", ".percentage_difficulty", function () {
    calculateQn();
})
$(document).on("keyup change", "#num_of_qn", function () {
    validateNumOfQn();
})

$(document).on("click", "#updateSkill", function () {
    var id = document.querySelector('#skill_id').value;
    var num_of_qn = document.querySelector('#num_of_qn').value;
    var duration = document.querySelector('#duration').value;
    var percentage_easy = document.querySelector("#percentage_easy").value;
    var percentage_medium = document.querySelector("#percentage_medium").value;
    var percentage_difficult = document.querySelector("#percentage_difficult").value;
    var easy_values_min = document.querySelector("#easy_values_min").value;
    var easy_values_max = document.querySelector("#easy_values_max").value;
    var medium_values_min = document.querySelector("#medium_values_min").value;
    var medium_values_max = document.querySelector("#medium_values_max").value;
    var difficult_values_min = document.querySelector("#difficult_values_min").value;
    var difficult_values_max = document.querySelector("#difficult_values_max").value;

    var data = {
        num_of_qn,
        duration,
        percent_difficulty: `${percentage_easy}-${percentage_medium}-${percentage_difficult}`,
        easy_values: {
            min: easy_values_min,
            max: easy_values_max,
        },
        medium_values: {
            min: medium_values_min,
            max: medium_values_max,
        },
        difficult_values: {
            min: difficult_values_min,
            max: difficult_values_max,
        },
    };
    // update skill details by id
    $.ajax({
        url: `/skill/${id}`,
        data: JSON.stringify(data),
        method: "PUT",
        dataType: 'JSON',
        contentType: 'application/json',
        headers: {
            Authorization:  (localStorage.getItem("token") != null) ? "Bearer " +localStorage.getItem("token") : ""
        },
        success: function (data, textStatus, xhr) {
            var errorDisplay = document.querySelector("#error");
            errorDisplay.innerHTML = "";
            alert("Updated Successfully");
        },
        error: function (xhr, textStatus, errorThrown) {
            const res = xhr.responseJSON;
            var errorDisplay = document.querySelector("#error");
            errorDisplay.innerHTML = "";

            if(res.code == "INVALID_REQUEST") {
                res.error.forEach(element => {
                    errorDisplay.innerHTML += element + "<br>";
                })
            }
            else if(res.code == "UNAUTHENTICATED_USER") {
                window.location.href = "/login.html";
            }
            else if(res.code == "UNAUTHORIZED_USER") {
                window.location.href = "/403.html";
            }
            else {
                errorDisplay.innerHTML = res.error;
            }
        }
    });
})


// DISPLAY FUNCTIONS
function displayLevel(data, name) {
    var container = document.getElementById(name+"Container");
    var content = '';
    container.innerHTML = '';
    for (var i = 0; i < data.length; i++) {
        content = `
        <div class="${name}" id="${data[i].id}">
            <div class="text-center">
                <p>${data[i].display}</p>
            </div>
        </div>
        
        `
        container.innerHTML += content;
    }
}
function displayTopic(data, name) {
    const { _id, level, topics } = data;
    document.getElementById("levelContainer").style.display = "none";
    document.getElementById("back").style.display = "block";
    document.getElementById("levelTag").innerHTML = "Primary " + level;

    var container = document.getElementById(name+"Container");
    var content = "";
    container.innerHTML = "";
    for (var i = 0; i < topics.length; i++) {
        content = `
        <div class="topicWrapper">
            <div class="${name}" 
                id="${topics[i]._id}" 
                data-toggle="collapse" 
                aria-expanded="false" 
                data-target="#collapse-${i}"
                aria-controls="collapse-${i}">
                <div class="text-center">
                    <p>${topics[i].topic_name}</p>
                </div>
                <div 
                    id="collapse-${i}" 
                    class="collapse">
            </div>`

            topics[i].skills.forEach(element => {
                content += `
                <div 
                    class="skill" 
                    id="${element._id}"
                    data-bs-toggle="modal" 
                    data-bs-target="#exampleModal">
                ${element.skill_name}
                </div>
                
                `
            });
        content += `</div></div>`;
        container.innerHTML += content;
    }
}


function createSlider(id, valueMin = 100, valueMax = 300) {
    $("#slider-range-" + id).slider({
        range: true,
        min: 0,
        max: 500,
        values: [valueMin, valueMax],
        slide: function (event, ui) {
            for (var i = 0; i < ui.values.length; ++i) {
                $("input.sliderValue-" + id + "[data-index=" + i + "]").val(ui.values[i]);
            }
        }
    });

    $("input.sliderValue-" + id).change(function () {
        var $this = $(this);
        $("#slider-range-" + id).slider("values", $this.data("index"), $this.val());
    });
}


function displaySkillDetail(data) {
    var id = document.querySelector('#skill_id');

    var level = document.querySelector('#level');
    var topic_name = document.querySelector('#topic_name');
    var skill_name = document.querySelector('#skill_name');

    var num_of_qn = document.querySelector('#num_of_qn');
    var duration = document.querySelector('#duration');
    var percentage_easy = document.querySelector("#percentage_easy");
    var percentage_medium = document.querySelector("#percentage_medium");
    var percentage_difficult = document.querySelector("#percentage_difficult");
    var easy_values_min = document.querySelector("#easy_values_min");
    var easy_values_max = document.querySelector("#easy_values_max");
    var medium_values_min = document.querySelector("#medium_values_min");
    var medium_values_max = document.querySelector("#medium_values_max");
    var difficult_values_min = document.querySelector("#difficult_values_min");
    var difficult_values_max = document.querySelector("#difficult_values_max");

    // Update the modal's content
    id.value = data.skillId;

    level.textContent = 'Primary ' + data.level;
    topic_name.textContent = data.topic_name;
    skill_name.textContent = data.skill_name;

    num_of_qn.value = data.num_of_qn;
    duration.value = data.duration;

    var difficulty = data.percent_difficulty.split("-");
    percentage_easy.value = difficulty[0];
    percentage_medium.value = difficulty[1];
    percentage_difficult.value = difficulty[2];

    easy_values_min.value = data.easy_values.min;
    easy_values_max.value = data.easy_values.max;
    medium_values_min.value = data.medium_values.min;
    medium_values_max.value = data.medium_values.max;
    difficult_values_min.value = data.difficult_values.min;
    difficult_values_max.value = data.difficult_values.max;

    createSlider("easy", data.easy_values.min, data.easy_values.max);
    createSlider("medium", data.medium_values.min, data.medium_values.max);
    createSlider("difficult", data.difficult_values.min, data.difficult_values.max);

    calculateQn();
}

function calculateQn() {
    // check all values in params are multiple of 10
    var num_of_qn = document.querySelector('#num_of_qn').value;

    var percentage_easy = document.querySelector("#percentage_easy").value;
    var percentage_medium = document.querySelector("#percentage_medium").value;
    var percentage_difficult = document.querySelector("#percentage_difficult").value;

    var condition = num_of_qn % 10 == 0 && percentage_easy % 10 == 0 && percentage_medium % 10 == 0 && percentage_difficult % 10 == 0;
    if (condition) {
        var easy_num = (percentage_easy / 100) * num_of_qn;
        var medium_num = (percentage_medium / 100) * num_of_qn;
        var difficult_num = (percentage_difficult / 100) * num_of_qn;
        var total = easy_num + medium_num + difficult_num;

        document.querySelector("#easy_num").textContent = "Easy Questions: " + easy_num;
        document.querySelector("#medium_num").textContent = "Medium Questions: " + medium_num;
        document.querySelector("#difficult_num").textContent = "Difficult Questions: " + difficult_num;
        document.querySelector("#total_num").textContent = "Total Questions: " + total;

        var num_of_qn = document.querySelector("#num_of_qn");
        if (num_of_qn.value != total) {
            document.querySelector("#total_num").style.color = "red";
            document.querySelector("#total_num").textContent += " (Total not 100%)"
        }
        else {
            document.querySelector("#total_num").style.color = "inherit";

        }
    }
}

function validateNumOfQn() {
    var num_of_qn = document.querySelector('#num_of_qn').value;
    var error = document.querySelector("#num-error");
    // alert(num_of_qn)
    if(num_of_qn % 10 == 0) {
        error.style.display = "none";
    }
    else {
        error.style.display = "block";
    }
}