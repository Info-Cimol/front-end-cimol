let btn = document.getElementById("btn-login");

let db = openDatabase('mydb', '1.0', 'saveUserInfos', 2 * 1024 * 1024);
if (!db){
    console.log("Erro no DB")
}else{
    console.log(db)
}
db.transaction(function (tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS userInfos (token TEXT,email TEXT,name TEXT, profile TEXT)');
});
btn.onclick = async (e) => {
    let email = document.getElementById("input-email").value;
    let passwd = document.getElementById("input-passwd").value;

    let hashPasswd = await md5(passwd)

    let myInit = {
        method: 'POST',
        mode: 'cors',
        cache: 'default',
        body: JSON.stringify({
            'email': email,
            'senha': hashPasswd
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }

    let response = await fetch("http://127.0.0.1:3000/user/login/", myInit)
    response = await response.json()

    $("#modal").modal("show")
    const app = new Vue({
        el: '#modal-body',
        data: response,
    })

    const appF = new Vue({
        el: ".modal-footer",
        methods: {
            async selectProfile(){
                let profile
                let alunoCh = $("#aluno-checkbox").is(":checked");
                let profCh = $("#professor-checkbox").is(":checked");
                let adminCh = $("#admin-checkbox").is(":checked");

                if (alunoCh == true) {
                    profile = "Aluno";
                }else if (profCh == true) {
                    profile = "Professor";
                }else if (adminCh == true) {
                    profile = "Administrator";
                }

                db.transaction((tx) => {
                    tx.executeSql(`SELECT * FROM userInfos WHERE email = ?`,

                    [response.user.email],

                    function(tx,result){//FUNÇÃO EXECUTADA CASO O SELECT SEJA CONCLUIDO SEM ERRO
                        if (result.rows.length === 1){
                            let userInfos = result.rows[0];

                            if (userInfos.profile != profile){

                                tx.executeSql("UPDATE userInfos SET profile = ? WHERE email = ?",//ATUALIZA A COLUNA profile PARA O NOVO PERFIL

                                    [profile,response.user.email],null, //FUNÇÃO DE CONCLUSÃO COM SUCESSO[INUTIL]

                                    function(tx,error){ //FUNÇÃO EXECUTADA CASO O UPDATE SEJA CONCLUIDO COM ERRO
                                        console.log(error)
                                    }
                                )

                            }
                        }else{
                            tx.executeSql("INSERT INTO userInfos (token, email, name, profile) VALUES(?,?,?,?)",//ADICIONAR UM ROW AO DB
                                [response.token, response.user.email, response.user.name,profile]
                            )
                        }
                    },
                    function(tx,error){//FUNÇÃO EXECUTADA CASO O SELECT SEJA CONCLUIDO COM ERRO
                        console.log(error)
                    })
                })

                $("#modal").modal("hide");
            }
        }
    })

    e.preventDefault();
}

//RETORNA TODOS OS ROWS DO BANCO DE DADOS
/*function getSQL(){
    db.transaction(async function(tx){
        let kk = await tx.executeSql("SELECT * FROM userInfos",[],(tx,res)=>{console.log(res.rows)});
    })
}*/
