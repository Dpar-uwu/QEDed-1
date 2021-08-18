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

// click on completed assignments dropdown
$(document).on("click", ".tag-container", function() {
    let toggle = document.querySelector("#completed-list");
    if(toggle.childElementCount >= 1) {
        toggle.classList.toggle("visible");
        document.querySelector(".arrow").classList.toggle("rotate");
    }
})

$(document).on("click", ".assignment", function() {
    let role = decodeToken().issuedRole;
    if(role == "student") {
        if(this.classList.contains("completed")) {
            window.location.href = "/viewpastquiz.html?quizId=" + this.dataset.quizId;
        }
        else {
            window.location.href = "/quiz.html?skill=" + this.id + "&assignment=" + this.dataset.assignment;
        }
    }
    else if(role == "teacher" || role == "parent" || role == "admin") {
        this.nextElementSibling.classList.toggle("visible");
    }
});

$(document).on("click", ".member-assign-status", function() {
    let asgnStatus = this.querySelector(".assignment-status");
    console.log(asgnStatus)
    if(asgnStatus.classList.contains("complete")) {
        window.location.href = "/viewpastquiz.html?quizId=" + asgnStatus.dataset.quizId;
    }
});

/* API CALLS */
function getAssignmentByGrp() {
    let role = decodeToken().issuedRole;

    if(role == "student") {
        $.ajax({
            url: `/assignment/group?groupId=${groupId}&userId=${decodeToken().sub}`,
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
    else {
        $.ajax({
            url: `/assignment/outstanding?groupId=${groupId}&userId=${decodeToken().sub}`,
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
}

function checkIfGrpAdmin() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/group/isGrpAdmin?groupId=${groupId}&userId=${decodeToken().sub}`,
            dataType: 'JSON',
            success: function (data, textStatus, xhr) {
                console.log(data.group_role)
                resolve(data.group_role);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log(errorThrown);
                reject(errorThrown)            }
        });
    })
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
async function displayEducatorUI() {
    try {
        let role = await checkIfGrpAdmin();
        if(role == "admin" || role == "owner") {
            let content = `
                <button id="edit-btn" data-bs-toggle="modal" data-bs-target="#assignQuizModal">
                    Assign Quiz
                </button>
            `;
            document.querySelector("#btn-wrapper").innerHTML = content;
        }
    } catch(err) {
        window.location.href = "/403.html";
    }
    
}

function displayGroupName(group_name) {
    document.querySelector(".title").innerHTML = group_name;
}

function displayAssignments(assignments) {
    let assignmentList = document.querySelector("#assignment-list");
    let completedList = document.querySelector("#completed-list");

    let content = "";
    let completedAssignment = null;
    assignments.forEach(assignment => {
        // student view
        if(assignment.completed_quiz == false) {
            content += `
                <div class="assignment" id="${assignment.skill_id}" data-assignment="${assignment._id}">
                    <div class="assignment-details">
                        <span class="assignment-title">${assignment.title}</span>
                        <small class="assign-by">Assigned By: ${assignment.assigned_by_name}</small>
                        <span class="assign-skill">${assignment.skill_name}</span>
                    </div>
                    <small class="deadline">${displayDate(assignment.deadline)}</small>
                </div>
            `;
        }
        else if(assignment.completed_quiz) {
            completedAssignment = `
            <div class="assignment completed" id="${assignment.skill_id}" data-assignment="${assignment._id}" data-quiz-id="${assignment.completed_quiz}">
                <div class="assignment-details">
                    <span class="assignment-title">${assignment.title}</span>
                    <small class="assign-by">Assigned By: ${assignment.assigned_by_name}</small>
                    <span class="assign-skill">${assignment.skill_name}</span>
                </div>
                <small class="deadline">${displayDate(assignment.deadline)}</small>
            </div>
            `;
        }
        else if(assignment.member_assignment) { //for educator: displays status of each member in the group
            let fullyCompleted = true;
            let statusContent = "";
            statusContent += `
                <div class="status-header">
                    <div>Student</div>
                    <div>Status</div>
                    <div>Score</div>
                    <div>Time Taken</div>
                </div>
            `;
            for(let i = 0; i < assignment.member_assignment.length; i++) {
                let status = assignment.member_assignment[i];
                statusContent += `
                    <div class="member-assign-status ${status.isCompleted? "link":""}">
                        <div class="member-name">${status.name}</div>
                        
                        ${status.isCompleted == undefined || status.isCompleted == null ? 
                            '<div class="status"><span class="assignment-status uncomplete"><i class="fas fa-times-circle"></i> Not Started</span></div>' : ""}

                        ${status.isCompleted == false ? 
                            '<div class="status"><span class="assignment-status ongoing"><i class="fas fa-minus-circle"></i> In Progress<span></div>' : ""}

                        ${status.isCompleted == true ? 
                            `<div class="status"><span class="assignment-status complete" data-quiz-id="${status._id}"><i class="fas fa-check-circle"></i> Completed</span></div>` : ""}

                        <div class="score">
                            ${
                                status.isCompleted == true?
                                status.score.total.toFixed(1) + "%" :
                                ""
                            }
                        </div>

                        <div class="time_taken">
                            ${
                                status.isCompleted == true?
                                status.time_taken + "s" :
                                ""
                            }
                        </div>
                    </div>
                `
                //display only is members have not fullyCompleted
                fullyCompleted = fullyCompleted 
                    && (assignment.member_assignment[i].isCompleted?
                    assignment.member_assignment[i].isCompleted
                    : false);

            }
            if(!fullyCompleted) {
                content += `
                    <div class="assignment" id="${assignment.skill_id}" data-assignment="${assignment._id}">
                        <div class="assignment-details">
                            <span class="assignment-title">${assignment.title}</span>
                            <small class="assign-by">Assigned By: ${assignment.assigned_by_name}</small>
                            <span class="assign-skill">${assignment.skill_name}</span>
                        </div>
                        <small class="deadline">${displayDate(assignment.deadline)}</small>
                    </div>
                    <div class="toggleContent">
                        ${statusContent}
                    </div>
                `;
            }
            else {
                completedAssignment = `
                <div class="assignment completed" id="${assignment.skill_id}" data-assignment="${assignment._id}" data-quiz-id="${assignment.completed_quiz}">
                    <div class="assignment-details">
                        <span class="assignment-title">${assignment.title}</span>
                        <small class="assign-by">Assigned By: ${assignment.assigned_by_name}</small>
                        <span class="assign-skill">${assignment.skill_name}</span>
                    </div>
                    <small class="deadline">${displayDate(assignment.deadline)}</small>
                </div>
                <div class="toggleContent">
                    ${statusContent}
                </div>
                `;
            }
        }
    });
    if(content != "") assignmentList.innerHTML = content;
    if(completedAssignment && completedAssignment != "") {
        completedList.innerHTML = completedAssignment;
        document.querySelector(".completed-number").textContent = completedList.querySelectorAll(".assignment").length;
    }
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
    
    let result = (date.toDateString() == today.toDateString()) ?
        "Today" :
        date.toDateString()
    return result;
}