let syllabus = {};
var urlSearchParams = new URLSearchParams(window.location.search);
var groupId = urlSearchParams.get("groupId");

/* WINDOWS EVENT LISTENER */
$(document).ready(function () {
    getAssignmentByGrp();
    getLevelSelect();
    displayEducatorUI();
});

// display topic according to selected level
$(document).on("change", "#level-select", function() {
    document.querySelector(".topic-input-wrapper").style.display = "block";
    document.querySelector(".skill-input-wrapper").style.display = "none";
    let selectedLvl = this.value;
    getTopicByLevel(selectedLvl);
});

// display skill accoording to selected topic
$(document).on("change", "#topic-select", function() {
    document.querySelector(".skill-input-wrapper").style.display = "block";
    let selectedLvl = document.querySelector("#level-select").value;
    let selectedTopic = this.value;
    getSkillByTopic(selectedLvl, selectedTopic);
});

// create assignment button
$(document).on("click", "#btn-create", function() {
    createAssignment();
});

$(document).on("click", ".assignment", function() {
    let role = decodeToken().issuedRole;
    if(role == "student") {
        window.location.href = "/quiz.html?skill=" + this.id;
    }
});

/* API CALLS */
function getAssignmentByGrp() {
    $.ajax({
        url: `/assignment/group?groupId=${groupId}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            displayGroupName(data.group_name);
            displayAssignments(data.assignments);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function getLevelSelect() {
    $.ajax({
        url: `/level`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            populateLevelSelect(data);
            syllabus = data;
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}


function getTopicByLevel(selectedLevel) {
    let topics = syllabus.find(level=> {
        return level._id == selectedLevel;
    });
    populateTopic(topics.topics);
}

function getSkillByTopic(selectedLevel, selectedSkill) {
    let topics = syllabus.find(level=> {
        return level._id == selectedLevel;
    });
    let skills = topics.topics.find(topic=> {
        return topic._id == selectedSkill;
    });
    populateSkill(skills.skills);
}

function createAssignment() {
    let data = {
        title: document.querySelector("#title").value,
        level_id: document.querySelector("#level-select").value,
        topic_id: document.querySelector("#topic-select").value,
        skill_id: document.querySelector("#skill-select").value,
        deadline: document.querySelector("#deadline").value,
        assigned_by: decodeToken().sub,
        group_id: groupId,
    };

    $.ajax({
        url: `/assignment`,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: 'JSON',
        contentType: "application/json",
        headers: {
            Authorization: (localStorage.getItem("token") != null) ? "Bearer " +localStorage.getItem("token") : ""
        },
        success: function (data, textStatus, xhr) {
            location.reload();
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(xhr.responseText)
            document.querySelector('#error').innerHTML = JSON.parse(xhr.responseText).error;
        }
    });
}




/* DISPLAY FUNCTIONS */
function displayEducatorUI() {
    let role = decodeToken().issuedRole;

    if(role == "teacher" || role == "parent" || role == "admin") {
        let content = `
            <button id="edit-btn" data-bs-toggle="modal" data-bs-target="#assignQuizModal">
                Assign Quiz
            </button>
        `;
        document.querySelector("#btn-wrapper").innerHTML = content;
    }
}

function displayGroupName(group_name) {
    document.querySelector(".title").innerHTML = group_name;
}

function displayAssignments(assignments) {
    let assignmentList = document.querySelector("#assignment-list");

    let content = "";
    assignments.forEach(assignment => {
        content += `
            <div class="assignment" id="${assignment.skill_id}">
                <div class="assignment-details">
                    <span class="assignment-title">${assignment.title}</span>
                    <small class="assign-by">Assigned By: ${assignment.assigned_by_name}</small>
                    <span class="assign-skill">${assignment.skill_name}</span>
                </div>
                <small class="deadline">${displayDate(assignment.deadline)}</small>
            </div>
        `;
    });
    if(content != "") assignmentList.innerHTML = content;
}

function populateLevelSelect(levels) {
    let levelSelect = document.querySelector("#level-select");
    let content = ``;
    levels.forEach(row => {
        content += `
            <option value="${row._id}">Primary ${row.level}</option>
        `;
    });
    levelSelect.innerHTML += content;
}

function populateTopic(topics) {
    let topicSelect = document.querySelector("#topic-select");
    let content = ``;
    topics.forEach(row => {
        content += `
            <option value="${row._id}">${row.topic_name}</option>
        `;
    });
    topicSelect.innerHTML += content;
}

function populateSkill(skills) {
    let skillSelect = document.querySelector("#skill-select");
    let content = ``;
    skills.forEach(row => {
        content += `
            <option value="${row._id}">${row.skill_name}</option>
        `;
    });
    skillSelect.innerHTML += content;
}


/* MISC FUNCTIONS */
function decodeToken() {
    const token = localStorage.getItem('token');

    let base64Url = token.split('.')[1]; // token you get
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    let decodedData = JSON.parse(window.atob(base64));

    return decodedData;
}

function displayDate(dt) {
    let date = new Date(dt);
    let today = new Date(Date.now());
    console.log(date.toDateString(), today.toDateString())
    let result = (date.toDateString() == today.toDateString()) ?
        "Today" :
        date.toDateString()
    return result;
}