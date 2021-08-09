const navItems = [
    {
        name: "Overview",
        link: "overview.html",
        icon: "fas fa-home",
        access: ["parent", "teacher", "student"]
    },
    {
        name: "Quiz Control Panel",
        link: "control.html",
        icon: "fas fa-cog",
        access: ["admin"]
    },
    {
        name: "Quiz",
        link: "quiz.html",
        icon: "fas fa-atom",
        access: ["student"]
    },
    {
        name: "Assignments",
        link: "assignment.html",
        icon: "far fa-clipboard",
        access: ["student"]
    },
    {
        name: "My Groups",
        link: "group.html",
        icon: "fas fa-users",
        access: ["parent", "teacher", "student"]
    },
    {
        name: "My Statistics",
        link: "stats.html",
        icon: "fas fa-chart-bar",
        access: ["student"]
    },
    {
        name: "Leaderboard",
        link: "leaderboard.html",
        icon: "fas fa-award",
        access: ["parent", "teacher", "student", "admin"]
    },
    {
        name: "Learning Resources",
        link: ".html",
        icon: "far fa-newspaper",
        access: ["student"]
    },
    {
        name: "Assign Quiz",
        link: "assign.html",
        icon: "fas fa-folder",
        access: ["parent", "teacher"]
    },
]

/* EVENT LISTENER */
$(document).ready(function () {
    if(!window.location.toString().includes("quiz.html?skill")){
        $(".sidebar").load("sidebar.html", function () {
            sidebar();
        });
    }
})

//Displaying sidebar
function sidebar() {
    let role = decodeToken().issuedRole;

    for (let i = 0; i < navItems.length; i++) {
        if (navItems[i].access.includes(role)) {
            let content =
                `<div class="nav-item align-self-center">
                    <a 
                        href="${navItems[i].link}"
                        class="nav-link align-middle px-0"
                        data-bs-toggle="tooltip"
                        data-bs-placement="right"
                        title="${navItems[i].name}"
                        >
                        <i class="${navItems[i].icon}"></i><span class="ms-1 d-none d-sm-inline">${navItems[i].name}</span>
                    </a>
                </div> 
                `;
            document.getElementById("sidebar").innerHTML += content;
        }
    }
}
/* API CALLS */
$(document).on("click", "#logoutBtn", function () { 
    $.ajax({
        url: '/user/logout',
        method: 'POST',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            //Clearing token and userinfo
            localStorage.clear(); 
            //Redirect to login
            location.href = 'login.html';
        },
        error: function (xhr, textStatus, errorThrown) {
            alert("YOU HAVE BEEN PROHIBITED TO LEAVE!");
        }
    });
})

//Decoding JWT
function decodeToken() {
    const token = localStorage.getItem('token');

    let base64Url = token.split('.')[1]; // token you get
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    let decodedData = JSON.parse(window.atob(base64));

    return decodedData;
}

function getUserFromDatabase() {
    let id = (decodeToken()).sub;
    $.ajax({
        url: `/user/${id}`,
        method: 'GET',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            localStorage.setItem('userInfo', JSON.stringify(data));
        },
        error: function (xhr, textStatus, errorThrown) {
            window.location.href = "./login.html";
        }
    });
}

function getName() {
    return JSON.parse(localStorage.getItem('userInfo')).first_name;
}

function getUserId() {
    return JSON.parse(localStorage.getItem('userInfo'))._id;
}

