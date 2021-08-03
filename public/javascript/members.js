const urlSearchParams = new URLSearchParams(window.location.search);
let groupId = urlSearchParams.get("groupId");

/* EVENT LISTENERS */
$(document).ready(function () {
    getGroupById();
    getGroupMembers();
});


// on click on leave group button
$(document).on("click", "#leaveGroup", function() {
    let userId = decodeToken().sub;
    removeMemberFromGroup(groupId, userId, () => {
        window.location.href = "/group.html";
    });
});

// search user by mail input
$(document).on("keyup", "#group_name", function() {
    document.querySelector("#check-icon").style.display = "block";
});

// on click check icon update group_name
$(document).on("click", "#check-icon", function() {
    let group_name = document.querySelector("#group_name").value;
    updateGroupName(groupId, group_name);
});

// toggle result popover on focus
$(document).on("focusin", "#add-members", function() {
    searchUserEmail();
    $(".popover_content").toggleClass("display_popover");
});
$(document).on("focusout", "#add-members", function() {
    $(".popover_content").toggleClass("display_popover");
});

// search user by mail input
$(document).on("keyup", "#add-members", function() {
    searchUserEmail();
});

// add user to member list
$(document).on("click", ".result", function() {
    const id = this.id;
    const name = this.children[0].innerHTML;
    const email = this.children[1].innerHTML;
    addMemberToGroup(groupId, id, name, email);
});

// remove user on click dropdown
$(document).on("click", "#rm-member", function() {
    let userId = (this.closest(".list-member").id).split("added-")[1];
    removeMemberFromGroup(groupId, userId, () => {
        this.closest(".list-member").remove();
    });
});
// make user an admin on click dropdown item
$(document).on("click", "#mk-admin", function() {
    let userId = (this.closest(".list-member").id).split("added-")[1];
    makeGroupAdmin(groupId, userId, this.closest(".list-member"));
});
// remove user an admin on click dropdown item
$(document).on("click", "#rm-admin", function() {
    let userId = (this.closest(".list-member").id).split("added-")[1];
    rmGroupAdmin(groupId, userId, this.closest(".list-member"));
});
// delete group
$(document).on("click", "#delGroup", function() {
    deleteGroup(groupId);
});





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

