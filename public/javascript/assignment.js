
/* WINDOWS EVENT LISTENER */
$(document).ready(function () {
    $(".header").load("rightbar.html", function(){
        document.getElementById("name").innerHTML = getName();
    });
    getAssignmentByUser();
});

/* API CALLS */
function getAssignmentByUser() {
    let userId = decodeToken().sub;

    $.ajax({
        url: `/assignment/user?userId=${userId}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            console.log(data)
            displayAssignments(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

$(document).on("click", ".assignment", function() {
    if(this.classList.contains("completed")) {
        window.location.href = "/viewpastquiz.html?quizId=" + this.dataset.quizId;
    }
    else {
        window.location.href = "/quiz.html?skill=" + this.id + "&assignment=" + this.dataset.assignment;
    }
});

$(document).on("click", ".tag-container", function() {
    let toggle = document.querySelector("#completed-list");
    if(toggle.childElementCount >= 1) {
        toggle.classList.toggle("visible");
        document.querySelector(".arrow").classList.toggle("rotate");
    }
})


/* DISPLAY FUNCTIONS */
function displayAssignments(assignments) {
    let assignmentList = document.querySelector("#assignment-list");
    let completedList = document.querySelector("#completed-list");

    let content = "";
    let completedAssignment = "";
    assignments.forEach(assignment => {
        if(assignment.completed_quiz == false) {
            content += `
                <div class="assignment" id="${assignment.skill_id}" data-assignment="${assignment._id}">
                    <div class="assignment-details">
                        <span class="assignment-title">${assignment.title}</span>
                        <small class="assign-by">Assigned By: ${assignment.assigned_by_name} (${assignment.group_name})</small>
                        <span class="assign-skill">${assignment.skill_name}</span>
                    </div>
                    <small class="deadline">
                        <span>${displayDate(assignment.deadline)}</span>
                        ${isOverdue(assignment.deadline)? "<span class='overdue'>Overdue</span>" : ""}
                    </small>
                </div>
            `;
        }
        else if(assignment.completed_quiz) {
            completedAssignment = `
            <div class="assignment completed" id="${assignment.skill_id}" data-assignment="${assignment._id}" data-quiz-id="${assignment.completed_quiz}">
                <div class="assignment-details">
                    <span class="assignment-title">${assignment.title}</span>
                    <small class="assign-by">Assigned By: ${assignment.assigned_by_name} (${assignment.group_name})</small>
                    <span class="assign-skill">${assignment.skill_name}</span>
                </div>
                <small class="deadline">${displayDate(assignment.deadline)}</small>
            </div>
            `;
        }
    });
    if(content != "") assignmentList.innerHTML = content;
    if(completedAssignment != "") {
        completedList.innerHTML = completedAssignment;
        document.querySelector(".completed-number").textContent = completedList.childElementCount;
    }
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
        "<strong>Today</strong>" :
        date.toDateString()
    return result;
}

function isOverdue(dt) {
    let date = new Date(dt);
    let today = new Date(Date.now());

    let result = (date < today);
    return result;
}