export const unifiedNavigationCss = `
.material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;display:inline-block;line-height:1;letter-spacing:normal;text-transform:none;white-space:nowrap;direction:ltr;-webkit-font-feature-settings:'liga';font-feature-settings:'liga';font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 20}
[data-unified-sidebar]{position:fixed;inset:0 auto 0 0;width:256px;background:#18120f;border-right:1px solid #3a2d27;z-index:60;display:flex;flex-direction:column;justify-content:space-between;font:14px/1.5 'Source Sans 3',sans-serif;color:#f3eae5;box-sizing:border-box}
[data-unified-sidebar] .sn-brand{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid #3a2d27}
[data-unified-sidebar] .sn-brand strong{font:700 20px 'Barlow Condensed';letter-spacing:1px;text-transform:uppercase}
[data-unified-sidebar] .sn-brand small{font-size:10px;border:1px solid #3a2d27;background:#211a17;padding:2px 8px;border-radius:4px;color:#d4a359}
[data-unified-sidebar] nav{padding:16px 12px;flex:1;overflow:auto}
[data-unified-sidebar] nav p{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#85766f;padding:0 12px;margin:0 0 8px}
[data-unified-sidebar] a{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:6px;color:#b8aaa2;text-decoration:none;border-left:2px solid transparent;min-height:38px}
[data-unified-sidebar] a[aria-current=page]{background:#211a17;color:#f3eae5;border-left-color:#e06c43;font-weight:600}
[data-unified-sidebar] a[aria-current=page] .material-symbols-outlined{color:#e06c43}
[data-unified-sidebar] a:hover{background:#211a17;color:#f3eae5}
[data-unified-sidebar] .sn-profile{margin:12px;padding:8px;border:1px solid #3a2d27;border-radius:6px;background:#211a17;display:flex;align-items:center;gap:10px}
[data-unified-sidebar] .sn-profile strong{display:block;font-size:12px}[data-unified-sidebar] .sn-profile small{font-size:11px;color:#85766f}
.sn-mobile{display:none}
@media(max-width:767px){[data-unified-sidebar]{transform:translateX(-100%)}[data-unified-sidebar][data-open=true]{transform:none}.sn-mobile{display:block;position:fixed;bottom:18px;left:18px;z-index:80;background:#e06c43;color:#171311;border-radius:8px;padding:12px;border:1px solid #3a2d27}.sn-space{display:none!important}.shell-body [data-shell-content]{margin-left:0!important;padding-left:0!important;width:100%!important}.shell-body{overflow-x:hidden}.shell-body header{flex-wrap:wrap;height:auto;min-height:64px}.shell-body main{max-width:100%;padding-left:16px;padding-right:16px}.shell-body table{min-width:650px}.shell-body [data-table-scroll]{overflow:auto}}
`;