function searchUserEmail() {
    var q =  document.querySelector("#add-members").value;

    $.ajax({
        url: `/user/search?query=${q}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            displaySearchResult(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function addMemberToGroup(groupId, id, name, email) {
    $.ajax({
        url: `/group/addMember?groupId=${groupId}&userId=${id}`,
        method: "POST",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            displayAdded(id, name, email);
            let adddedList = document.querySelector("#added-list");
            adddedList.scrollTo(0, adddedList.scrollHeight);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            document.querySelector("#error").innerHTML = xhr.responseJSON.error;
        }
    });
}

function removeMemberFromGroup(groupId, userId, successCallback) {
    $.ajax({
        url: `/group/removeMember?groupId=${groupId}&userId=${userId}`,
        type: "DELETE",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            let myId = decodeToken().sub;
            if(myId == userId) {
                window.location.href = "/group.html";
            }
            else {
                successCallback();
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            document.querySelector("#error").innerHTML = xhr.responseJSON.error;
        }
    });
}

function makeGroupAdmin(groupId, userId, parentElement) {
    $.ajax({
        url: `/group/makeAdmin?groupId=${groupId}&userId=${userId}`,
        type: "PUT",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            displayAdminTag(parentElement);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            document.querySelector("#error").innerHTML = xhr.responseJSON.error;
        }
    });
}

function rmGroupAdmin(groupId, userId, parentElement) {
    $.ajax({
        url: `/group/dismissAdmin?groupId=${groupId}&userId=${userId}`,
        type: "PUT",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            let myId = decodeToken().sub;
            if(myId == userId) {
                window.location.href = "/group_members.html?groupId="+groupId;
            }
            else {
                hideAdminTag(parentElement);
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            document.querySelector("#error").innerHTML = xhr.responseJSON.error;
        }
    });
}

function deleteGroup(groupId) {
    $.ajax({
        url: `/group/${groupId}`,
        type: "DELETE",
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            window.location.href = "/group.html";
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            document.querySelector("#error").innerHTML = xhr.responseJSON.error;
        }
    });
}

function updateGroupName(groupId, groupName) {
    $.ajax({
        url: `/group?groupId=${groupId}`,
        type: "PUT",
        data: JSON.stringify({
            "group_name": groupName
        }),
        dataType: 'JSON',
        contentType: "application/json",
        success: function (data, textStatus, xhr) {
            
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            document.querySelector("#error").innerHTML = xhr.responseJSON.error;
        }
    });
}


/* DISPLAY DATA */
function displayGroup(data) {
    document.querySelector(".title").textContent = data.group_name;

    // display group name on modal
    document.querySelector("#group_name").value = data.group_name;

    // display edit button if group admin
    let decoded = decodeToken();
    let memberIndex = data.members.findIndex(member => {
        return member.user_id == decoded.sub
    });
    
    let isGrpAdmin;
    if(memberIndex != -1)
        isGrpAdmin = data.members[memberIndex].is_admin;

    let isGrpOwner = (data.owner == decoded.sub);

    if(isGrpAdmin || isGrpOwner) {
        $(".rightbar").prepend(`
            <div id="edit-btn" data-bs-toggle="modal" data-bs-target="#addGroupModal">
                <i class="fas fa-pen"></i>
            </div>
        `);
    }
    if(isGrpOwner) {
        console.log(isGrpOwner)
        document.querySelector("#leaveGrpToggle").style.display = "none";
    }
}


function displayMembers(data) {
    // main page
    let ownerList = document.querySelector("#owner");
    let educatorList = document.querySelector("#educator");
    let studentList = document.querySelector("#student");

    // modal page
    let addedList = document.querySelector("#added-list");
    let group_owner = document.querySelector("#group_owner");

    // display owner
    ownerList.innerHTML += `
        <div class="member" id="${data.owner._id}">
            <span class="member-name">${data.owner.first_name} ${data.owner.last_name}</span>
        </div>
    `;

    // display owneer in modal
    group_owner.value = data.owner.first_name + " " + data.owner.last_name


    // display members
    if(data.members && data.members.length >= 1) {
        data.members.forEach(member => {
            if(member.role == "student") {
                studentList.innerHTML += `
                    <div class="member" id="${member.user_id}">
                        <span class="member-name">${member.user_name}</span>
                        ${member.is_admin? '<span class="admin-tag">Admin</span>' : ""}
                    </div>
                `;
            } else {
                educatorList.innerHTML += `
                    <div class="member" id="${member.user_id}">
                        <span class="member-name">${member.user_name}</span>
                        ${member.is_admin? '<span class="admin-tag">Admin</span>' : ""}
                    </div>
                `;
            }

            // display members in modal
            addedList.innerHTML += `
                <div class="list-member" id="added-${member.user_id}">
                    <div class="member-details">
                        <span class="added-name">${member.user_name}</span>
                        <span class="added-email">${member.email}</span>
                        <span class="added-role">${member.role}</span>
                    </div>
                    <div class="is_admin">
                        ${member.is_admin? '<span class="admin-tag-modal">Admin</span>' : ""}
                    </div>
                    <div class="edit-member" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class="fas fa-ellipsis-v"></span>
                    </div>
                    <ul class="dropdown-menu">
                    ${member.is_admin? 
                        '<li class="dropdown-item" id="rm-admin">Remove Admin</li>' :
                        '<li class="dropdown-item" id="mk-admin">Make Admin</li>' }
                        <li class="dropdown-item" id="rm-member">Remove Member</li>
                    </ul>
                </div>
            `;
        });
    }

    // display count (minus 1 to exclude header)
    document.querySelector("#educator-count").innerHTML = document.querySelector("#educator").children.length - 1 + " educators";
    document.querySelector("#student-count").innerHTML = document.querySelector("#student").children.length - 1 + " students";
}


function displaySearchResult(data) {
    let searchList = document.querySelector("#search-list");
    let content = "";

    if(data.length < 1 ) {
        content += `
            <div class="text-center p-2"><small>No result</small></div>
        `;
    }
    else {
        data.forEach(result => {
            content += `
                <div class="result" id="${result._id}">
                    <span class="member-name">${result.first_name} ${result.last_name}</span>
                    <span class="email">${result.email}</span>
                </div>
            `;
            // <span class="role">${result.role}</span>
        });
    }

    searchList.innerHTML = content;
}

function displayAdded(id, name, email) {
    var addedList = document.querySelector("#added-list");
    var children = Array.from(addedList.children); //convert children to array

    // check if user exists in members list
    var userExists = children.find(addedMember => {
        return addedMember.id.split("added-")[1] == id;
    });

    // add to members list if user is not already in it
    if(!userExists) {
        addedList.innerHTML += `
        <div class="list-member" id="added-${id}">
            <div class="member-details">
                <span class="added-name">${name}</span>
                <span class="added-email">${email}</span>
            </div>
            <div class="edit-member" data-bs-toggle="dropdown" aria-expanded="false">
                <span class="fas fa-ellipsis-v"></span>
            </div>
            <ul class="dropdown-menu">
                <li class="dropdown-item" id="mk-admin">Make Admin</li>
                <li class="dropdown-item" id="rm-member">Remove Member</li>
            </ul>
        </div>
        `;
    }
}

function displayAdminTag(parentElement) {
    let adminTag = parentElement.querySelector(".is_admin");
    let mkAdmin = parentElement.querySelector("#mk-admin");
    let dropdown = parentElement.querySelector(".dropdown-menu");

    adminTag.innerHTML = `
        <span class="admin-tag-modal">Admin</span>
    `;
    mkAdmin.remove();
    
    let li = document.createElement("li");
    li.id = "rm-admin";
    li.classList.add("dropdown-item");
    li.innerHTML = "Remove Admin"
    dropdown.prepend(li);
}

function hideAdminTag(parentElement) {
    let adminTag = parentElement.querySelector(".is_admin");
    let rmAdmin = parentElement.querySelector("#rm-admin");
    let dropdown = parentElement.querySelector(".dropdown-menu");

    adminTag.innerHTML = '';
    rmAdmin.remove();

    let li = document.createElement("li");
    li.id = "mk-admin";
    li.classList.add("dropdown-item");
    li.innerHTML = "Make Admin"
    dropdown.prepend(li);
}


/* MISC FUNCTIONS */
function decodeToken() {
    const token = localStorage.getItem('token');
    if(!token || token == "") window.location.href="/login.html";
    
    let base64Url = token.split('.')[1]; // token you get
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    let decodedData = JSON.parse(window.atob(base64));
    
    

    return decodedData;
}