var navItems = [
    {
        name : "Overview",
        link : "overview.html",
        icon : "fas fa-home",
        access : ["parent","student"]
    },
    {
        name : "Quiz",
        link : "quiz.html",
        icon : "fas fa-question",
        access : ["student"]
    },
    {
        name : "Assignments",
        link : "assignment.html",
        icon : "far fa-clipboard",
        access : ["student"]
    },
    {
        name : "My Groups",
        link : "group.html",
        icon : "fas fa-users",
        access : ["parent","student"]
    },
    {
        name : "My Statistics",
        link : "stats.html",
        icon : "fas fa-chart-bar",
        access : ["student"]
    },
    {
        name : "Leaderboard",
        link : "leaderboard.html",
        icon : "fas fa-award",
        access : ["student"]
    },
    {
        name : "Learning Resources",
        link : "stats.html",
        icon : "far fa-newspaper",
        access : ["student"]
    },
    {
        name : "Assign Quiz",
        link : "assign.html",
        icon : "fas fa-folder",
        access : ["parent"]
    },
]

$(document).ready(function(){
    $(".sidebar").load("sidebar.html",function(){
        sidebar();
    });
})

function sidebar(){
    const role = decodeToken().issuedRole;

    for(var i = 0; i<navItems.length; i++){
        if(navItems[i].access.includes(role)){ 
            var content = 
            `
            <div class="nav-item align-self-center">
                <a href="${navItems[i].link}" class="nav-link align-middle px-0">
                    <i class="${navItems[i].icon}"></i><span class="ms-1 d-none d-sm-inline">${navItems[i].name}</span>
                </a>
            </div> 
            `
            document.getElementById("sidebar").innerHTML += content;
        }
    }
}

function decodeToken(){
    const token = localStorage.getItem('token');

    let base64Url = token.split('.')[1]; // token you get
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    let decodedData = JSON.parse(window.atob(base64));

    return decodedData;
}

function getName(){
    return JSON.parse(localStorage.getItem('userInfo')).first_name;
}