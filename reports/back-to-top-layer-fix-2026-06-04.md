# Back-to-top button layer fix - 2026-06-04

## Pham vi

- Nut: `.footer-back-top` va fallback `.generate-back-to-top`.
- Plugin live: `ttcqn-home-emergency-renderer`.
- Version sau sua: `2026.06.04.2`.

## Da sua

- Bo rule lam `.footer-back-top` bi `opacity:0` va mat `pointer-events` khi cuon vao section du an/quy trinh.
- Nang layer cua `.footer-back-top` va `.generate-back-to-top` len `z-index:2147482400`.
- Them `safe-area-inset` cho desktop/mobile de nut khong sat mep duoi man hinh.
- Khi JS khoi tao, chuyen `.footer-back-top` ra truc tiep duoi `document.body` de thoat stacking context cua footer/section.
- Giu rule an nut khi form sheet dang mo: `body.ttcqn-seo-sheet-open`.

## File thay doi

- `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`
- Rebuilt zip: `tools/wp-plugins/ttcqn-home-emergency-renderer.zip`

## Backup

- Zip truoc upload: `backups/button-layer-fix-2026-06-04/ttcqn-home-emergency-renderer-before.zip`
- Source trich tu zip cu: `backups/button-layer-fix-2026-06-04/source-before-from-zip`

## Kiem tra

- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`: PASS
- `node --check tools/upload_home_emergency_renderer_plugin.mjs`: PASS
- Zip verify: co `2026.06.04.2`, co `2147482400`, co `appendChild`, khong con rule che `.footer-back-top` trong project/process section.
- Upload live: `uploadSuccess=true`, `activeConfirmed=true`, `success=true`.
- Live HTML homepage: co version `2026.06.04.2`, co CSS z-index moi, co JS append nut ra body.
- Live HTML trang con: co CSS z-index moi, co JS append nut ra body.
- Chrome headless desktop 1365x900:
  - mid-page, projects-section, process-section deu `parent=BODY`, `zIndex=2147482400`, `opacity=1`, `pointerEvents=auto`, `topIsButton=true`.
- Chrome headless mobile 390x844:
  - mid-page, projects-section, process-section deu `parent=BODY`, `zIndex=2147482400`, `opacity=1`, `pointerEvents=auto`, `topIsButton=true`.
- Click test mobile: `ok=true`, scroll tu `3233` ve `325` sau click.
