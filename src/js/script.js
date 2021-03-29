import modals from './modules/modals';
import checkWebpSupport from './libs/checkWebpSupport';

checkWebpSupport();

window.addEventListener('DOMContentLoaded', () => {
	'use strict';
	console.log('test script.js');

	modals();
});
