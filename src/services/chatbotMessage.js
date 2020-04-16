const chatbotMessage = (text, id) => {
	return [{
		_id: id,
		text: text,
		createdAt: new Date(),
		user: {
			_id: 2,
			name: 'Mr Frank',
			avatar: 'https://placeimg.com/140/140/avatar',
		},
	}];
}

export default chatbotMessage;