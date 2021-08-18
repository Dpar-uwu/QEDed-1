const protectedRoutes = [
    {
        route: "/control.html",
        role: ["admin"]
    }
]


function decodeToken(){
    const token = localStorage.getItem('token');
    let decodedData = "";

    if(!token) return null;

    let base64Url = token.split('.')[1]; // token you get
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    decodedData = JSON.parse(window.atob(base64));

    return decodedData;
}

// takes in callback which is called after getting new (valid)
// access token using refresh token
function checkAuth(callback = null) {
    console.log("Checking auth...")
    console.log(callback != null)
    let role = ["admin", "student", "teacher", "parent"];
    
    protectedRoutes.forEach(page => {
        if(page.route == window.location.pathname) {
            role = page.role;
        }
    })
    
    try {
        const data = decodeToken();
        if(data == "" || !data) throw new Error("Not Authenticated");
        if(!role.includes(data.issuedRole)) throw new Error("Not Authorized");
        if(data.exp*1000 < new Date()) throw new Error("Token Expired");
        if(callback != null) {
            callback();
        }
    } catch(err) {
        console.log(err)
        if(err.message == "Not Authenticated") {
            window.location.href = "./login.html";
        }
        else if(err.message == "Not Authorized") {
            window.location.href = "./403.html";
        }
        else if(err.message == "Token Expired") {
            $.ajax({
                url: 'http://localhost:3000/user/refresh_token',
                method: 'POST',
                dataType: 'JSON',
                xhrFields: {
                    withCredentials: true
                },
                success: function(data, textStatus, xhr) {
                    localStorage.setItem('token', data.accessToken);
                    console.log("Got new token")
                    if(callback != null) {
                        console.log(callback)
                        callback();
                    }
                },
                error: function(xhr, textStatus, errorThrown){
                    window.location.href = "./login.html";
                }
            });
        }
        else {
            window.location.href = "./login.html";
        }
    }
}

$(document).ready(function(){
    checkAuth();
})