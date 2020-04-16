import React, { Component } from 'react';
import axios from 'axios';
import { View, Text } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

// Components
import Toolbar from './components/Toolbar';
import SendButton from './components/SendButton';

export default class App extends Component {

	constructor(props) {
		super(props);
		this._onSend = this._onSend.bind(this);
		this._onReply = this._onReply.bind(this);
		this._isTyping = this._isTyping.bind(this);
	}

	state = {typing: false, messages: []}

	_botMessage(text, id) {
		return [{
			_id: id,
			text: text,
			createdAt: new Date(),
			user: {
				_id: 2,
				name: 'React Native',
				avatar: 'https://placeimg.com/140/140/avatar',
			},
		}]
	}

	_onReply(text, time) {
		let id = this.state.messages.length + 1;
		const stateMessages = this.state.messages;
		
		setTimeout(() => {
			this.setState({ messages: GiftedChat.append(stateMessages, this._botMessage(text, id)) });
		}, time)
	}

	_onSend(messages) {

		// Send message 
		const text = messages[0].text;
		const stateMessages = this._messages;
		const send = GiftedChat.append(stateMessages, messages)
		this._messages = send;

		this.setState({ messages: send });
		
		axios.post('https://wiki101.herokuapp.com/api/message', {
			session: this._session, 
			message: text 
		}).then(res => {
			let replyTime = (100 * res.data.text.length);

			this._onReply(res.data.text, replyTime);

		}).catch(err => console.log(err));
	}

	_isTyping() {

		console.log(state)
		// if (state) return <Text>Typing</Text>
		return null;
	}

	componentDidMount() {
		axios.post('https://wiki101.herokuapp.com/api/session').then(res => {
			// Session
			this._session = res.data.session;
			this._messages = this._botMessage('Hi', 1);

			this.setState({ messages: this._botMessage('Hi', 1)})
		}).catch(err => console.log(err));		
	}

	render() {
		return (
			<GiftedChat 
				alwaysShowSend={true}
				messages={this.state.messages} 
				onSend={this._onSend}
				renderFooter={this._isTyping(props)}
				renderSend={props => <SendButton {...props} />}
				renderInputToolbar={props => <Toolbar {...props} />}
				user={{ _id: 1 }}
			/>
		);
	}
}