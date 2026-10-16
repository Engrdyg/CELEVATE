export const THEME_KEY = "celevate-theme";

/**
 * Runs synchronously in <head> before first paint: applies the saved theme
 * (or OS preference) and the motion preference, preventing a theme flash.
 */
export const themeScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("${THEME_KEY}")||"system";var r=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;d.classList.remove("light","dark");d.classList.add(r);d.style.colorScheme=r;var p=JSON.parse(localStorage.getItem("celevate-prefs")||"null");if(p&&p.state&&p.state.motion==="reduced")d.dataset.motion="reduced";if(p&&p.state&&p.state.sidebarCollapsed)d.dataset.sidebar="collapsed"}catch(e){document.documentElement.classList.add("dark")}})()`;
