/* EVENT LISTENER */
$(document).ready(function () {
    // getGroupsByUser();


    var sample = [
        {
            group_name: "5 Amethyst",
            _id: "1234567890",
            owner: "Matthew Tay",
            latest_msg: "Hello, we will be reviewing fractions next week"
        },
        {
            group_name: "4 Sapphire",
            _id: "1234567890",
            owner: "Annie Wong",
            latest_msg: "Hello, we will be reviewing fractions next week"
        },
        {
            group_name: "3 Emerald",
            _id: "1234567890",
            owner: "PSLEOnline",
            latest_msg: "Hello, we will be reviewing fractions next week"
        },
        {
            group_name: "6 Topaz",
            _id: "0987654321",
            owner: "Matthew Tay",
            latest_msg: "Hello, we will be reviewing fractions next week"
        },
        // {
        //     group_name: "1 Diamond",
        //     _id: "0987654321",
        //     owner: "Annie Wong",
        //     latest_msg: "Hello, we will be reviewing fractions next week"
        // },
        // {
        //     group_name: "5 Amethyst",
        //     _id: "1234567890",
        //     owner: "Genevieve Wong",
        //     latest_msg: "Hello, we will be reviewing fractions next week"
        // },
        // {
        //     group_name: "4 Sapphire",
        //     _id: "1234567890",
        //     owner: "Genevieve Wong",
        //     latest_msg: "Hello, we will be reviewing fractions next week"
        // },
        // {
        //     group_name: "3 Emerald",
        //     _id: "1234567890",
        //     owner: "Annie Wong",
        //     latest_msg: "Hello, we will be reviewing fractions next week"
        // },
        // {
        //     group_name: "6 Topaz",
        //     _id: "0987654321",
        //     owner: "Emily Tan",
        //     latest_msg: "Hello, we will be reviewing fractions next week"
        // }
    ]

    displayAllGroups(sample);

    // (search) on key press event
    $("#add-members").keyup(function() {
        // console.log(e)
        searchUserEmail();
    })
})

$(document).on("focusin", "#add-members", function() {
    searchUserEmail();
    $(".popover_content").toggleClass("display_popover");
    
})
$(document).on("focusout", "#add-members", function() {
    $(".popover_content").toggleClass("display_popover");
})

// add user to member list
$(document).on("click", ".result", function() {
    const id = this.id;
    const name = this.children[0].innerHTML;
    const email = this.children[1].innerHTML;
    displayAdded(id, name, email);
});

$(document).on("click", ".remove-member", function() {
    this.parentElement.remove();
});


/* CALL APIs */
function getGroupsByUser() {
    var userId = localStorage.getItem("userInfo")._id;

    $.ajax({
        url: `/group/${userId}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            displayAllGroups(data);
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


/* DISPLAY DATA */
function displayAllGroups(data) {
    if(data.length >= 1) {
        var groupList = document.querySelector("#group-list");

        var content = "";
        data.forEach(group => {
            content += `
                <div id="${group._id}" class="group">
                    <div class="group-body">
                        <span class="group_name">${group.group_name}</span><br>
                        <span class="latest_msg">${group.latest_msg}</span>
                    </div>
                    <span class="group-owner">
                        <span class="group-icon">
                            <i class="fas fa-user-circle"></i>
                        </span>
                        <span class="owner">${group.owner}</span>
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