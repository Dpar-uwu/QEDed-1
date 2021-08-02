const audioObj = new Audio("/sound/bounce.mp3");
audioObj.volume = 0.5;
let socket = null;
var urlSearchParams = new URLSearchParams(window.location.search);
var groupId = urlSearchParams.get("groupId");

let userInfo = JSON.parse(localStorage.getItem("userInfo"));

/* WINDOWS EVENT LISTENER */
$(document).ready(function () {
    getGroupById();
    socket = initWebSocket();

    $("#input-submit").click(function () {
        sendAnnoucement(socket);
    })

    $("#input-msg").focus();

    $("#input-msg").on("keydown", function (event) {
        listenForEnter(event);
    });

    $("#closeConnection").on("click", function(event) {
        window.location.href = "/overview.html";
    })

    $("#retryConnection").on("click", function(event) {
        initWebSocket();
        getGroupById();
    })
});




/* API CALLS */
function getGroupById() {
    if (!groupId) window.location.href = "group.html";

    $.ajax({
        url: `/group/${groupId}`,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            console.log(data)
            displayGroup(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            window.location.href = "/404.html";
        }
    });
}



/* WEBSOCKET */
let countReconn = 0;
function initWebSocket() {
    // Create WebSocket connection.
    let ws = new WebSocket('ws://' + window.location.host);

    // Connection opened
    ws.onopen = function (event) {
        let userId = decodeToken().sub;
        let data = {
            action: "join",
            group_id: groupId,
            user_id: userId
        }
        socket.send(JSON.stringify(data));
        console.log("Sent request to join group", data);
        countReconn = 0;
    };

    ws.onerror = function (event) {
        console.log("Socket Connection Error");
        ws.close();
    };

    // Listen for messages
    ws.onmessage = function (event) {
        console.log('Message from server:', event.data);
        let message = JSON.parse(event.data);
        switch(message.action) {
            case "message": {
                displayMessage(message.post, message.sender_name);
                break;
            }
            case "duplicate member": { // if user creates another annoucements tab
                console.log("Closing connection due to multiple windows")
                var myModal = new bootstrap.Modal(document.getElementById('errorModal'), {
                    backdrop: 'static',
                    keyboard: false
                  })
                myModal.show();
                break;
            }
        }
        
    };

    // Handle Connection Close
    ws.onclose = function (event) {
        console.log("Connection closed, reconnecting..");

        if (countReconn > 3) {
            // alert("Could not connect after"+ countReconn+ "tries");
            document.querySelector("#input-msg").disabled = true;
            document.querySelector("#conn-err").style.display = "block";
            let userId = decodeToken().sub;
            let data = {
                action: "leave",
                group_id: groupId,
                user_id: userId
            }
            socket.send(JSON.stringify(data));
        }
        else {
            setTimeout(function () {
                countReconn++;
                socket = initWebSocket();
            }, 6000);
        }
    };

    return ws;
}


/* DISPLAY DATA */
function displayGroup(data) {
    document.querySelector(".title").textContent = data.group_name;
    
    if (data.posts && data.posts.length >= 1) {
        displayAllMessage(data.posts);
    }
}

function displayAllMessage(messages) {
    const announcementList = document.querySelector("#announcement-list");
    let userId = decodeToken().sub;
    var listDisplay = "";
    let attribute = "others";
    let tempDate;
    messages.forEach(msg => {
        if (!jQuery.isEmptyObject(msg)) {
            let newDate = new Date(msg.created_at);
            if (tempDate == undefined || differentDay(tempDate, newDate)) {
                listDisplay += `
                <div class="text-row">
                    <div class="date">
                        <span>${newDate.getDate()} ${newDate.toLocaleString('default', { month: 'long' })}</span>
                    </div>
                </div>
                `;
            }
            tempDate = newDate;
            (msg.made_by == userId) ? attribute = "own" : attribute = "others";
            listDisplay += `
                <div class="text-row ${attribute}">
                    <div class="text">
                        <div class="sender_name"> 
                            ${attribute == "own" ? "" : msg.sender_name}
                        </div>
                        ${msg.content}
                        <div class="text-time">
                            ${displayTime(msg.created_at)}
                        </div>
                    </div>
                </div>
            `;
        }
    });
    if (listDisplay != "") {
        announcementList.innerHTML = listDisplay;
    }
    announcementList.scrollTo(0, announcementList.scrollHeight);
}

function displayMessage(msg, sender_name = "") {
    const noresult = $("#noresult");
    if (noresult) noresult.remove();

    let userId = decodeToken().sub;

    // check if text is user's
    let attribute = "others";
    (msg.made_by == userId) ? attribute = "own" : attribute = "others";
    const announcementList = document.querySelector("#announcement-list");
    announcementList.innerHTML += `
        <div class="text-row ${attribute}">
            <div class="text">
                <div class="sender_name"> 
                    ${attribute == "own" ? "" : sender_name}
                </div>
                ${msg.content}
                <div class="text-time">
                    ${displayTime(msg.created_at)}
                </div>
            </div>
        </div>
    `;

    announcementList.scrollTo(0, announcementList.scrollHeight);
    playSound();
}

function sendAnnoucement(socket) {
    const input = $("#input-msg");
    let date = new Date();


    if (input.val() != "") {
        let userId = decodeToken().sub;
        let data = {
            action: "message",
            sender_name: userInfo.first_name + " " + userInfo.last_name,
            group_id: groupId,
            post: {
                made_by: userId,
                content: input.val(),
                created_at: date.toISOString()
            }
        };
        // displayMessage(data.post);
        socket.send(JSON.stringify(data));

        // clear input and focus
        input.val("");
        input.focus();
    }
}

function listenForEnter(event) {
    if (event.keyCode === 13) {
        if (!event.shiftKey) {
            $("#input-submit").click(); // Trigger the button element with a click
            event.preventDefault();// Cancel the default action
            return false;// Cancel the default action
        }
    }
}

/* SOUND OUTPUT */
function playSound() {
    audioObj.play();
}

/* MISC FUNCTIONS */
function decodeToken() {
    const token = localStorage.getItem('token');

    let base64Url = token.split('.')[1]; // token you get
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    let decodedData = JSON.parse(window.atob(base64));

    return decodedData;
}

// takes in datetime & display 24h time
function displayTime(dt) {
    let time = new Date(dt);
    let hStr = ((time.getHours() < 10) ? "0" : "") + time.getHours();
    let mStr = ((time.getMinutes() < 10) ? "0" : "") + time.getMinutes();

    return hStr + ":" + mStr;
}

function differentDay(d1, d2) {
    return d1.getDate() !== d2.getDate() ||
        d1.getMonth() !== d2.getMonth() ||
        d1.getFullYear() !== d2.getFullYear();
}