import {initEditor} from './editor';
import {initWebGL} from './webgl';


import './style.css';

window.addEventListener('DOMContentLoaded', () => {
    initWebGL();
    initEditor();
});