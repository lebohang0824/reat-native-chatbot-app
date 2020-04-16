import React from 'react';
import { View, Text } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

// Service
import axios from 'axios';
import chatbotMessage from './services/chatbotMessage';

// Components
import Typing from './components/Typing';
import Toolbar from './components/Toolbar';
import SendButton from './components/SendButton';

export default class Main extends React.Component {

	constructor() {
		super(...arguments);

		// State
		this.state = {
			messages: [], typing: false
		}		

		// Private properties
		this._messages = [];
		this._session = null;
		this._typing = false;

		// Bindings
		this._footer = this._footer.bind(this);
		this._isTyping = this._isTyping.bind(this);
		this._messageSend = this._messageSend.bind(this);
		this._messageReply = this._messageReply.bind(this);
		this._updateMessages = this._updateMessages.bind(this);
		this._displayMessages = this._displayMessages.bind(this);
	}

	componentDidMount() {
		axios.post('https://wiki101.herokuapp.com/api/session')
			.then(res => {
				this._session = res.data.session;
				this._updateMessages(
					chatbotMessage('Hello there!', 1)
				);
			})
		.catch(err => console.log(err));
	}

	// Private methods
	_messageReply(messageText) {
		axios.post('https://wiki101.herokuapp.com/api/message', {
				session: this._session, 
				message: messageText 
			})
			.then(({ data }) => {
				this._isTyping(true);
				const timer = setTimeout(() => {
					clearTimeout(timer);
					this._isTyping(false);
					this._displayMessages(chatbotMessage(data.text, this._messages.length));
				}, data.text.length * 100)
			})
		.catch(err => console.log(err));
	}

	_messageSend(messages) {
		// Display user message
		this._displayMessages(messages);
		// Reply user
		this._messageReply(messages[0].text);
	}

	_updateMessages(messages) {
		this._messages = messages;
		this.setState({ messages: messages });
	}

	_isTyping(typing) {
		this.setState({ 
			typing, messages: GiftedChat.append(this._messages, []) 
		});
	}

	_displayMessages(message) {
		this._updateMessages(
			GiftedChat.append(this._messages, message)
		);
	}

	_footer(props) {
		return this.state.typing ? <Typing /> : null;
	}

	render() {
		return (
			<GiftedChat 
				user={{ _id: 1 }}
				isTyping={true}
				alwaysShowSend={true}
				onSend={this._messageSend}
				renderFooter={this._footer}
				messages={this.state.messages}
				renderSend={props => <SendButton {...props} />}
				renderInputToolbar={props => <Toolbar {...props} />}
			/>
		);
	}
}