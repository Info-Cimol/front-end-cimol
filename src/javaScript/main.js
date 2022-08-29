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

let permissions = {
    'Administrador': [
        'Alunos', 
        'Professores', 
        'Horários', 
        'Cursos'
    ],

    'Professor': [
        'Horários', 
        'Armarios', 
        'Patrimonios', 
        'Alunos', 
        'Professores'
    ],

    'Aluno': [
        'Curriculo', 
        'Horários', 
        'Oportunidades'
    ],

    'Biblioteca': [
        'Editoras', 
        'Autores', 
        'Obras'
    ]
}

const loginForm = Vue.component('login-section', 
    {
        template: 
        `
            <div class='component-dad' v-if='this.$root.showLogin == true'>
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
            </div>
        `,
        methods: {
            //81dc9bdb52d04dc20036dbd8313ed055 - 1234
            async conect()
            {
                const email = document.getElementById('input-email-lg').value;
                const senha = document.getElementById('input-senha-lg').value;

                const hashSenha = await md5(senha);

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
                            idUser: res.user.id,
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
                            this.$root.showLogin = false;
                            this.$root.showProfile = true;
                            this.showLogin = false;
                        }
                        document.getElementById('permissions-list').classList.remove('disabled');
                        document.getElementById('permissions-list').classList.add('enable');
                        this.$root.user = user;
                    }
                )
            }
        }
    }
)

const profileSection = Vue.component('profile-section',
    {
        template: 
        `
            <div>
                <div v-if='this.$root.showProfile == true' id='div-h3'>
                    <h3 id='profile-h3'> {{ this.$root.user.profiles[0] }} </h3>
                </div>
                <div v-if='this.$root.showProfile == true' v-model='showPermission()'>
                    <ul class='list-perm'>
                        <li class='list-perm-item' v-for='perm in permissions'><a :id='perm' @click='clickList' href='#' > {{ perm }} </a></li>
                    </ul>
                </div>
            </div>
        `,
        data()
        {
            return {
                permissions: {'':''}
            }
        },
        methods: {
            showPermission(){
                let profilePermissions

                if (this.$root.user.profiles[0] == 'Admin'){
                    profilePermissions = permissions.Administrador;
                }else if(this.$root.user.profiles[0] == 'Professor'){
                    profilePermissions = permissions.Professor;
                }else if(this.$root.user.profiles[0] == 'Aluno'){
                    profilePermissions = permissions.Aluno;
                }else if(this.$root.user.profiles[0] == 'Biblioteca'){
                    profilePermissions = permissions.Biblioteca;
                }
    
                this.permissions = profilePermissions
            },
            clickList()
            {
                console.log()
                for (i=0; i<this.permissions.length; i++) 
                {
                    let a = document.getElementById(this.permissions[i])

                    a.onclick = () =>
                    {

                        this.$root.showComponent[a.innerText] = true

                        let height = window.innerHeight;
                        let width = window.innerWidth;
                        console.log(width);
                        
                        if (width < 1024){
                            this.$root.showProfile = false
                            document.getElementById('permissions-list').classList.remove('enable');
                            document.getElementById('permissions-list').classList.add('disabled');
                        }

                        const config = {
                            method: 'GET',
                            mode: 'cors',
                            cache: 'default',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-access-token': this.$root.user.token,
                                'perfil': this.$root.user.profiles[0].toLowerCase(),
                                'idUser': this.$root.user.idUser
                            }
                        }
    
                        fetch('http://127.0.0.1:3000/curso/', config)
                        .then(resp => resp.json())
                        .then(res =>{
                            this.$root.cursos = res;
                        })
    
                        console.log(this.$root.cursos)
                    }
                }
                
            }
        }
    }
)

const selectModal = Vue.component('select-profile',
    {
        template: 
        `
            <div class='modal-body'>          
                <div class='text'>
                    <p>Olá {{ this.$root.user.nome }}, selecione o usuario que deseja usar.</p>
                </div>
                <div v-for='profile in this.$root.user.profiles'>
                    <input class='check-modal' type='checkbox' value=''>
                    <label for='check-modal' class='check-label'>{{ profile }}</label>
                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-secondary' data-dismiss='modal'>Cancelar</button>
                    <button type='button' @click='logIn' data-dismiss='modal' class='btn btn-primary'>Confirmar</button>
                </div>
            </div>
        `,
        methods: {
            async logIn()
            {
                let user = this.$root.user;
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
                                            user.email
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
                                                        user.token,
                                                        user.email
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
                this.$root.showLogin = false;
                this.$root.showProfile = true;
            }
        }
    }
)

const sectionCursos = Vue.component('cursos-section',
    {
        template: 
        `
        <div class='component-dad'>
            <div v-if='this.$root.showComponent.Cursos == true'>
                <p v-for='curso in this.$root.cursos' style='font-size: 32px; width:100%;'>teste {{ curso }}</p>
            </div>
        </div>
        `
    }
)

const app = new Vue({
    el: '#main-app',
    data: 
    {
        showLogin: true,
        showProfile: false,
        cursos: [],
        showComponent: {
            'Alunos': false, 
            'Professores': false, 
            'Horário': false, 
            'Cursos': false,
            'Armarios': false, 
            'Patrimonio': false, 
            'Curriculo': false, 
            'Oportunidades': false,
            'Editoras': false, 
            'Autores': false, 
            'Obras': false
        },
        user: {
            nome: '',
            email: '',
            token: '',
            idUser: '',
            profiles: [''],
        }
    }
})
