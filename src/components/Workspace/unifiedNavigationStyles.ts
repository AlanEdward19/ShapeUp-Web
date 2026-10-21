export const unifiedNavigationCss = `
.material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;display:inline-block;line-height:1;letter-spacing:normal;text-transform:none;white-space:nowrap;direction:ltr;-webkit-font-feature-settings:'liga';font-feature-settings:'liga';font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 20}
[data-unified-sidebar]{position:fixed;inset:0 auto 0 0;width:16rem;background:#130d0a;border-right:1px solid #3b322e;z-index:60;display:flex;flex-direction:column;justify-content:space-between;font:15px/1.45 'Source Sans 3',sans-serif;color:#f5ede6;box-sizing:border-box}
[data-unified-sidebar] .sn-brand{height:4rem;display:flex;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid #3b322e}
[data-unified-sidebar] .sn-brand strong{font:700 22px/1 'Barlow Condensed',sans-serif;letter-spacing:0;text-transform:none}
[data-unified-sidebar] .sn-brand small{font:600 12px/1.2 'Source Sans 3',sans-serif;letter-spacing:.02em;border:0;background:#302825;padding:4px 8px;border-radius:8px;color:#d4a359}
[data-unified-sidebar] nav{padding:12px;flex:1;overflow:auto}
[data-unified-sidebar] nav p{font:600 13px/1.35 'Source Sans 3',sans-serif;text-transform:none;letter-spacing:0;color:#d0c4bb;padding:12px 12px 6px;margin:0}
[data-unified-sidebar] a{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;color:#d0c4bb;text-decoration:none;border:0;min-height:44px}
[data-unified-sidebar] a[aria-current=page]{background:#e06c43;color:#181311;font-weight:600}
[data-unified-sidebar] a[aria-current=page] .material-symbols-outlined{color:#181311}
[data-unified-sidebar] a:hover{background:#302825;color:#f5ede6}
[data-unified-sidebar] a[aria-current=page]:hover{background:#e87a53;color:#181311}
[data-unified-sidebar] a:focus-visible{outline:2px solid #e06c43;outline-offset:2px}
[data-unified-sidebar] .sn-brand a{min-height:44px;padding:0;background:transparent;border-radius:8px}
[data-unified-sidebar] .sn-brand a:hover{background:transparent;color:inherit}
[data-unified-sidebar] .sn-profile{margin:12px;padding:12px;border:1px solid #3b322e;border-radius:14px;background:#211a17;display:flex;align-items:center;gap:10px}
[data-unified-sidebar] .sn-profile strong{display:block;font-size:14px;font-weight:600}[data-unified-sidebar] .sn-profile small{font-size:12px;color:#d0c4bb}
[data-unified-sidebar] .sn-profile button{min-width:44px;min-height:44px;border-radius:12px}
.sn-mobile{display:none}
@media(max-width:767px){[data-unified-sidebar]{transform:translateX(-110%)}[data-unified-sidebar][data-open=true]{transform:none}.sn-mobile{display:grid;place-items:center;position:fixed;bottom:16px;left:16px;z-index:80;width:52px;height:52px;background:#e06c43;color:#181311;border-radius:14px;padding:0;border:0}.sn-space{display:none!important}.shell-body [data-shell-content]{margin-left:0!important;padding-left:0!important;width:100%!important}.shell-body{overflow-x:hidden}.shell-body header{flex-wrap:wrap;height:auto;min-height:64px}.shell-body main{max-width:100%;padding-left:16px;padding-right:16px}.shell-body table{min-width:650px}.shell-body [data-table-scroll]{overflow:auto}}
`;
