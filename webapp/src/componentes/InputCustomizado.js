import React, { Component } from 'react';
import PubSub from 'pubsub-js';

export default class InputCustomizado extends Component{

  constructor(){
    super();
    this.state = {msErro: ''};
  }

  render() {
    return (
      <div className="pure-control-group">
        <label htmlFor={this.props.id}>{this.props.label}</label> 
        <input {...this.props}/>                  
        <span className="error">{this.state.msErro}</span>      
      </div>            
    );
  }

  componentDidMount(){
    PubSub.subscribe("erro-validacao", function(topico,erro){
      if(erro.field === this.props.name){
        this.setState({msErro: erro.defaultMessage});
      }
    }.bind(this));
    PubSub.subscribe("limpa-erros", function(topico){
      this.setState({msErro: ''});
    }.bind(this));
  
  }
}