/* EVENT LISTENER */
$(document).ready(function () {
    getLeaderboard();
})

$(document).on("change", ".filter-select", function() {
    getLeaderboard(this.value)
})

/* API CALLS */
function getLeaderboard(scope = "") {
    $.ajax({
        url: '/quiz/leaderboard?scope='+scope,
        method: 'POST',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            displayLeaderboard(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

/* DISPLAY DATA */
function displayLeaderboard(data) {
    let leaderboard = document.querySelector("#leaderboard");
    let top3 = document.querySelector("#top-3");
    // let noresult = $("#noresult");

    // reset ui
    leaderboard.innerHTML = "";
    top3.innerHTML = "";
    // $("#noresult").hide();
    document.getElementById("noresult").style.display = "none";

    var ordinal = "";
    let html = "";

    if (data.length >= 1) {
        for (var i = 0; i < data.length; i++) {
            const { _id, average_score, num_of_quiz, average_time_taken, first_name, last_name, school, grade } = data[i];

            // assign ordinal (st, th, nd) to number
            if ((i + 1) % 10 == 1 && i / 10 != 1) ordinal = "st";
            else if ((i + 1) % 10 == 2) ordinal = "nd";
            else if ((i + 1) % 10 == 3) ordinal = "rd";
            else ordinal = "th";

            // if leaderboard has at least 3 ppl
            if ((i >= 0 && i <= 2) && data.length >= 3) {
                top3.innerHTML += `
                    <div class="top-rank">
                        <span class="top-rank-num">${i + 1}${ordinal}</span>
                        <i class="fas fa-trophy"></i>
                        <span class="top-name">${first_name} ${last_name}</span>
                        <span class="top-grade">Primary ${grade}</span>
                        <span class="top-school">${school}</span>
                        <div class="stats">
                            <div class="top-avg-score"><strong>Avg Score</strong><br> ${average_score.toFixed(1)}</div>
                            <div class="top-num-of-quiz"><strong>Quizzes Done</strong><br> ${num_of_quiz}</div>
                            <div class="top-avg-time"><strong>Avg Time</strong><br> ${average_time_taken.toFixed(2)}</div>
                        </div>
                    </div>
                `;
            }
            else {
                html += `
                    <div class="student-row row d-flex align-items-center">
                        <span class="col-4 student-rank">
                            <span class="rank">${i + 1}${ordinal}</span>
                            <span class="name"> ${first_name} ${last_name}</span>
                        </span>
                        <span class="grade col-1">${grade}</span>
                        <span class="school col-2">${school}</span>
                        <span class="average-score col-2">${average_score.toFixed(1)}</span>
                        <span class="num-of-quiz col-1">${num_of_quiz}</span>
                        <span class="average-time-taken col-2">${average_time_taken.toFixed(2)}</span>
                    </div>
                `
            }
        }

        leaderboard.innerHTML = html;

        // add table heading of table not empty
        if (html != "") {
            $("#leaderboard").prepend(`
                <div class="heading row">
                    <span class="name col-4">Name</span>
                    <span class="grade col-1">Grade</span>
                    <span class="school col-2">School</span>
                    <span class="average-score col-2">Average Score</span>
                    <span class="num-of-quiz col-1">Quizzes Done</span>
                    <span class="average-time-taken col-2">Average Time</span>
                </div>
                `);
        }
    }
    else {
        document.getElementById("noresult").style.display = "flex";
    }
}