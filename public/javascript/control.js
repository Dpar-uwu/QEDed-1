/* EVENT LISTENERS & API CALLS */
// onload get all levels
$(document).ready(function () {
    $.ajax({
        url: '/level',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            if(data.length >= 1) {
                let notes = [];
                for (let i = 0; i < data.length; i++) {
                    notes.push({
                        "id": data[i]._id,
                        "display": "Primary " + data[i].level
                    })
                }
                displayLevel(notes);
                displayAddLevelBtn();
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
})

//get level by id when level is clicked
$(document).on("click", ".level", function () {
    let id = this.id;
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
    let id = this.id; // get id of skill being clicked

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


$(document).on("click", "#addLevelBtn", function() {
    let lvlList = this.parentElement;
    let lvlForm = document.createElement("div");
    lvlForm.classList.add("levelForm");
    lvlForm.innerHTML = `
        <form>
            <div class="pb-2">
                <input class="form-control newLevel" type="number" placeholder="New Level"/>
            </div>
            <div class="pb-2 form-btn-wrapper">
                <span class="confirmLevel">
                    <i class="fas fa-check"></i>
                </span>
                <span class="cancelLevel">
                    <i class="fas fa-times"></i>
                </span>
            </div>
        </form>
    `
    lvlList.insertBefore(lvlForm, this);
})


// on change percentage difficulty update ui of total qns
$(document).on("keyup change", ".percentage_difficulty", function () {
    calculateQn();
})
$(document).on("keyup change", "#num_of_qn", function () {
    validateNumOfQn();
})

$(document).on("click", "#updateSkill", function () {
    let id = document.querySelector('#skill_id').value;
    let num_of_qn = document.querySelector('#num_of_qn').value;
    let duration = document.querySelector('#duration').value;
    let percentage_easy = document.querySelector("#percentage_easy").value;
    let percentage_medium = document.querySelector("#percentage_medium").value;
    let percentage_difficult = document.querySelector("#percentage_difficult").value;
    let easy_values_min = document.querySelector("#easy_values_min").value;
    let easy_values_max = document.querySelector("#easy_values_max").value;
    let medium_values_min = document.querySelector("#medium_values_min").value;
    let medium_values_max = document.querySelector("#medium_values_max").value;
    let difficult_values_min = document.querySelector("#difficult_values_min").value;
    let difficult_values_max = document.querySelector("#difficult_values_max").value;

    let data = {
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
            let errorDisplay = document.querySelector("#error");
            errorDisplay.innerHTML = "";
            alert("Updated Successfully");
        },
        error: function (xhr, textStatus, errorThrown) {
            const res = xhr.responseJSON;
            let errorDisplay = document.querySelector("#error");
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


/* DISPLAY FUNCTIONS */
function displayLevel(data) {
    let container = document.getElementById("levelContainer");
    let content = '';
    container.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
        content = `
        <div class="level" id="${data[i].id}">
            <div class="text-center">
                <p>${data[i].display}</p>
            </div>
        </div>
        
        `
        container.innerHTML += content;
    }
}

function displayAddLevelBtn() {
    let container = document.getElementById("levelContainer");
    container.innerHTML += `
        <div id="addLevelBtn">
            <div class="text-center">
                + Add Level 
            </div>
        </div>
    `
}

function displayTopic(data, name) {
    const { _id, level, topics } = data;
    document.getElementById("levelContainer").style.display = "none";
    document.getElementById("back").style.display = "block";
    document.getElementById("levelTag").innerHTML = "Primary " + level;

    let container = document.getElementById(name+"Container");
    let content = "";
    container.innerHTML = "";
    for (let i = 0; i < topics.length; i++) {
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
        max: 100000000,
        values: [valueMin, valueMax],
        slide: function (event, ui) {
            for (let i = 0; i < ui.values.length; ++i) {
                $("input.sliderValue-" + id + "[data-index=" + i + "]").val(ui.values[i]);
            }
        }
    });

    $("input.sliderValue-" + id).change(function () {
        let $this = $(this);
        $("#slider-range-" + id).slider("values", $this.data("index"), $this.val());
    });
}


function displaySkillDetail(data) {
    let id = document.querySelector('#skill_id');

    let level = document.querySelector('#level');
    let topic_name = document.querySelector('#topic_name');
    let skill_name = document.querySelector('#skill_name');

    let num_of_qn = document.querySelector('#num_of_qn');
    let duration = document.querySelector('#duration');
    let percentage_easy = document.querySelector("#percentage_easy");
    let percentage_medium = document.querySelector("#percentage_medium");
    let percentage_difficult = document.querySelector("#percentage_difficult");
    let easy_values_min = document.querySelector("#easy_values_min");
    let easy_values_max = document.querySelector("#easy_values_max");
    let medium_values_min = document.querySelector("#medium_values_min");
    let medium_values_max = document.querySelector("#medium_values_max");
    let difficult_values_min = document.querySelector("#difficult_values_min");
    let difficult_values_max = document.querySelector("#difficult_values_max");

    // Update the modal's content
    id.value = data.skillId;

    level.textContent = 'Primary ' + data.level;
    topic_name.textContent = data.topic_name;
    skill_name.textContent = data.skill_name;

    num_of_qn.value = data.num_of_qn;
    duration.value = data.duration;

    let difficulty = data.percent_difficulty.split("-");
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
    let num_of_qn = document.querySelector('#num_of_qn').value;

    let percentage_easy = document.querySelector("#percentage_easy").value;
    let percentage_medium = document.querySelector("#percentage_medium").value;
    let percentage_difficult = document.querySelector("#percentage_difficult").value;

    let condition = num_of_qn % 10 == 0 && percentage_easy % 10 == 0 && percentage_medium % 10 == 0 && percentage_difficult % 10 == 0;
    if (condition) {
        let easy_num = (percentage_easy / 100) * num_of_qn;
        let medium_num = (percentage_medium / 100) * num_of_qn;
        let difficult_num = (percentage_difficult / 100) * num_of_qn;
        let total = easy_num + medium_num + difficult_num;

        document.querySelector("#easy_num").textContent = "Easy Questions: " + easy_num;
        document.querySelector("#medium_num").textContent = "Medium Questions: " + medium_num;
        document.querySelector("#difficult_num").textContent = "Difficult Questions: " + difficult_num;
        document.querySelector("#total_num").textContent = "Total Questions: " + total;

        let num_of_qn = document.querySelector("#num_of_qn");
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
    let num_of_qn = document.querySelector('#num_of_qn').value;
    let error = document.querySelector("#num-error");
    // alert(num_of_qn)
    if(num_of_qn % 10 == 0) {
        error.style.display = "none";
    }
    else {
        error.style.display = "block";
    }
}