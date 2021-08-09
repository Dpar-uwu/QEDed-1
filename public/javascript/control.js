
/* EVENT LISTENERS & API CALLS */
// onload get all levels
$(document).ready(function () {
    $(".header").load("rightbar.html",function(){
        document.getElementById("name").innerHTML = getName();
    });

    $.ajax({
        url: '/level',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            if (data.length >= 1) {
                let notes = [];
                for (let i = 0; i < data.length; i++) {
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


// on change percentage difficulty update ui of total qns
$(document).on("keyup change", ".percentage_difficulty", function () {
    calculateQn();
})
$(document).on("keyup change", "#num_of_qn", function () {
    validateNumOfQn();
})

//get level by id when level is clicked
$(document).on("click", ".level", function () {
    let id = this.id;

    $.ajax({
        url: `/level/${id}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            console.log(data);
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

            if (res.code == "UNAUTHENTICATED_USER") {
                window.location.href = "/login.html";
            }
            else if (res.code == "UNAUTHORIZED_USER") {
                window.location.href = "/403.html";
            }
        }
    });
});

//Level
$(document).on("click", ".addLevelBtn", function () {
    let level = $('#inputLevel').val();

    $.ajax({
        url: `/level`,
        type: 'POST',
        data: { 'level': level },
        dataType: 'JSON',
        headers: {
            Authorization: (localStorage.getItem("token") != null) ? "Bearer " + localStorage.getItem("token") : ""
        },
        success: function (data, textStatus, xhr) {
            location.reload();
        },
        error: function (xhr, textStatus, errorThrown) {
            $('#inputLevelErr').html(JSON.parse(xhr.responseText).error);

            const res = xhr.responseJSON;

            if (res.code == "UNAUTHENTICATED_USER") {
                window.location.href = "/login.html";
            }
            else if (res.code == "UNAUTHORIZED_USER") {
                window.location.href = "/403.html";
            }
        }
    });
})

$(document).on("click", ".editLevelBtn", function () {
    let level = $('#inputLevel').val();
    let id = this.id;

    $.ajax({
        url: `/level/${id}`,
        type: 'PUT',
        data: { 'level': level },
        dataType: 'JSON',
        headers: {
            Authorization: (localStorage.getItem("token") != null) ? "Bearer " + localStorage.getItem("token") : ""
        },
        success: function (data, textStatus, xhr) {
            location.reload();
        },
        error: function (xhr, textStatus, errorThrown) {
            $('#inputLevelErr').html(JSON.parse(xhr.responseText).error);

            const res = xhr.responseJSON;

            if (res.code == "UNAUTHENTICATED_USER") {
                window.location.href = "/login.html";
            }
            else if (res.code == "UNAUTHORIZED_USER") {
                window.location.href = "/403.html";
            }
        }
    });
})

$(document).on("click", ".deleteLevelBtn", function () {
    let id = this.id;
    $('#levelModal').modal('hide');

    $.confirm({
        icon: 'fas fa-exclamation-triangle',
        title: 'Are you sure?',
        content: 'This will permanently delete this level and the action cannot be undone.',
        type: 'red',
        buttons: {
            ok: {
                text: "Delete",
                btnClass: 'btn-outline-danger',
                keys: ['enter'],
                action: function () {
                    $.ajax({
                        url: `/level/${id}`,
                        type: 'DELETE',
                        dataType: 'JSON',
                        headers: {
                            Authorization: (localStorage.getItem("token") != null) ? "Bearer " + localStorage.getItem("token") : ""
                        },
                        success: function (data, textStatus, xhr) {
                            location.reload();
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            console.log(xhr.responseText);

                            const res = xhr.responseJSON;

                            if (res.code == "UNAUTHENTICATED_USER") {
                                window.location.href = "/login.html";
                            }
                            else if (res.code == "UNAUTHORIZED_USER") {
                                window.location.href = "/403.html";
                            }
                        }
                    });
                }
            },
            cancel: function () {
                $('#levelModal').modal('show');
            }
        }
    });
})

//Topic
$(document).on("click", ".addTopicBtn", function () {
    let topic_name = $('#inputTopic').val();
    let id = $('#level_id').val();

    $.ajax({
        url: `/topic/${id}`,
        type: 'POST',
        data: { 'topic_name': topic_name },
        dataType: 'JSON',
        headers: {
            Authorization: (localStorage.getItem("token") != null) ? "Bearer " + localStorage.getItem("token") : ""
        },
        success: function (data, textStatus, xhr) {
            $('#topicModal').modal('hide');
            $(`#${data.new_id}`).trigger('click');
        },
        error: function (xhr, textStatus, errorThrown) {
            $('#inputLevelErr').html(JSON.parse(xhr.responseText).error);

            const res = xhr.responseJSON;

            if (res.code == "UNAUTHENTICATED_USER") {
                window.location.href = "/login.html";
            }
            else if (res.code == "UNAUTHORIZED_USER") {
                window.location.href = "/403.html";
            }
        }
    });
})

$(document).on("click", ".editTopicBtn", function () {
    let topic = $('#inputTopic').val();
    let id = this.id;

    $.ajax({
        url: `/topic/${id}`,
        type: 'PUT',
        data: { 'topic_name': topic },
        dataType: 'JSON',
        headers: {
            Authorization: (localStorage.getItem("token") != null) ? "Bearer " + localStorage.getItem("token") : ""
        },
        success: function (data, textStatus, xhr) {
            $('#topicModal').modal('hide');
            $(`#${data.level_id}`).trigger('click');
        },
        error: function (xhr, textStatus, errorThrown) {
            $('#inputLevelErr').html(JSON.parse(xhr.responseText).error);

            const res = xhr.responseJSON;

            if (res.code == "UNAUTHENTICATED_USER") {
                window.location.href = "/login.html";
            }
            else if (res.code == "UNAUTHORIZED_USER") {
                window.location.href = "/403.html";
            }
        }
    });
})

$(document).on("click", ".deleteTopicBtn", function () {
    let id = this.id;
    $('#topicModal').modal('hide');

    $.confirm({
        icon: 'fas fa-exclamation-triangle',
        title: 'Are you sure?',
        content: 'This will permanently delete this level and the action cannot be undone.',
        type: 'red',
        buttons: {
            ok: {
                text: "Delete",
                btnClass: 'btn-outline-danger',
                keys: ['enter'],
                action: function () {
                    $.ajax({
                        url: `/topic/${id}`,
                        type: 'DELETE',
                        dataType: 'JSON',
                        headers: {
                            Authorization: (localStorage.getItem("token") != null) ? "Bearer " + localStorage.getItem("token") : ""
                        },
                        success: function (data, textStatus, xhr) {
                            console.log(data)
                            $(`#${data.level_id}`).trigger('click');
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            console.log(xhr.responseText);

                            const res = xhr.responseJSON;

                            if (res.code == "UNAUTHENTICATED_USER") {
                                window.location.href = "/login.html";
                            }
                            else if (res.code == "UNAUTHORIZED_USER") {
                                window.location.href = "/403.html";
                            }
                        }
                    });
                }
            },
            cancel: function () {
                $('#topicModal').modal('show');
            }
        }
    });
})
$(document).on("click", ".addSkillBtn", function () {
    let id = this.id;
    let skill_name = document.querySelector('#skill_name').value;
    let skill_code = document.querySelector('#skill_code').value;
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
        skill_name,
        skill_code,
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
    // post skill details by id
    $.ajax({
        url: `/skill/${id}`,
        data: JSON.stringify(data),
        method: "POST",
        dataType: 'JSON',
        contentType: 'application/json',
        headers: {
            Authorization: (localStorage.getItem("token") != null) ? "Bearer " + localStorage.getItem("token") : ""
        },
        success: function (data, textStatus, xhr) {
            let errorDisplay = document.querySelector("#error");
            errorDisplay.innerHTML = "";

            $('#skillModal').modal('hide');
            $(`#${data.new_id}`).trigger('click');
        },
        error: function (xhr, textStatus, errorThrown) {
            const res = xhr.responseJSON;
            let errorDisplay = document.querySelector("#error");

            errorDisplay.innerHTML = "";

            if (res.code == "INVALID_REQUEST") {
                res.error.forEach(element => {
                    errorDisplay.innerHTML += element + "<br>";
                })
            }
            else if (res.code == "UNAUTHENTICATED_USER") {
                window.location.href = "/login.html";
            }
            else if (res.code == "UNAUTHORIZED_USER") {
                window.location.href = "/403.html";
            }
            else {
                errorDisplay.innerHTML = res.error;
            }
        }
    });
})

$(document).on("click", ".updateSkillBtn", function () {
    let id = document.querySelector('#skill_id').value;
    let skill_name = document.querySelector('#skill_name').value;
    let skill_code = document.querySelector('#skill_code').value;
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
        skill_name,
        skill_code,
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
            Authorization: (localStorage.getItem("token") != null) ? "Bearer " + localStorage.getItem("token") : ""
        },
        success: function (data, textStatus, xhr) {
            let errorDisplay = document.querySelector("#error");
            errorDisplay.innerHTML = "";

            $('#skillModal').modal('hide');
            $(`#${data.level_id}`).trigger('click');
        },
        error: function (xhr, textStatus, errorThrown) {
            const res = xhr.responseJSON;
            let errorDisplay = document.querySelector("#error");
            errorDisplay.innerHTML = "";

            if (res.code == "INVALID_REQUEST") {
                res.error.forEach(element => {
                    errorDisplay.innerHTML += element + "<br>";
                })
            }
            else if (res.code == "UNAUTHENTICATED_USER") {
                window.location.href = "/login.html";
            }
            else if (res.code == "UNAUTHORIZED_USER") {
                window.location.href = "/403.html";
            }
            else {
                errorDisplay.innerHTML = res.error;
            }
        }
    });
})

$(document).on("click", ".deleteSkillBtn", function () {
    let id = document.querySelector('#skill_id').value;
    $('#skillModal').modal('hide');

    $.confirm({
        icon: 'fas fa-exclamation-triangle',
        title: 'Are you sure?',
        content: 'This will permanently delete this level and the action cannot be undone.',
        type: 'red',
        buttons: {
            ok: {
                text: "Delete",
                btnClass: 'btn-outline-danger',
                keys: ['enter'],
                action: function () {
                    $.ajax({
                        url: `/skill/${id}`,
                        type: 'DELETE',
                        dataType: 'JSON',
                        headers: {
                            Authorization: (localStorage.getItem("token") != null) ? "Bearer " + localStorage.getItem("token") : ""
                        },
                        success: function (data, textStatus, xhr) {
                            $(`#${data.level_id}`).trigger('click');
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            console.log(xhr.responseText);

                            const res = xhr.responseJSON;

                            if (res.code == "UNAUTHENTICATED_USER") {
                                window.location.href = "/login.html";
                            }
                            else if (res.code == "UNAUTHORIZED_USER") {
                                window.location.href = "/403.html";
                            }
                        }
                    });
                }
            },
            cancel: function () {
                $('#skillModal').modal('show');
            }
        }
    });
})

/* Editing modal title and btn */
//Level
$(document).on("click", ".icon", function (event) {
    let level = ($(this).parent().prev().text()).replace(/[^0-9]/g, '');
    let id = $(this).parent().parent().parent().attr('id');

    $('#inputLevel').val(level);
    $('#levelModal').modal('show');
    $('#levelModalTitle').html('Edit Level');
    $('#inputLevelErr').html('');
    $('.addLevelBtn').addClass('editLevelBtn').removeClass('addLevelBtn');
    $('.editLevelBtn').attr('id', id);
    $('.deleteLevelBtn').remove();
    $('.editLevelBtn').before(`<button type="button" class="btn btn-outline-danger deleteLevelBtn">Delete</button>`);
    $('.deleteLevelBtn').attr('id', id);

    event.stopPropagation();
})

$(document).on("click", ".addLevel", function () {
    $('#inputLevel').val('');
    $('#levelModalTitle').html('Add Level');
    $('#inputLevelErr').html('');
    $('.editLevelBtn').addClass('addLevelBtn').removeClass('editLevelBtn');
    $('.addLevelBtn').attr('id', '');
    $('.deleteLevelBtn').remove();
})

// Topics
$(document).on("click", ".addTopic", function () {
    $('#level_id').val(this.id);
    $('#inputLevel').val('');
    $('#TopicModalTitle').html('Add Topic');
    $('#inputTopicErr').html('');
    $('.editTopicBtn').addClass('addTopicBtn').removeClass('editTopicBtn');
    $('.addTopicBtn').attr('id', '');
    $('.deleteTopicBtn').remove();
})

$(document).on("click", ".editTopic", function () {
    let topic = $(this).children("p").text();
    let id = $(this).parent().attr("id");

    $('#inputTopic').val(topic);
    $('#topicModal').modal('show');
    $('#topicModalTitle').html('Edit Topic');
    $('#inputTopicErr').html('');
    $('.addTopicBtn').addClass('editTopicBtn').removeClass('addTopicBtn');
    $('.editTopicBtn').attr('id', id);
    $('.deleteTopicBtn').remove();
    $('.editTopicBtn').before(`<button type="button" class="btn btn-outline-danger deleteTopicBtn">Delete</button>`);
    $('.deleteTopicBtn').attr('id', id);
})

//SKILLS
$(document).on("click", ".addSkill", function () {
    let elements = document.getElementsByTagName("input");
    let id = this.id;

    for (let i = 0; i < elements.length; i++) {
        elements[i].value = "";
    }

    $(this).attr("id", "");
    $('#skillModalLabel').html('Add Skill');
    $('.updateSkillBtn').addClass('addSkillBtn').removeClass('updateSkillBtn');
    $('.addSkillBtn').attr("id", id);
    $('.deleteSkillBtn').remove();
})

// DISPLAY FUNCTIONS
function displayLevel(data, name) {
    let container = document.getElementById(name + "Container");
    let content = '';

    container.innerHTML = '';

    for (let i = 0; i < data.length; i++) {
        content = `
        <div class="${name}" id="${data[i].id}">
            <div class="text-center level-container">
                <span>${data[i].display}</span>
                <i class="icon fas fa-pen"></i>
            </div>
        </div>        
        `
        container.innerHTML += content;
    }
    container.innerHTML += `
        <div class="addLevel" data-bs-toggle="modal" data-bs-target="#levelModal">
            Add Level
        </div>
    `;
}

function displayTopic(data, name) {
    const { _id, level, topics } = data;

    document.getElementById("levelTag").innerHTML = "Primary " + level;
    document.getElementById("levelContainer").style.display = "none";
    document.getElementById("back").style.display = "block";

    let container = document.getElementById(name + "Container");
    let content = "";

    container.innerHTML = "";
    container.innerHTML +=     
    `<button class="btn addTopic" 
        id="${data._id}" 
        data-bs-toggle="modal" 
        data-bs-target="#topicModal" 
        onclick="resetSkillForm()">Add Topic</button>`
    for (var i = 0; i < topics.length; i++) {
        content = `
            <div class="topicWrapper">
                <div class="${name}" 
                    id="${topics[i]._id}" 
                    data-toggle="collapse" 
                    aria-expanded="false" 
                    data-target="#collapse-${i}"
                    aria-controls="collapse-${i}">
                    <div class="text-center editTopic">
                        <p>${topics[i].topic_name}</p>
                    </div>
                    <div 
                        id="collapse-${i}" 
                        class="collapse">
                </div>`;

        topics[i].skills.forEach(element => {
            content += `
                <div 
                    class="skill" 
                    id="${element._id}"
                    data-bs-toggle="modal" 
                    data-bs-target="#skillModal">
                ${element.skill_name}
                </div>
                
                `
            });
        content += 
        `<div class="addSkill" id="${topics[i]._id}" data-bs-toggle="modal" data-bs-target="#skillModal">
            <i class="fas fa-plus-circle"></i> Add Skills
        </div>
        </div></div>`;  
        container.innerHTML += content;
    }
}

function createSlider(id, valueMin = 100, valueMax = 300) {
    $("#slider-range-" + id).slider({
        range: true,
        min: 0,
        max: 1000000,
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

    let skill_name = document.querySelector('#skill_name');
    let skill_code = document.querySelector('#skill_code');
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

    //Updating modal
    $('#skillModalLabel').html('Edit Skill');
    $('.addSkillBtn').addClass('updateSkillBtn').removeClass('addSkillBtn');
    $('.deleteSkillBtn').remove();
    $('.updateSkillBtn').before(` <button type="button" class="btn me-1 deleteSkillBtn">Delete</button>`);

    // Update the modal's content
    id.value = data.skillId;
    skill_name.value = data.skill_name;
    skill_code.value = data.skill_code;

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

// MISC FN
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

        num_of_qn = document.querySelector("#num_of_qn");
        if (num_of_qn.value != total) {
            document.querySelector("#total_num").style.color = "red";
            document.querySelector("#total_num").textContent += " (Total not 100%)";
        }
        else {
            document.querySelector("#total_num").style.color = "inherit";

        }
    }
}

function validateNumOfQn() {
    let num_of_qn = document.querySelector('#num_of_qn').value;
    let error = document.querySelector("#num-error");
    if(num_of_qn % 10 == 0) {
        error.style.display = "none";
    }
    else {
        error.style.display = "block";
    }
}


function resetSkillForm() {
    document.querySelector("#skill_code").value = "none";
    document.querySelector("#easy_num").textContent = "";
    document.querySelector("#medium_num").textContent = "";
    document.querySelector("#difficult_num").textContent = "";
    document.querySelector("#total_num").textContent = "";
    createSlider("easy", 0, 0);
    createSlider("medium", 0, 0);
    createSlider("difficult", 0, 0);
}
