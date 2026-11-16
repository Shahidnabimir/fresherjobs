export const THEME_KEY = "fresheronly.theme";

/** Runs before paint to apply the saved/system theme and avoid a flash. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`;
