const db = openDatabase('infos', '1.0', 'infosProfile', 1000000)
db.transaction(
    function(tx)
    {
        tx.executeSql(
            `
                CREATE TABLE IF NOT EXISTS profileInfos 
                (email TEXT,token TEXT,name TEXT,profile TEXT)
            `
        )
    }
)

const loginForm = Vue.component('login-section', 
    {
        template: 
        `
            <section class='section-main' v-if='showLogin == true'>
                <div class='div-title'>
                    <h1 class='section-title'>Conectar-se</h1>
                    <p>Para realizar diversas ações em nossa plataforma você precisa estar conectado a uma conta, realize sua conexão abaixo.</p>
                </div>
                <form class='form-conteiner'>
                    <div class='input-group input-group-lg'>
                        <label for='input-email-lg' class='form-label'>Email</label>
                        <input type='text' id='input-email-lg' class='form-control' placeholder='Email'>
                        <span class='input-group-text' id='basic-addon1'>@</span>
                    </div>
                    <div class='input-group input-group-lg'>
                        <label for='input-senha-lg' class='form-label'>Senha</label>
                        <input type='password' id='input-senha-lg' class='form-control' placeholder='Senha'>
                    </div>
                    <button @click='conect' type='button' class='btn btn-primary btn-lg'>Conectar-se</button>
                </form>
            </section>
        `,
        methods: {
            //81dc9bdb52d04dc20036dbd8313ed055 - 1234
            async conect()
            {
                let vm = this;
                const email = document.getElementById('input-email-lg').value;
                const senha = document.getElementById('input-senha-lg').value;

                const hashSenha = await md5(senha);
                console.log(hashSenha);

                const config = {
                    method: 'POST',
                    mode: 'cors',
                    cache: 'default',
                    body : JSON.stringify(
                        {
                            'email': email,
                            'senha': hashSenha
                        }
                    ),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }

                fetch('http://127.0.0.1:3000/user/login/', config)
                .then(resp => resp.json())
                .then(res => 
                    {
                        let user = {
                            nome: res.user.nome,
                            email: res.user.email,
                            token: res.token,
                            profiles: [],
                        }
                        let text = ['Admin', 'Aluno', 'Professor']
                        
                        for (let i=0; i<text.length; i++)
                        {
                            let field = text[i].toLowerCase();
                            if (res.user[field] == 1)
                            {
                                user.profiles.push(text[i])   
                            }
                        }

                        if (user.profiles.length > 0)
                        {
                            $('#select-profile-modal').modal('show');
                        }else
                        {
                            this.showLogin = false;
                        }

                        this.showLogin = false;
                        eventBus.$emit('submit', user)
                    }
                )
            }
        },
        data()
        {
            return {
                showLogin: true
            }
        }
    }
)

var eventBus = new Vue({})

const selectModal = Vue.component('select-profile',
    {
        template: 
        `
            <div class='modal-body'>          
                <div class='text'>
                    <p>Olá {{ user.nome }}, selecione o usuario que deseja usar.</p>
                </div>
                <div v-for='profile in user.profiles'>
                    <input class='check-modal' type='checkbox' value=''>
                    <label for='check-modal' class='check-label'>{{ profile }}</label>
                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-secondary' data-dismiss='modal'>Cancelar</button>
                    <button type='button' @click='logIn' data-dismiss='modal' class='btn btn-primary'>Confirmar</button>
                </div>
            </div>
        `,
        created(){
            let vm = this;
            eventBus.$on('submit', 
                function(user)
                {
                    if (user)
                    {
                        vm.user = user;
                    }
                }
            )
        },
        methods: {
            async logIn()
            {
                let vm = this;
                let profile = '';

                let inputs = document.querySelectorAll('input');
                let labels = document.querySelectorAll('label');

                for (i=0;i<inputs.length;i++)
                {
                    if (inputs[i].className == 'check-modal')
                    {
                        if (inputs[i].checked == true)
                        {
                            profile = labels[i].innerText
                            db.transaction(
                                function(tx)
                                {
                                    tx.executeSql(
                                        `
                                            SELECT * FROM profileInfos 
                                            WHERE email = ?
                                        `,
                                        [
                                            vm.user.email
                                        ],
                                        function(_,result)
                                        {
                                            if (result.rows.length > 0)
                                            {
                                                tx.executeSql(
                                                    `
                                                        UPDATE profileInfos 
                                                        SET profile = ?,
                                                            token = ?
                                                        WHERE email=?
                                                    `,
                                                    [
                                                        profile,
                                                        vm.user.token,
                                                        vm.user.email
                                                    ]
                                                )
                                            }
                                        }
                                    )
                                }
                            )
                        }
                    }
                }

                $('#select-profile-modal').modal('hide');
            }
        },
        data(){
            return {
                user: [],
            }
        }
    }
)

const app = new Vue({
    el: '#main-app'
})

function show()
{
    db.transaction(
        function(tx)
        {
            tx.executeSql(
                `
                    SELECT * FROM profileInfos;
                `,
                [],
                function(e,result)
                {
                    console.log(result.rows);
                }
            )
        }
    )
}

function insert(email,token,name,profile)
{
    db.transaction(
        function(tx)
        {
            tx.executeSql(
                `
                    INSERT INTO profileInfos 
                    (
                        email,
                        token,
                        name,
                        profile
                    ) 
                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?
                    )                        
                `,
                [
                    email,
                    token,
                    name,
                    profile
                ]
            )
        }
    )
}
