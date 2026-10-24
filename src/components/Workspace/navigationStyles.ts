/** Sidebar chrome shared by every workspace shell. Colors come from the document tokens so light/dark both work. */
export const navigationStyles = `
[data-unified-sidebar] .material-symbols-outlined{font-family:'Material Symbols Outlined'!important;font-weight:400!important;font-style:normal!important;font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24!important;display:inline-block!important;line-height:1!important;letter-spacing:normal!important;text-transform:none!important;white-space:nowrap!important;direction:ltr;-webkit-font-feature-settings:'liga'!important;font-feature-settings:'liga'!important;font-size:22px}
[data-unified-sidebar] a[aria-current=page] .material-symbols-outlined{font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24!important}
[data-unified-sidebar]{position:fixed;inset:0 auto 0 0;width:16rem;background:var(--bg-card);border-right:1px solid var(--border-color);z-index:60;display:flex;flex-direction:column;font:15px/1.4 'Source Sans 3',sans-serif;color:var(--text-main);box-sizing:border-box}
[data-unified-sidebar] .sn-brand{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:20px 16px 12px}
[data-unified-sidebar] .sn-brand a{display:flex;align-items:center;gap:10px;min-height:44px;padding:0;background:transparent;border-radius:10px;color:var(--text-main);text-decoration:none}
[data-unified-sidebar] .sn-brand a:hover{background:transparent;color:var(--text-main)}
[data-unified-sidebar] .sn-brand img{border-radius:9px}
[data-unified-sidebar] .sn-wordmark{font:700 24px/1 'Barlow Condensed',sans-serif;letter-spacing:.01em}
[data-unified-sidebar] .sn-brand small{font:600 12px/1.2 'Source Sans 3',sans-serif;background:var(--bg-surface-high);color:var(--text-muted);padding:4px 9px;border-radius:999px}
[data-unified-sidebar] nav{padding:4px 10px 12px;flex:1;overflow:auto;scrollbar-width:thin}
[data-unified-sidebar] nav p{font:600 12px/1.3 'Source Sans 3',sans-serif;letter-spacing:.02em;color:var(--text-muted);padding:18px 12px 6px;margin:0}
[data-unified-sidebar] nav a{display:flex;align-items:center;gap:12px;padding:0 12px;min-height:44px;border-radius:12px;color:var(--text-muted);text-decoration:none;font-weight:500;border:0;transition:background-color .14s,color .14s}
[data-unified-sidebar] nav a:hover{background:var(--bg-surface-high);color:var(--text-main)}
[data-unified-sidebar] nav a[aria-current=page]{background:var(--bg-surface-high);color:var(--text-main);font-weight:600}
[data-unified-sidebar] nav a[aria-current=page] .material-symbols-outlined{color:var(--primary)}
[data-unified-sidebar] a:focus-visible,[data-unified-sidebar] button:focus-visible{outline:2px solid var(--link-color);outline-offset:2px}
[data-unified-sidebar] .sn-profile{margin:0;padding:12px 14px;border-top:1px solid var(--border-color);display:flex;align-items:center;gap:10px}
[data-unified-sidebar] .sn-profile strong{display:block;font-size:14px;font-weight:600;line-height:1.25}
[data-unified-sidebar] .sn-profile small{font-size:12px;color:var(--text-muted)}
[data-unified-sidebar] .sn-profile button{background:none;border:0;padding:0;cursor:pointer;color:var(--text-muted);min-width:44px;min-height:44px;display:grid;place-items:center;border-radius:12px}
[data-unified-sidebar] .sn-profile button:hover{background:var(--bg-surface-high);color:var(--text-main)}
[data-unified-sidebar] .sn-profile button .material-symbols-outlined{font-size:20px}
.sn-mobile{display:none}
@media(max-width:767px){[data-unified-sidebar]{transform:translateX(-110%);transition:transform .22s cubic-bezier(.16,1,.3,1);box-shadow:none}[data-unified-sidebar][data-open=true]{transform:none;box-shadow:0 0 60px rgb(0 0 0/.45)}.sn-mobile{display:grid;place-items:center;position:fixed;top:12px;right:12px;z-index:80;width:44px;height:44px;background:var(--bg-surface-high);color:var(--text-main);border-radius:14px;padding:0;border:0}.sn-space{display:none!important}.shell-body [data-shell-content]{margin-left:0!important;width:100%!important;padding-top:56px}.shell-body .pl-64{padding-left:0!important}.shell-body{overflow-x:hidden}.shell-body header{flex-wrap:wrap;height:auto;min-height:64px}.shell-body main{max-width:100%;padding-left:16px;padding-right:16px}.shell-body table{min-width:650px}.shell-body [data-table-scroll]{overflow:auto}}
`;
