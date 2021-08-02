
$(document).ready(function(){
    $("#navigation").load("groupnav.html", function() {
        var urlSearchParams = new URLSearchParams(window.location.search);
        var groupId = urlSearchParams.get("groupId");
        
        document.querySelectorAll(".nav-a").forEach(navElement => {
            if(window.location.pathname == navElement.pathname) {
                navElement.classList.add("active");
            }
            navElement.href += "?groupId="+groupId;
        });
    });
});
