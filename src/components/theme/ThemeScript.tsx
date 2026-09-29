const THEME_INIT = `(function(){try{var t=localStorage.getItem("fyrama-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){document.documentElement.classList.remove("dark");}})();`;

export function ThemeScript({ nonce }: { nonce?: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_INIT }} />;
}