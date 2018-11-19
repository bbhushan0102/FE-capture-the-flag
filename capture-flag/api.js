import es6promise from 'es6-promise';
import Frisbee from 'frisbee';
import axios from 'axios';
const DB_URL = 'https://capture-flag1.herokuapp.com/api/user';

es6promise.polyfill();

const api = new Frisbee({
	baseURI: 'https://capture-flag1.herokuapp.com/api',
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json'
	}
});

export const getUser = async username => {
	const { body } = await api.get(`/user/${username}`);
	return body.user;
};

export const patchScore = async (username, scoreUpdate) => {
	const { body } = await api.patch(`/user/${username}?score=${scoreUpdate}`);
};

export const patchFlagLocation = async (username, latUpdate, longUpdate) => {
	const { body } = await api.patch(`/flag/${username}?latitude=${latUpdate}&longitude=${longUpdate}`);
};

export const patchFlagCapture = async username => {
	const { body } = await api.patch(`/flag/${username}/capture`);
};

export const getUserAfterLogin = async (user) => {
    const { username, password } = user
	const { data } = await axios.post(`${DB_URL}/login`, { username, password })
    return data
}

export const addUser = async user => {
    const { name, username, password, confirm } = user 
    const { data } = await axios.post(DB_URL, { name, username, password, confirm })
    return data
}
export const patchZoneLocation = async (username, latUpdate, longUpdate) => {
	// console.log(username, latUpdate, longUpdate);
	const body = await api.patch(`/flag/${username}/zone?latitude=${latUpdate}&longitude=${longUpdate}`);
	// console.log(body, '<<<<<<');
};
