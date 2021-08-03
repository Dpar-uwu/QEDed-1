
/* EVENT LISTENER */
$(document).ready(function () {
    getGroupsByUser();
});

$(document).on("focusin", "#add-members", function() {
    searchUserEmail();
    $(".popover_content").toggleClass("display_popover");
});
$(document).on("focusout", "#add-members", function() {
    $(".popover_content").toggleClass("display_popover");
});

$(document).on("keyup", "#add-members", function() {
    searchUserEmail();
});

// MODAL
// add user to member list
$(document).on("click", ".result", function() {
    const id = this.id;
    const name = this.children[0].innerHTML;
    const email = this.children[1].innerHTML;
    displayAdded(id, name, email);
});

// remove member from list 
$(document).on("click", ".remove-member", function() {
    this.parentElement.remove();
});

$(document).on("click", "#addGroup", function() {
    createGroup();
});

// GROUP LISTING
$(document).on("click", ".group", function() {
    const groupId = this.id;
    window.location.href = "/group_announcement.html?groupId="+groupId;
});




/* CALL APIs */
function getGroupsByUser() {
    var userId = JSON.parse(localStorage.getItem("userInfo"))._id;
    
    $.ajax({
        url: `/group/user?userId=${userId}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            console.log(data)
            displayMyGroups(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
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

function createGroup() {
    var group_name =  document.querySelector("#group_name").value;
    var owner = JSON.parse(localStorage.getItem("userInfo"))._id;
    var membersList = Array.from(document.querySelector("#added-list").children);

    var members = [];
    membersList.forEach(memberElement => {
        var id = (memberElement.id).split("added-")[1];
        members.push({user_id: id});
    });

    var data =  {
        group_name,
        owner,
        members
    };
    console.log(data)
    $.ajax({
        url: `/group`,
        method: "POST",
        data: JSON.stringify(data),
        dataType: 'JSON',
        contentType: 'application/json',
        success: function (data, textStatus, xhr) {
            alert("Group Created");
            window.location.href = "";
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}




/* DISPLAY DATA */
function displayMyGroups(data) {
    if(data.length >= 1) {
        var groupList = document.querySelector("#group-list");

        var content = "";
        data.forEach(group => {
            content += `
                <div id="${group._id}" class="group">
                    <div class="group-body">
                        <span class="group_name">${group.group_name}</span><br>
                        <div class="latest-msg-wrapper">
                            <span class="sender_name">
                                ${group.posts && group.posts.sender_name? group.posts.sender_name +": " : ""}
                            </span>
                            <span class="latest_msg">
                                ${group.posts && group.posts.content? group.posts.content : "No Messages"}
                            </span>
                        </div>
                    </div>
                    <span class="group-owner">
                        <span class="group-icon">
                            <i class="fas fa-user-circle"></i>
                        </span>
                        <span class="owner">${group.owner_name}</span>
                    </span>
                </div>
            `;

        });
        groupList.innerHTML = content;
    }
}


function displaySearchResult(data) {
    var searchList = document.querySelector("#search-list");

    var content = "";

    if(data.length < 1 ) {
        content += `
            <div class="text-center p-2"><small>No result</small></div>
        `;
    }
    else {
        data.forEach(result => {
            content += `
                <div class="result" id="${result._id}">
                    <span class="name">${result.first_name} ${result.last_name}</span>
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
            <div class="added-member" id="added-${id}">
                <div class="member-details">
                    <span class="added-name">${name}</span>
                    <span class="added-email">${email}</span>
                </div>
                <div class="remove-member">
                    <span class="fas fa-times"></span>
                </div>
            </div>
        `;
    }
}