
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
    window.location.href = "/quiz.html?skill=" + this.id + "&assignment=" + this.dataset.assignment;
});


/* DISPLAY FUNCTIONS */
function displayAssignments(assignments) {
    let assignmentList = document.querySelector("#assignment-list");

    let content = "";
    assignments.forEach(assignment => {
        if(assignment.completed_quiz == false) {
            content += `
                <div class="assignment" id="${assignment.skill_id}" data-assignment="${assignment._id}">
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