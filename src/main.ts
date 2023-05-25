import App from './App.svelte';
import "carbon-components-svelte/css/g10.css";


const app = new App({
  target: document.getElementById("app"),
});

window.addEventListener('load', () => {
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }
});

export default app;