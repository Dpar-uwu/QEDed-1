$(document).ready(function(){
    if(window.location.toString().includes("stats")){
        $(".header").load("rightbar.html", function(){
            document.getElementById("name").innerHTML = getName();
        })
        createCanvas('container');
        filter('-',null);
        updateStats("");
        $('#filter').prepend('<li class="select page-item small active" value="none_-"><a class="page-link">Overall</a></li>')
    }
})

$(document).on("click", '.select' ,function(){
        var value = ($(this).attr("value")).split('_');
        if(value[1] != 'c' && value != '-') $(this).nextAll().remove();
        
        $( "li" ).removeClass( "active" );
        $(this).addClass("active");

        filter(value[1], value[0]);
})

function filter(id, value){
    var path = '', head = '', notes = [], next;
    switch(id){
        case '-': head = 'Primary '; next = 'a'; break;
        case 'a': path += `&level=${value}`; next = 'b'; break;
        case 'b': path += `&topic=${value}`; next = 'c'; break;
    }
    if(id != 'c'){
        getStatsAjax('quiz', `filter?user=${getUserId()}` + path , 'GET')
        .then(function (data) {
            for(let i=0; i<data.length; i++){
                notes.push({
                    "id": data[i],
                    "display": head + data[i]
                })
            }
            addSelect(notes, next);
        })
    }
    else{
        path = `&skill=${value}`
    }
    updateStats(path);
}

function addSelect(notes, next){
    var content ="";//=`<ul class="pagination mb-1 ps-3">`;
    for(let i=0; i<notes.length; i++){
        content +=`<li class="select page-item small" value="${notes[i].id}_${next}"><a class="page-link">${notes[i].display}</a></li>`;
    }
    document.getElementById('filter').insertAdjacentHTML('beforeEnd', content + '</ul>')
}

function updateStats(path){
    var userId = getUserId();
    // if($('#div').children().find('div').length == 0) createCanvas(id);
    // .then(function(){
    //     return
    // })
    getStatsAjax('quiz', `user?userId=${userId}`, "GET")
    .then(function(data){
        if(data.length != 0){
            var url = `benchmark?user=${userId}`;
            if(path != "") url += path;

            return getStatsAjax('quiz', url, 'POST');
        } 
        else{
            $('#filter').children().remove();
            document.getElementById("container").innerHTML =
            `<div class="text-center mt-5">
            <div><i class = "fa-5x fas fa-chart-bar" style="color: #EF798A; text-shadow: 2px 2px purple ;"></i></div>
            <div>Do a quiz to unlock!</div>
            </div>
            ` 
            throw new Error('Break');
        }
    })
    .then(function(datasets){
        var keyArray = ['total_average_score','average_time_taken', 'easy_average_score','medium_average_score','difficult_average_score']
        for(let i = 0; i<5; i++){
            var data = []; var key = keyArray[i];
            ('current' in datasets) ? data.push(datasets.current[key]) : data.push(0);
            ('global' in datasets) ? data.push(datasets.global[key]) : data.push(0);
            ('recent' in datasets) ? data.push(datasets.recent[key]) : data.push(0);
            displayChart(data, i);
        }
    })
    .catch(function(error){
        console.log(error);
    })
}
function createCanvas(id){
    // return new Promise(function (resolve, reject){
        var container = document.getElementById(id), title = ['Score','Time Taken', 'Easy Score', 'Medium Score', 'Hard Score'];
        container.innerHTML = "";
        container.classList.add("row");
        
        for(var i = 0; i<5; i++){
            (i < 2) ?  classname = 'col-5' : classname = 'col-4';
            container.innerHTML += `
                <div class='${classname} mt-3'>
                    <h6 class="text-center">${title[i]}</h6>
                    <canvas id="chart${i}" class="myChart"></canvas>
                </div>
                `
        }
    //     resolve();
    // })
}
function getStatsAjax(main, path, type){
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: `${main}/${path}`,
            type: type,
            dataType: 'JSON',
            success: function(data, textStatus, xhr) {
               resolve(data);
            },
            error: function(xhr, textStatus, errorThrown){
                console.log("ERROR!"+ JSON.stringify(xhr));
                
            }
        });
    })
}

function displayChart(data, id){
    let exists = false, chart;

    Chart.helpers.each(Chart.instances, function(instance){
        if(instance.canvas.id == 'chart' + id){
            exists = true;
            chart = instance
        }
    })
    if(!exists){
        chart = new Chart(document.getElementById(`chart${id}`).getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Latest', 'Global Avg', 'Last 10 Avg'],
                datasets:[{
                    //Input data here
                    // data: data,
                    backgroundColor: [
                        '#EF798A', //Colour here
                        '#98C5FF',
                        '#FFCB45'
                    ],
                    //Adjust bar width here
                    barPercentage: 0.5,
    
                }],
            },
            options: {
                //Remove legend
                plugins:{   
                    legend: {
                        display: false
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            //Remove grid lines
                            drawOnChartArea: false
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            //Y axis starts at zero
                            beginAtZero: true
                        },
                        gridLines: {
                            //Remove grid lines
                            drawOnChartArea: false
                        } 
                    }]
                },
    
            }
        })
    }
    chart.data.datasets[0].data = data
    chart.update();
}
