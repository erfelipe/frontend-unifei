import React, { useEffect, useState } from 'react'
import axios from "axios";
import { FaPencil, FaTrashCan } from 'react-icons/fa6';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export default function CrudUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [id, setId] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [operacao, setOperacao] = useState("");

  const url = "https://api-unifei-indol.vercel.app/usuarios/";

  useEffect(() => {
    fetch(url)
      .then((respFetch) => respFetch.json())
      .then((respJson) => setUsuarios(respJson))
      .catch((err) => console.log(err));
  }, [url]);

  function novosDados() {
    setOperacao("criarRegistro");
  }

  function limparDados() {
    setId("");
    setNome("");
    setEmail("");
    setAltura("");
    setPeso("");
    setOperacao("");
  }

  function gravarDados() {
    if (nome !== "" && email !== "") {
      if (operacao === "criarRegistro") {
        axios
          .post(url, {
            nome: nome,
            email: email,
            altura: (altura ? altura : null),
            peso: (peso ? peso : null),
          })
          .then((response) => atualizaListaComNovoUsuario(response))
          .catch((err) => console.log(err));
      } else if (operacao === "editarRegistro") {
        axios.get(url + id)
          .then(() => podeEditar(id))
          .catch((erro) => alert("Não é possível editar pois o registro não existe mais." + erro)
          )
      }
    } else {
      alert("Preencha os campos");
    }
  }

  function podeEditar(id) {
    axios
      .put(url + id, {
        id: id,
        nome: nome,
        email: email,
        altura: (altura ? altura : null),
        peso: (peso ? peso : null),
      })
      .then((response) => {
        alert(response.status)
        atualizaListaUsuarioEditado(response)
      })
      .catch((err) => alert(err));
  }


function editarDados(cod) {
  let usuario = usuarios.find((item) => item.id === cod);
  const { id, nome, email, altura, peso } = usuario;
  setOperacao("editarRegistro");
  setId(id);
  setNome(nome);
  setEmail(email);
  setAltura(altura);
  setPeso(peso);
}

function apagarDados(cod) {
  confirmAlert({
    title: 'Atenção: EXCLUIR',
    message: 'Deseja excluir o usuário de código: ' + cod,
    buttons: [
      {
        label: 'Sim',
        onClick: () => {
          axios.delete(url + cod)
            .then(() => setUsuarios(usuarios.filter(item => item.id !== cod)))
            .catch((erro) => {
              if (erro.response.status == 404) {
                alert("O usuário já foi excluído.")
                setUsuarios(usuarios.filter(item => item.id !== cod))
              } else if (erro.response.status > 500) {
                alert("Problema no servidor.")
              }
            });
        }
      },
      {
        label: 'Não',
        onClick: () => console.log("didático")
      }
    ]
  });


}

function atualizaListaUsuarioEditado(response) {
  if (response.status == 202) {
    //encontra o indice do usuario a ser atualizado pelo id
    const index = usuarios.findIndex(item => item.id == id);
    //faz uma copia do array de usuarios
    let users = usuarios;
    //na copia, atualiza o usuario editado
    users[index].nome = nome;
    users[index].email = email;
    users[index].altura = altura;
    users[index].peso = peso;
    //seta os usuarios com o array editado 
    setUsuarios(users);
    limparDados();
  } else {
    console.log("Problema com edição: ", response.status);
  }
}

function atualizaListaComNovoUsuario(response) {
  console.log(response);
  let { id, nome, email, altura, peso } = response.data;
  let obj = { "id": id, "nome": nome, "email": email, "altura": altura, "peso": peso };
  let users = usuarios;
  users.push(obj);
  setUsuarios(users);
  limparDados();
}

return (
  <div id="containerGeral">
    <button type="button" onClick={novosDados}>Novo</button>

    <input
      type="text"
      name="txtNome"
      value={nome}
      onChange={(e) => { setNome(e.target.value); }}
    />
    <input
      type="text"
      name="txtEmail"
      value={email}
      onChange={(e) => { setEmail(e.target.value); }}
    />
    <input
      type="number"
      name="txtAltura"
      value={altura}
      onChange={(e) => setAltura(e.target.value)}
    />
    <input
      type="number"
      name="txtPeso"
      value={peso}
      onChange={(e) => setPeso(e.target.value)}
    />

    <button type="button" onClick={limparDados}>Cancelar</button>
    <button type="button" onClick={gravarDados}>Gravar</button>
    {usuarios ? usuarios.map((item) => {
      return (
        <div key={item.id}>

          {item.id} - {item.nome} - {item.email} - {item.altura} - {item.peso} - {" "}
          <FaPencil
            onClick={(e) => editarDados(item.id)}
          />
          <FaTrashCan
            onClick={(e) => apagarDados(item.id)}
          />

        </div>
      );
    })
      : <p>Banco de dados vazio</p>}
  </div>
);


}
