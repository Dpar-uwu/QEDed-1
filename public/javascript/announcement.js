
/* WINDOWS EVENT LISTENER */
$(document).ready(function () {
    // getGroupById(groupId);
    displayGroup({
        group_name: "2 Ruby"
    });

})





/* API CALLS */
function getGroupById(groupId) {
    $.ajax({
        url: `/group/${groupId}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            displayGroup(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}



/* DISPLAY DATA */
function displayGroup(data) {
    $("#navigation").prepend(
        `<li class="nav-item">
            <h2 class="title">${data.group_name}</h2>
        </li>`);

}

