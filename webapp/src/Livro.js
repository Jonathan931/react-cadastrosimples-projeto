import React, { Component } from 'react';
import InputCustomizado from './componentes/InputCustomizado'; 
import $ from 'jquery';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorError from './TratadorErros'

export default class LivroBox extends Component{
  
  constructor(){
    super();
    this.state ={lista: [], autores:[]};  
    this.atualizaListagem = this.atualizaListagem.bind(this);
  }
  
  render(){
    return(
      <div>
        <div className="header">
          <h1>Cadastro de Livros</h1>
        </div>
        <FormularioLivro autores={this.state.autores} />
        <TabelaLivros lista={this.state.lista}/>
       </div>
     )
  }

  atualizaListagem(novaLista){
    this.setState({lista: novaLista});
  }

  componentDidMount(){
    $.ajax({
        url:"http://localhost:8080/api/livros",
        dataType: 'json',
        success:function(resposta){    
          this.setState({lista:resposta});
        }.bind(this)
      } 
    );

    $.ajax({
      url:"http://localhost:8080/api/autores",
      dataType: 'json',
      success:function(resposta){    
        this.setState({autores:resposta});
      }.bind(this)
    });

    PubSub.subscribe('atualiza-lista-livros', function(topico, novaLista){
      this.setState({lista:novaLista});
    }.bind(this));
  }

}


class TabelaLivros extends Component{
  
  render(){
    return(
      <div>            
        <table className="pure-table">
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Preço</th>
              <th>Autor</th>
            </tr>
          </thead>
          <tbody>
          {
            this.props.lista.map(function(livro){
              return(
                <tr key={livro.id}>
                  <td>{livro.titulo}</td>
                  <td>{livro.preco}</td>
                  <td>{livro.autor.nome}</td>
                </tr>
              )
            })
          }
          </tbody>
        </table> 
      </div>
    )
  }
}

class FormularioLivro extends Component{
  
  constructor(){
    super();
    this.state ={titulo:'',preco:'',autorId:''}; 
    this.enviaForm = this.enviaForm.bind(this);
  }
  
  render(){
    return(
      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
          <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.handleSalvaAlteracao.bind(this, 'titulo')} label="Nome"/>                                              
          <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.handleSalvaAlteracao.bind(this, 'preco')} label="Preço"/>                                              
          <div className="pure-control-group">
          <label htmlFor="autorId">Autor</label> 
          <select value={this.state.autorId} className="pure-control-group" name="autorId"onChange={this.handleSalvaAlteracao.bind(this, 'autorId')}>
            <option value="">Selecione Autor</option>
            {
              this.props.autores.map(function(autor){
                return <option value={autor.id}>{autor.nome}</option>
              })
            }
          </select> 
          </div>                                                                    
          <div className="pure-control-group">                                  
            <label></label> 
            <BotaoSubmitCustomizado label="Gravar"/>                                   
          </div>
        </form>   
      </div>            
    )
  }

  enviaForm(evento){
    evento.preventDefault();
    $.ajax({
      url: 'http://localhost:8080/api/livros',
      contentType: 'application/json',
      dataType: 'json',
      type: 'post',
      data: JSON.stringify(
        { 
          titulo: this.state.titulo, 
          preco: this.state.preco, 
          autorId: this.state.autorId
        }
      ),
      success: function(novaListagem){
        PubSub.publish('atualiza-lista-livros', novaListagem);
        this.setState({titulo: '', preco: '', autorId: ''});
      }.bind(this),
      error: function(resposta){
        if(resposta.status === 400){
          new TratadorError().publicaErros(resposta.responseJSON);
        }
      },
      beforeSend: function(){
        PubSub.publish("limpa-erros", {});
      }  
    })

  }

  handleSalvaAlteracao(nomeInput, evento){
    var campoSendoAlterado = {};
    campoSendoAlterado[nomeInput] = evento.target.value;
    this.setState(campoSendoAlterado);
  }
}