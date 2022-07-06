let btn = document.getElementById("btn-login");

btn.onclick = async (e) => {

    let email = document.getElementById("input-email").value;
    let passwd = document.getElementById("input-passwd").value;

    let myInit = {
        method: "POST",
        mode: "cors",
        cache: "default",
        body: {
            'email': email,
            'senha': passwd
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
    }
    console.log(email,passwd)

    let response = await fetch("http://127.0.0.1:3000/user/login/", myInit)
    console.log(response)

    e.preventDefault();
}
