import React from 'react';
import { View, Text, Animated } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

// Service
import axios from 'axios';
import Storage from './services/Storage';
import { chatbotMessage, userMessage, quickReply, systemMessage } from './services/messages';

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
		this._onQuickReply = this._onQuickReply.bind(this);
		this._messageReply = this._messageReply.bind(this);
		this._updateMessages = this._updateMessages.bind(this);
		this._displayMessages = this._displayMessages.bind(this);
	}

	componentDidMount() {
		// Animated.timing('', {useNativeDriver: true}).start();

		axios.post('https://wiki101.herokuapp.com/api/session')
			.then(res => {
				this._session = res.data.session;
				this._displayMessages(systemMessage('Send a reply.', 1))
			})
		.catch(err => this._displayMessages(systemMessage('Error detected', 1)));

		Storage.get('name').then(name => {
			this._updateMessages(
				chatbotMessage(`Hello ${name}. What would you like to know about coronavirus today?`, this._messages.length)
			);
		});
	}

	componentDidUpdate() {
		// let count = 1;
		// const timer = setInterval(() => {
		// 	if (count == 60) {
		// 		clearInterval(timer);
		// 		this._displayMessages(systemMessage('Conversation closed.', this._messages.length));
		// 	}
		// 	count++ 
		// }, 1000);
	}

	// Private methods
	_messageReply(messageText) {
		axios.post('https://wiki101.herokuapp.com/api/message', {
				session: this._session, 
				message: messageText 
			})
			.then(({ data }) => {
				this._isTyping(true);

				// Get intents
				const response = data.output.generic;

				// Response
				const timer = setTimeout(() => {
					clearTimeout(timer);
					this._isTyping(false);
					response.forEach(res => {
						switch(res.response_type) {
							case "text":
								this._displayMessages(chatbotMessage(res.text, this._messages.length));
								break;

							case "image":
								this._displayMessages(
									chatbotMessage(res.description, this._messages.length, res.source)
								);
								break;

							case "option":
								this._displayMessages(
									quickReply(res.text, this._messages.length, res.options)
								);
								break;
						}
					})

				}, 200)
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

	_onQuickReply(options) {
		return options.forEach(option => {
			this._messageSend(userMessage(option.title, this._messages.length));
		});
	}

	render() {
		return (
			<GiftedChat 
				user={{ _id: 1 }}
				isAnimated={false}
				alwaysShowSend={true}
				onSend={this._messageSend}
				renderFooter={this._footer}
				messages={this.state.messages}
				onQuickReply={this._onQuickReply}
				renderSend={props => <SendButton {...props} />}
				renderInputToolbar={props => <Toolbar {...props} />}
			/>
		);
	}
}

Main.options = {
    topBar: { visible: false }
}