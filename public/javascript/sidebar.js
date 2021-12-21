const navItems = [
    {
        name: "Overview",
        link: "overview.html",
        icon: "fas fa-home",
        access: ["student"]
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
        link: "learningresourceslevel.html",
        icon: "far fa-newspaper",
        access: ["student", "teacher", "parent"]
    }
]

/* EVENT LISTENER */
$(document).ready(function () {
    if (!window.location.toString().includes("quiz.html?skill")) {
        $('head').append('<link rel="stylesheet" type="text/css" href="./css/sidebar.css">');
        $(".sidebar").load("sidebar.html", function () {
            sidebar();
        });
    }

    header();
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
                        class="nav-link align-middle px-3 px-lg-4 sidenav-link text-center text-sm-start ${window.location.pathname.split("/")[1] == navItems[i].link ? 'active-tab' : ''}"
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


// header
//notification ish
// using $x as the jQuery object for version 1.7.2
function header() {
    let panel = $('#accountPanel'),
        button = $('#accountButton');
        console.log(button.append("hi"))

    $(button).click(function (e) {
        alert("clicked")
        e.preventDefault();

        $(panel).toggleClass('on');

        // change ARIA elements based on state
        if ($(panel).hasClass('on')) {
            $(button).attr('aria-expanded', 'true');
            $(panel).attr('aria-hidden', 'false');
        } else {
            $(button).attr('aria-expanded', 'false');
            $(panel).attr('aria-hidden', 'true');
        }
    });

    $('.context a').click(function () {
        $('.select').removeClass('selected');
        $(this).closest('li').find('span').toggleClass('selected');
    });

    $(document).mouseup(function (e) {
        // close panel when you click anywhere outside the panel

        // check for IE9
        if (navigator.appVersion.indexOf("MSIE 9.") != -1) {

            document.onclick = function (e) {
                if (e.target.id !== panel) {
                    panel.style.display = 'none';
                }
            };

        } else {

            if (!$(button).is(e.target) && !panel.is(e.target) && panel.has(e.target).length === 0) {
                panel.removeClass('on');
            }

        }
    })
}