document.addEventListener("DOMContentLoaded", function() {
    //console.log("DOMContentLoaded!")
    const form = document.getElementById("login-form")
    const user_field = document.getElementById("username")
    const pw_field = document.getElementById("pw")

    form.addEventListener("submit", function (event) {
        event.preventDefault()
        login(user_field.value, pw_field.value)
    })
})

const login = (user, pw) => {

    let data = JSON.stringify({user: user, pw: pw})

    fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    })
        .then(response => response.json())
        .then(data => {
            let code = data.code;

            switch (code) {
                case -1:
                    console.log("ur bad lol");
                    break;
                case 0:
                    sessionStorage.setItem('user',user);
                    sessionStorage.setItem('pw',pw)
                    window.location.href = '/itemlog';
                    break;
                case 1:
                    sessionStorage.setItem('user',user);
                    sessionStorage.setItem('pw',pw)
                    window.location.href = '/admin';
                    break;
            }
        })
        .catch(error => console.error("Error:", error));
}