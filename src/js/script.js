import modals from './modules/modals';
import checkWebpSupport from './checkWebpSupport';

window.addEventListener('DOMContentLoaded', () => {
	'use strict';
	console.log('test script.js');

	checkWebpSupport();

	modals();
});
