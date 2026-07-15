import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const tabIcons = [
  readFileSync(new URL('../assets/icon/tab1.svg', import.meta.url), 'utf8'),
  readFileSync(new URL('../assets/icon/tab2.svg', import.meta.url), 'utf8'),
  readFileSync(new URL('../assets/icon/tab3.svg', import.meta.url), 'utf8'),
];

function getRule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...css.matchAll(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`, 'gm'))];
  assert.ok(matches.length, `Expected CSS rule for ${selector}`);
  return matches.at(-1)[1];
}

test('seed ReDs refresh caps the phone canvas at 390px and uses Bg0 as the base', () => {
  assert.match(css, /--phone-max-width:\s*390px/);
  assert.match(getRule('html'), /overflow-x:\s*hidden/);
  assert.match(getRule('html'), /scrollbar-gutter:\s*stable both-edges/);
  assert.match(getRule('body'), /overflow-x:\s*hidden/);
  assert.match(getRule('body'), /scrollbar-gutter:\s*stable both-edges/);
  assert.match(getRule('html.is-overlay-open,\nbody.is-overlay-open'), /overflow:\s*hidden/);
  assert.match(getRule('html.is-overlay-open,\nbody.is-overlay-open'), /overscroll-behavior:\s*none/);
  assert.match(getRule('.phone-shell'), /width:\s*min\(100%,\s*var\(--phone-max-width\)\)/);
  assert.match(getRule('.phone-shell'), /max-width:\s*var\(--phone-max-width\)/);
  assert.match(getRule('.phone-shell'), /overflow-x:\s*hidden/);
  assert.match(getRule('#screen'), /background:\s*var\(--reds-bg0\)/);
});

test('seed home core surfaces consume ReDs semantic tokens', () => {
  const selectors = [
    '.seed-appbar',
    '.location-pill',
    '.seed-insight-strip article',
    '.recommend-card',
    '.filters button.active',
    '.seed-card .card-copy',
    '.tabbar',
  ];

  for (const selector of selectors) {
    assert.match(getRule(selector), /var\(--reds-/, `${selector} should use ReDs tokens`);
  }
});

test('seed home icons and compact tags follow ReDs minimum sizing', () => {
  assert.match(getRule('.seed-appbar'), /height:\s*44px/);
  assert.match(getRule('.avatar-btn,\n.lightup-entry-btn'), /width:\s*44px/);
  assert.match(getRule('.tab-symbol'), /width:\s*var\(--reds-icon-3xl\)/);
  assert.match(app, /data-recommend-swipe/);
  assert.match(app, /switchRecommendSlide\(dx < 0 \? 1 : -1\)/);
  assert.doesNotMatch(app, /class="slider-dots"/);
  assert.doesNotMatch(css, /\.slider-dots/);
  assert.match(getRule('.recommend-card'), /touch-action:\s*pan-y/);
  assert.match(getRule('.seed-card .collect-btn.mini'), /width:\s*32px/);
  assert.match(getRule('.seed-card .collect-btn.mini'), /height:\s*32px/);
  assert.match(getRule('.seed-card .mini-tags i'), /min-height:\s*20px/);
});

test('provided SVG icons replace CSS-drawn and text placeholder icons', () => {
  assert.match(getRule('.tab-symbol.seed'), /--tab-icon:\s*url\("\.\/assets\/icon\/tab1\.svg"\)/);
  assert.match(getRule('.tab-symbol.painting'), /--tab-icon:\s*url\("\.\/assets\/icon\/tab2\.svg"\)/);
  assert.match(getRule('.tab-symbol.experience'), /--tab-icon:\s*url\("\.\/assets\/icon\/tab3\.svg"\)/);
  assert.match(getRule('.tab-symbol'), /mask:\s*var\(--tab-icon\) center \/ contain no-repeat/);
  assert.equal(tabIcons.some(icon => /fill-opacity=/.test(icon)), false);
  assert.match(getRule('.lightup-entry-btn span::before'), /amenties_special\.svg/);
  assert.match(getRule('.collect-btn::before'), /collect\.svg/);
  assert.match(getRule('.location-pill i'), /Frame\.svg/);
  assert.match(getRule('.location-pill i'), /transform:\s*none/);
  assert.match(getRule('.system-bar'), /SystemBar 系统栏\.svg/);
  assert.match(getRule('.system-bar'), /width:\s*calc\(100% \+ \(var\(--phone-gutter\) \* 2\)\)/);
  assert.match(getRule('.system-bar'), /z-index:\s*120/);
  assert.match(app, /document\.documentElement\.classList\.toggle\('is-overlay-open',\s*hasBlockingOverlay\)/);
  assert.match(app, /document\.body\.classList\.toggle\('is-overlay-open',\s*hasBlockingOverlay\)/);
  assert.match(app, /function syncPhoneShellCenter\(\)/);
  assert.match(app, /--phone-shell-center-offset/);
  assert.match(app, /window\.addEventListener\('resize',\s*syncPhoneShellCenter\)/);
  assert.match(getRule('.phone-shell'), /left:\s*var\(--phone-shell-center-offset\)/);
  assert.match(getRule('html.is-overlay-open .phone-shell'), /left:\s*var\(--phone-shell-center-offset\)/);
  assert.match(getRule('button[data-back]::before'), /返回\.svg/);
  assert.match(getRule('button[data-open-sheet="share-detail"]::before'), /share\.svg/);
  assert.match(getRule('button[data-close-sheet]::before'), /close\.svg/);
});

test('seed home section rhythm uses ReDs spacing tokens', () => {
  assert.match(getRule('.seed-appbar'), /gap:\s*var\(--reds-gap-lg\)/);
  assert.match(getRule('.seed-insight-strip'), /gap:\s*var\(--reds-gap-default\)/);
  assert.match(getRule('.block-head'), /margin-bottom:\s*var\(--reds-gap-xl\)/);
  assert.match(getRule('.article-grid'), /gap:\s*var\(--reds-gap-lg\)/);
});

test('main tab content keeps equal left and right gutters', () => {
  assert.match(getRule('.phone-shell'), /margin-left:\s*auto/);
  assert.match(getRule('.phone-shell'), /margin-right:\s*auto/);
  assert.match(getRule('#screen'), /width:\s*100%/);
  assert.match(getRule('#screen'), /max-width:\s*var\(--phone-max-width\)/);
  assert.match(getRule('#screen'), /padding:\s*0 var\(--phone-gutter\) calc\(96px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(getRule('#screen'), /overflow-x:\s*hidden/);
  assert.match(getRule('.seed-appbar,\n.home-block'), /width:\s*min\(100%,\s*var\(--phone-content-width\)\)/);
  assert.match(getRule('.seed-appbar,\n.home-block'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.seed-appbar,\n.home-block'), /margin-left:\s*auto/);
  assert.match(getRule('.seed-appbar,\n.home-block'), /margin-right:\s*auto/);
  const pageContentRule = getRule('#screen > .seed-appbar,\n#screen > .seed-insight-strip,\n#screen > .home-block,\n#screen > .painting-titlebar,\n#screen > .painting-carousel,\n#screen > .painting-hero-block,\n#screen > .related-block,\n#screen > .experience-route-block,\n#screen > .experience-products-block,\n#screen > .experience-skills-block,\n#screen > .experience-service-block,\n#screen > .detail-v3-appbar,\n#screen > .detail-v3-meta,\n#screen > .preference-flow,\n#screen > .agent-loading-page,\n#screen > .agent-result-page');
  assert.match(pageContentRule, /width:\s*min\(100%,\s*var\(--phone-content-width\)\)/);
  assert.match(pageContentRule, /max-width:\s*var\(--phone-content-width\)/);
  assert.match(pageContentRule, /margin-left:\s*auto/);
  assert.match(pageContentRule, /margin-right:\s*auto/);
  const selectors = [
    '.home-block',
    '.seed-insight-strip',
    '.recommend-card',
    '.article-grid',
    '.painting-carousel',
    '.painting-digest-row',
    '.painting-experience-card',
    '.experience-hero-card',
    '.experience-route-panel',
    '.experience-product-row',
    '.experience-skill-list',
    '.experience-service-grid',
  ];

  for (const selector of selectors) {
    assert.match(getRule(selector), /margin-left:\s*auto/, `${selector} should center within the phone gutter`);
    assert.match(getRule(selector), /margin-right:\s*auto/, `${selector} should center within the phone gutter`);
  }
});

test('state pages preserve the same centered screen gutters', () => {
  const stateScreenRule = getRule('#screen:has(.detail-v3-panel),\n#screen:has(.preference-flow),\n#screen:has(.agent-result-page),\n#screen:has(.agent-loading-page)');
  assert.match(stateScreenRule, /width:\s*100%/);
  assert.match(stateScreenRule, /max-width:\s*var\(--phone-max-width\)/);
  assert.match(stateScreenRule, /margin-left:\s*auto/);
  assert.match(stateScreenRule, /margin-right:\s*auto/);
  assert.match(stateScreenRule, /padding-left:\s*var\(--phone-gutter\)/);
  assert.match(stateScreenRule, /padding-right:\s*var\(--phone-gutter\)/);
  assert.match(stateScreenRule, /overflow-x:\s*hidden/);
});

test('location sheet uses a reusable province and region picker', () => {
  assert.match(app, /getLocationGroups/);
  assert.match(app, /secondary-sheet-\$\{type\}/);
  assert.match(app, /class="secondary-location-picker"/);
  assert.match(app, /data-select-location-province="\$\{group\.province\}"/);
  assert.match(app, /data-select-destination="\$\{item\.id\}"/);
  assert.doesNotMatch(css, /#screen:has\(\.secondary-sheet-location\)\s*\{[\s\S]*?padding-(?:left|right):/);
  assert.match(getRule('.phone-shell:has(.secondary-sheet-location)'), /margin-left:\s*auto/);
  assert.match(getRule('.phone-shell:has(.secondary-sheet-location)'), /margin-right:\s*auto/);
  assert.match(getRule('.secondary-sheet-location'), /width:\s*min\(100vw,\s*var\(--phone-max-width\)\)/);
  assert.match(getRule('.secondary-sheet-location'), /max-width:\s*var\(--phone-max-width\)/);
  assert.match(getRule('.secondary-sheet-location'), /left:\s*50%/);
  assert.match(getRule('.secondary-sheet-location'), /animation:\s*redsSheetUp 240ms cubic-bezier\(0\.2,\s*0\.8,\s*0\.2,\s*1\) both/);
  assert.match(getRule('.secondary-location-picker'), /grid-template-columns:\s*104px minmax\(0,\s*1fr\)/);
  assert.match(getRule('.secondary-location-provinces button'), /background:\s*transparent/);
  assert.match(getRule('.secondary-location-provinces button.active'), /background:\s*var\(--reds-bg2\)/);
  assert.match(getRule('.secondary-location-list button'), /background:\s*var\(--reds-fill1\)/);
  assert.match(getRule('.secondary-location-list button.active'), /border-color:\s*var\(--reds-primary\)/);
  assert.match(getRule('.secondary-location-list button.active'), /background:\s*var\(--reds-bg2\)/);
});

test('seed home location summary follows the selected destination', () => {
  assert.match(app, /function getCurrentDestination\(\)/);
  assert.match(app, /const seedHomeAssets = \{/);
  assert.match(app, /const seedHeroAssets = \{/);
  assert.match(app, /'hero-1':\s*'\.\/assets\/figma-seed-home\/hero-1\.png'/);
  assert.match(app, /'hero-7':\s*'\.\/assets\/figma-seed-home\/hero-7\.jpg'/);
  assert.match(app, /'img-01':\s*'\.\/assets\/figma-seed-home\/img-01\.jpg'/);
  assert.match(app, /'img-17':\s*'\.\/assets\/figma-seed-home\/img-17\.jpg'/);
  assert.match(app, /if \(key === 'hero'\) return seedHeroImageSrc\('hero-1'\)/);
  assert.match(app, /if \(seedHeroAssets\[key\]\) return seedHeroImageSrc\(key\)/);
  assert.match(app, /if \(seedHomeAssets\[key\]\) return seedHomeAssets\[key\]/);
  assert.match(app, /function seedHeroImageSrc\(image,\s*fallback = 'hero-1'\) \{/);
  assert.match(app, /const key = image === 'hero' \? 'hero-1' : image/);
  assert.match(app, /if \(seedHeroAssets\[key\]\) return seedHeroAssets\[key\]/);
  assert.match(app, /const destinationSeedContent = \{/);
  assert.match(app, /function getCurrentSeedPackage\(\)/);
  assert.match(app, /function getCurrentSeedDiscoverList\(\)/);
  assert.match(app, /const destination = getCurrentDestination\(\)/);
  assert.match(app, /<b>\$\{destination\.province\}<\/b>/);
  assert.match(app, /<b>\$\{destination\.region\}<\/b>/);
  assert.match(app, /推荐景点<\/span><b>\$\{destination\.region\}<\/b><em>\$\{destination\.content\.reason\}<\/em>/);
  assert.match(app, /<b>\$\{seedPackage\.discover\.length\}<\/b><em>个目的地灵感<\/em>/);
  assert.match(app, /const recommendSlides = seedPackage\.recommend/);
  assert.match(app, /const list = getCurrentSeedDiscoverList\(\)/);
  assert.match(app, /data-open="\$\{activeRecommend\.targetId\}"/);
  assert.match(app, /data-detail-hero="\$\{escapeAttr\(seedHeroImageSrc\(activeRecommend\.detailHeroImage \|\| activeRecommend\.image \|\| activeRecommend\.baseImage\)\)\}"/);
  assert.match(app, /class="hero-base-img" src="\$\{seedHeroImageSrc\(activeRecommend\.baseImage \|\| activeRecommend\.image\)\}"/);
  assert.match(app, /class="hero-layer-img" src="\$\{seedHeroImageSrc\(activeRecommend\.image \|\| activeRecommend\.baseImage\)\}"/);
  assert.match(app, /data-open="\$\{targetId\}"/);
  assert.match(app, /data-detail-hero="\$\{escapeAttr\(detailHero\)\}"/);
  assert.match(app, /collectId:\s*`\$\{destination\.content\.id\}:recommend:\$\{index\}`/);
  assert.match(app, /collectId:\s*`\$\{destination\.content\.id\}:discover:\$\{index\}`/);
  assert.match(app, /collectButton\(activeRecommend\.collectId \|\| activeRecommend\.targetId\)/);
  assert.match(app, /const collectId = item\.collectId \|\| targetId/);
  assert.match(app, /state\.recommendIndex = 0/);
  assert.match(app, /state\.detailHeroOverride = open\.dataset\.detailHero \|\| null/);
  assert.match(app, /state\.detailHeroOverride \|\| detail\?\.detailHeroImage/);
  assert.match(app, /state\.seedFilter = '全部'/);
  assert.match(app, /<span>📍\$\{item\.location\}<\/span>/);
  assert.doesNotMatch(app, /<b>江西<\/b>\s*<b>上饶<\/b>/);
});

test('painting tab core surfaces consume ReDs semantic tokens', () => {
  const selectors = [
    '.painting-titlebar',
    '.painting-carousel-card',
    '.painting-digest-row article',
    '.painting-experience-card',
    '.painting-art-window',
    '.painting-knowledge-panel',
    '.painting-knowledge-actions > button',
    '.related-grid .related-card',
  ];

  for (const selector of selectors) {
    assert.match(getRule(selector), /var\(--reds-/, `${selector} should use ReDs tokens`);
  }
});

test('painting tab icons and hotspots follow ReDs minimum sizing', () => {
  assert.match(getRule('.painting-titlebar'), /height:\s*44px/);
  assert.match(getRule('.painting-carousel-card button'), /width:\s*32px/);
  assert.match(getRule('.painting-carousel-card button'), /height:\s*32px/);
  assert.match(getRule('.hotspot-pin'), /width:\s*32px/);
  assert.match(getRule('.hotspot-pin'), /height:\s*32px/);
  assert.match(getRule('.hotspot-pin span'), /width:\s*20px/);
  assert.match(getRule('.hotspot-pin.focused,\n.hotspot-pin.chosen'), /background:\s*rgba\(255,\s*255,\s*255,\s*0\.5\)/);
  assert.match(getRule('.hotspot-pin.focused span,\n.hotspot-pin.chosen span'), /background:\s*var\(--reds-primary\)/);
  assert.match(getRule('.painting-knowledge-title button'), /width:\s*32px/);
  assert.match(getRule('.painting-knowledge-title button'), /height:\s*32px/);
});

test('painting knowledge action uses add hotspot icon instead of close icon', () => {
  assert.match(app, /data-add-hotspot="\$\{hotspot\.id\}"/);
  assert.doesNotMatch(app, /data-close-knowledge aria-label="收起知识卡"/);
  assert.match(getRule('.painting-knowledge-title button[data-add-hotspot]::before'), /add_f\.svg/);
});

test('painting knowledge thumbnails use fixed dimension images by hotspot type', () => {
  assert.match(app, /const hotspotDimensionImages = \{/);
  assert.match(app, /'情':\s*paintingAsset\('hotspot-dim-qing\.png'\)/);
  assert.match(app, /'物':\s*paintingAsset\('hotspot-dim-wu\.png'\)/);
  assert.match(app, /'艺':\s*paintingAsset\('hotspot-dim-yi\.png'\)/);
  assert.match(app, /'人':\s*paintingAsset\('hotspot-dim-ren\.png'\)/);
  assert.match(app, /'景':\s*paintingAsset\('hotspot-dim-jing\.png'\)/);
  assert.match(app, /const image = hotspotDimensionImage\(hotspot\)/);
  assert.match(app, /class="painting-knowledge-thumb"/);
  assert.match(getRule('.painting-knowledge-thumb'), /width:\s*44px/);
  assert.match(getRule('.painting-knowledge-thumb'), /height:\s*44px/);
  assert.match(getRule('.painting-knowledge-thumb'), /object-fit:\s*cover/);
});

test('painting hotspot switches do not add programmatic scroll recovery', () => {
  assert.doesNotMatch(app, /function renderAndRestoreScrollNextFrame\(\)/);
  assert.doesNotMatch(app, /requestAnimationFrame\(\(\) => restoreScrollAfterSameViewRender\(true,\s*snapshot\)\)/);
  assert.match(app, /const paintingHotspot = event\.target\.closest\('\[data-painting-hotspot\]'\);[\s\S]*?state\.activeHotspotId = state\.activeHotspotId === id \? null : id;[\s\S]*?render\(\{ restoreSameViewScroll: false \}\);[\s\S]*?return;/);
});

test('painting tab section rhythm uses ReDs spacing tokens and 390px content math', () => {
  assert.match(getRule('.painting-titlebar'), /width:\s*100%/);
  assert.match(getRule('.painting-carousel-card'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.painting-carousel-card'), /background:\s*var\(--reds-bg2\)/);
  assert.match(getRule('.painting-digest-row'), /gap:\s*var\(--reds-gap-default\)/);
  assert.match(getRule('.painting-experience-card'), /border-radius:\s*var\(--reds-radius-large\)/);
  assert.match(app, /class="painting-art-track"/);
  assert.match(getRule('.painting-art-window'), /overflow-x:\s*auto/);
  assert.match(getRule('.painting-art-window'), /scrollbar-width:\s*none/);
  assert.match(getRule('.painting-art-track'), /width:\s*178%/);
  assert.match(getRule('.painting-art-track'), /min-width:\s*560px/);
  assert.match(getRule('.related-grid'), /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});

test('painting tab uses the matched artwork image for Qingming and Gusu views', () => {
  assert.match(app, /id:\s*'qingming'[\s\S]*image:\s*paintingAsset\('painting-qingming\.png'\)/);
  assert.match(app, /id:\s*'gusu'[\s\S]*image:\s*paintingAsset\('painting-gusu\.png'\)/);
});

test('experience tab core surfaces consume ReDs semantic tokens', () => {
  const selectors = [
    '.experience-appbar',
    '.experience-hero-card',
    '.experience-status-row span',
    '.experience-mode-strip',
    '.experience-route-panel',
    '.experience-product-card',
    '.experience-skill-card',
    '.experience-service-card',
  ];

  for (const selector of selectors) {
    assert.match(getRule(selector), /var\(--reds-/, `${selector} should use ReDs tokens`);
  }
});

test('experience tab controls follow ReDs minimum sizing', () => {
  assert.match(getRule('.experience-appbar'), /height:\s*44px/);
  assert.match(getRule('.experience-mode-strip button'), /height:\s*48px/);
  assert.match(getRule('.experience-product-foot button,\n.experience-skill-card > button,\n.purchase-actions button'), /min-height:\s*28px/);
  assert.match(getRule('.experience-skill-main button'), /min-height:\s*28px/);
  assert.match(getRule('.experience-skill-card.is-lighted'), /background:\s*var\(--reds-bg2\)/);
  assert.match(getRule('.experience-skill-card.is-lighted'), /border-color:\s*var\(--reds-separator\)/);
  assert.match(getRule('.experience-skill-card.is-lighted .experience-skill-main button'), /background:\s*var\(--reds-fill2\)/);
  assert.match(getRule('.experience-skill-card.is-lighted .experience-skill-main button'), /color:\s*var\(--reds-label-title\)/);
  assert.match(getRule('.skill-thumb'), /width:\s*64px/);
  assert.match(getRule('.skill-thumb'), /height:\s*88px/);
});

test('experience product section does not show a redundant more entry', () => {
  assert.doesNotMatch(app, /<button data-open-sheet="experience-products">查看更多<\/button>/);
});

test('experience tab uses the uploaded replacement images', () => {
  assert.match(app, /hero:\s*'\.\/assets\/experience-new\/hero-experience\.jpg'/);
  assert.match(app, /'\.\/assets\/experience-new\/product-1\.jpg'/);
  assert.match(app, /'\.\/assets\/experience-new\/product-2\.png'/);
  assert.match(app, /'\.\/assets\/experience-new\/product-3\.jpg'/);
  assert.match(app, /'skill-lantern':\s*'\.\/assets\/experience-new\/skill-1\.jpg'/);
  assert.match(app, /'skill-paper':\s*'\.\/assets\/experience-new\/skill-2\.jpg'/);
  assert.match(app, /'skill-sugar':\s*'\.\/assets\/experience-new\/skill-3\.jpg'/);
});

test('experience tab section rhythm uses ReDs spacing tokens and 390px content math', () => {
  assert.match(getRule('.experience-appbar'), /width:\s*100%/);
  assert.match(getRule('.experience-hero-card'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.experience-route-panel'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.experience-product-row'), /width:\s*100%/);
  assert.match(getRule('.experience-product-row'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.experience-skill-list'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.experience-service-grid'), /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.doesNotMatch(app, /data-open-sheet="experience-service">服务详情/);
});

test('experience tab timeline and product cards keep text inside the phone viewport', () => {
  assert.match(getRule('.experience-timeline'), /overflow:\s*hidden/);
  assert.match(getRule('.timeline-times span,\n.timeline-labels span'), /max-width:\s*72px/);
  assert.match(getRule('.timeline-times span:first-child,\n.timeline-labels span:first-child'), /transform:\s*translateX\(0\)/);
  assert.match(getRule('.timeline-times span:last-child,\n.timeline-labels span:last-child'), /transform:\s*translateX\(-100%\)/);
  assert.match(getRule('.experience-product-row'), /margin-left:\s*auto/);
  assert.match(getRule('.experience-product-row'), /margin-right:\s*auto/);
  assert.match(getRule('.experience-product-card'), /flex:\s*0 0 calc\(\(var\(--phone-content-width\) - var\(--reds-gap-lg\) - 16px\) \/ 2\)/);
  assert.match(getRule('.experience-product-card h3,\n.experience-skill-card h3'), /text-overflow:\s*ellipsis/);
  assert.match(getRule('.experience-product-card p,\n.experience-skill-card p'), /-webkit-line-clamp:\s*2/);
});

test('detail page core surfaces consume ReDs semantic tokens', () => {
  const selectors = [
    '#screen:has(.detail-v3-panel)',
    '.detail-v3-appbar',
    '.detail-v3-meta span',
    '.detail-v3-panel',
    '.detail-v3-intro',
    '.detail-itinerary-card',
    '.detail-v3-hotspot-card',
    '.detail-traveler-card',
    '.detail-floating-generate',
  ];

  for (const selector of selectors) {
    assert.match(getRule(selector), /var\(--reds-/, `${selector} should use ReDs tokens`);
  }
});

test('detail page follows ReDs sizing, tap targets, and phone content math', () => {
  assert.match(getRule('.detail-v3-hero'), /width:\s*100%/);
  assert.match(getRule('.detail-v3-hero'), /max-width:\s*var\(--phone-max-width\)/);
  assert.match(getRule('.detail-v3-appbar'), /height:\s*44px/);
  assert.match(getRule('.detail-v3-appbar > button,\n.detail-v3-appbar .detail-appbar-actions button'), /width:\s*44px/);
  assert.match(getRule('.detail-v3-appbar .detail-collect-btn::before'), /collect\.svg/);
  assert.match(getRule('.detail-v3-appbar [data-open-sheet="share-detail"] span'), /background:\s*currentColor/);
  assert.match(getRule('.detail-v3-meta'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.detail-v3-panel'), /width:\s*calc\(100% \+ \(var\(--phone-gutter\) \* 2\)\)/);
  assert.match(getRule('.detail-v3-panel'), /margin:\s*0 calc\(var\(--phone-gutter\) \* -1\)/);
  assert.match(getRule('.detail-v3-intro'), /width:\s*calc\(100% - \(var\(--phone-gutter\) \* 2\)\)/);
  assert.match(getRule('.detail-v3-block'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.detail-v3-trip-row'), /margin-left:\s*0/);
  assert.match(getRule('.detail-v3-trip-row'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.detail-itinerary-card'), /border:\s*0/);
  assert.match(app, /<article class="detail-itinerary-card" data-preview-detail-trip="\$\{index\}">/);
  assert.match(app, /\/2\\s\*天\|两天\/\.test\(title\) \? '两天一夜'/);
  assert.match(app, /detail-trip-back-img/);
  assert.match(app, /detail-trip-front-img/);
  assert.match(getRule('.detail-trip-stack em'), /font-size:\s*var\(--reds-font-size-c3\)/);
  assert.match(getRule('.detail-traveler-card'), /padding:\s*var\(--reds-gap-7xl\) var\(--reds-gap-default\) var\(--reds-gap-xl\)/);
  assert.match(getRule('.detail-traveler-card > div:not(.detail-traveler-shade)'), /grid-template-columns:\s*16px minmax\(0,\s*1fr\)/);
  assert.match(getRule('.detail-traveler-card > div:not(.detail-traveler-shade)'), /column-gap:\s*var\(--reds-gap-xs\)/);
  assert.match(getRule('.detail-traveler-card p'), /-webkit-line-clamp:\s*2/);
  assert.match(getRule('.detail-traveler-card p'), /white-space:\s*normal/);
  assert.match(getRule('.detail-floating-generate'), /width:\s*min\(calc\(100% - \(var\(--phone-gutter\) \* 2\)\),\s*var\(--phone-content-width\)\)/);
});

test('detail painting breakdown follows the selected hotspot content', () => {
  assert.match(app, /const activeDetailHotspot = hotspots\.find\(item => item\.id === state\.activeHotspotId\) \|\| hotspots\[0\]/);
  assert.match(app, /\$\{activeDetailHotspot\.dim\}·\$\{activeDetailHotspot\.name\}/);
  assert.match(app, /\$\{activeDetailHotspot\.desc\}/);
  assert.match(getRule('.detail-v3-painting-card .detail-painting-art button.focused span'), /background:\s*var\(--reds-primary\)/);
});

test('preference setup pages consume ReDs semantic tokens', () => {
  const selectors = [
    '#screen:has(.preference-flow)',
    '.preference-flow',
    '.preference-nav',
    '.preference-round-btn,\n.preference-skip',
    '.preference-stepper',
    '.preference-stage',
    '.preference-choice',
    '.preference-choice.selected',
    '.preference-primary-action',
    '.preference-secondary-action',
  ];

  for (const selector of selectors) {
    assert.match(getRule(selector), /var\(--reds-/, `${selector} should use ReDs tokens`);
  }
});

test('preference setup pages follow ReDs sizing and phone content math', () => {
  assert.match(getRule('.preference-flow'), /width:\s*100%/);
  assert.match(getRule('.preference-system'), /width:\s*100%/);
  assert.match(getRule('.preference-nav'), /height:\s*44px/);
  assert.match(getRule('.preference-nav'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.preference-round-btn,\n.preference-skip'), /min-height:\s*44px/);
  assert.match(getRule('.preference-stepper'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.preference-stepper article b'), /width:\s*32px/);
  assert.match(getRule('.preference-stage'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.preference-choice'), /width:\s*100%/);
  assert.match(getRule('.preference-choice'), /min-height:\s*96px/);
  assert.match(getRule('.preference-actions'), /position:\s*fixed/);
  assert.match(getRule('.preference-actions'), /width:\s*min\(calc\(100% - \(var\(--phone-gutter\) \* 2\)\),\s*var\(--phone-content-width\)\)/);
});

test('preference choices are unselected initially and defaults are applied on confirm', () => {
  assert.match(app, /function ensurePreferenceDefaults\(\) \{/);
  assert.match(app, /const isSelected = Boolean\(state\.preference\[key\]\) && state\.preference\[key\] === option\.label;/);
  assert.match(app, /data-skip-pref aria-label="跳过配置"/);
  assert.match(app, /if \(event\.target\.closest\('\[data-skip-pref\]'\)\) \{[\s\S]*ensurePreferenceDefaults\(\);[\s\S]*state\.hasGenerated = true;/);
});

test('preference primary action is disabled until the current step has a selection', () => {
  assert.match(app, /function isCurrentPreferenceStepSelected\(step = state\.preferenceStep\) \{/);
  assert.match(app, /const canContinue = isCurrentPreferenceStepSelected\(step\);/);
  assert.match(app, /<button class="preference-primary-action" \$\{!canContinue \? 'disabled aria-disabled="true"' : ''\}/);
  assert.match(app, /if \(nextPref && !isCurrentPreferenceStepSelected\(\)\) \{/);
  assert.match(app, /if \(confirmPref && !isCurrentPreferenceStepSelected\(\)\) \{/);
});

test('AI result page core surfaces consume ReDs semantic tokens', () => {
  const selectors = [
    '#screen:has(.agent-result-page)',
    '.agent-result-page',
    '.agent-result-page .agent-appbar',
    '.agent-result-preference',
    '.agent-result-title',
    '.agent-result-page .agent-dimension-card',
    '.agent-result-page .agent-route-card',
    '.agent-result-page .agent-role-card',
    '.agent-result-page .agent-photo-card',
    '.agent-result-page .agent-tips-card',
    '.agent-result-page .result-action',
  ];

  for (const selector of selectors) {
    assert.match(getRule(selector), /var\(--reds-/, `${selector} should use ReDs tokens`);
  }
});

test('AI result page follows ReDs sizing, tap targets, and phone content math', () => {
  assert.match(getRule('.phone-shell:has(.agent-result-page)'), /background:\s*var\(--reds-bg0\)/);
  assert.match(getRule('.phone-shell:has(.agent-result-page)'), /max-width:\s*var\(--phone-max-width\)/);
  assert.match(getRule('#screen:has(.agent-result-page)'), /max-width:\s*var\(--phone-max-width\)/);
  assert.match(getRule('#screen:has(.agent-result-page)'), /margin:\s*0 auto/);
  assert.match(getRule('#screen:has(.agent-result-page)'), /padding:\s*0 var\(--phone-gutter\) calc\(108px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(getRule('.agent-result-page'), /width:\s*100%/);
  assert.match(getRule('.agent-result-page'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.agent-result-page .agent-appbar'), /height:\s*44px/);
  assert.match(getRule('.agent-result-page .agent-appbar button'), /width:\s*44px/);
  assert.doesNotMatch(app, /<button data-back aria-label="返回">‹<\/button>/);
  assert.doesNotMatch(app, /<button data-open-sheet="share-result" aria-label="分享">↗<\/button>/);
  assert.match(getRule('.agent-result-page .agent-appbar button[data-back]::before,\n.agent-result-page .agent-appbar button[data-open-sheet="share-result"]::before'), /left:\s*50%/);
  assert.match(getRule('.agent-result-page .agent-appbar button[data-back]::before,\n.agent-result-page .agent-appbar button[data-open-sheet="share-result"]::before'), /transform:\s*translate\(-50%,\s*-50%\)/);
  assert.match(getRule('.agent-result-preference'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.agent-result-page .agent-dimension-row'), /max-width:\s*100%/);
  assert.match(getRule('.agent-result-page .agent-route-list article'), /grid-template-columns:\s*48px 12px minmax\(0,\s*1fr\)/);
  assert.match(getRule('.agent-result-page .agent-photo-list'), /grid-template-columns:\s*1fr/);
  assert.match(getRule('.agent-result-page .result-action'), /width:\s*min\(calc\(100% - \(var\(--phone-gutter\) \* 2\)\),\s*var\(--phone-content-width\)\)/);
});

test('AI result page keeps the immersive background artwork with a ReDs fade', () => {
  assert.match(getRule('#screen:has(.agent-result-page)'), /overflow-x:\s*hidden/);
  assert.match(getRule('.agent-result-page'), /overflow:\s*visible/);
  assert.match(getRule('.agent-result-page::before'), /url\("\.\/assets\/figma-ai-result\/result-bg\.png"\)/);
  assert.match(getRule('.agent-result-page::before'), /content:\s*""/);
  assert.match(getRule('.agent-result-page::before'), /position:\s*absolute/);
  assert.match(getRule('.agent-result-page::before'), /left:\s*calc\(var\(--phone-gutter\) \* -1\)/);
  assert.doesNotMatch(getRule('.agent-result-page::before'), /display:\s*none/);
  assert.match(getRule('.agent-result-page::after'), /var\(--reds-bg0\)/);
  assert.match(getRule('.agent-result-page::after'), /content:\s*""/);
  assert.match(getRule('.agent-result-page::after'), /position:\s*absolute/);
  assert.doesNotMatch(getRule('.agent-result-page::after'), /display:\s*none/);
});

test('AI result loading page follows ReDs visual system and timing', () => {
  const selectors = [
    '#screen:has(.agent-loading-page)',
    '.agent-loading-page',
    '.agent-loading-hero h1',
    '.agent-loading-card',
    '.agent-loading-progress',
    '.agent-loading-steps b',
    '.agent-loading-orbit',
  ];

  for (const selector of selectors) {
    assert.match(getRule(selector), /var\(--reds-/, `${selector} should use ReDs tokens`);
  }

  assert.match(app, /const RESULT_LOADING_MS = 3000;/);
  assert.match(app, /function beginResultLoading\(\) \{/);
  assert.match(app, /else if \(state\.page === 'loading'\) renderResultLoading\(\);/);
  assert.match(app, /state\.page = 'loading';/);
  assert.match(app, /state\.page = 'result';/);
  assert.match(css, /@keyframes agentLoadingProgress/);
  assert.match(getRule('.agent-loading-card'), /width:\s*calc\(100% - \(var\(--reds-gap-xl\) \* 2\)\)/);
  assert.match(getRule('.agent-loading-card'), /margin:\s*calc\(var\(--reds-gap-4xl\) \* -1\) var\(--reds-gap-xl\) 0/);
  assert.match(getRule('.agent-loading-progress i'), /animation:\s*agentLoadingProgress 3s linear forwards/);
});

test('AI result loading animation is white pulse only and has no bottom dimension chips', () => {
  assert.match(app, /<div class="agent-loading-orbit" aria-hidden="true"><\/div>/);
  assert.doesNotMatch(app, /agent-loading-dimensions/);
  assert.doesNotMatch(app, /focusItems\.map/);
  assert.match(getRule('.agent-loading-orbit'), /animation:\s*agentLoadingPulse 1\.8s ease-in-out infinite/);
  assert.match(getRule('.agent-loading-orbit::after'), /background:\s*rgba\(255,\s*255,\s*255,\s*0\.24\)/);
  assert.doesNotMatch(css, /\.agent-loading-orbit i\s*\{/);
  assert.doesNotMatch(css, /\.agent-loading-orbit i[\s\S]*?var\(--reds-primary\)/);
});

test('AI result entries route through loading before showing the result page', () => {
  assert.match(app, /function routeGenerate\(source\) \{[\s\S]*beginResultLoading\(\);[\s\S]*render\(\);/);
  assert.match(app, /function previewGuideAsResult\(item\) \{[\s\S]*beginResultLoading\(\);/);
  assert.match(app, /const confirmPref = event\.target\.closest\('\[data-confirm-pref\]'\);[\s\S]*if \(confirmPref && !isCurrentPreferenceStepSelected\(\)\) \{[\s\S]*return;[\s\S]*if \(confirmPref\) \{[\s\S]*state\.hasGenerated = true;[\s\S]*beginResultLoading\(\);[\s\S]*render\(\);/);
});

test('AI result save action returns to seed home after adding itinerary', () => {
  assert.match(app, /if \(event\.target\.closest\('\[data-save-guide\]'\)\) \{[\s\S]*state\.page = 'home';[\s\S]*state\.tab = 'seed';[\s\S]*state\.profileOpen = false;[\s\S]*showToast\('已加入行程单，去我的查看'\);/);
});

test('profile drawer core surfaces consume ReDs semantic tokens', () => {
  const selectors = [
    '.profile-drawer-mask',
    '.profile-drawer.profile-drawer-v3',
    '.profile-simple-head',
    '.profile-simple-head h2',
    '.profile-simple-avatar',
    '.profile-section-title h2',
    '.profile-section-title button',
    '.profile-my-trip-card',
    '.profile-preference-panel',
    '.profile-recommend-card',
    '.profile-unlock-card',
  ];

  for (const selector of selectors) {
    assert.match(getRule(selector), /var\(--reds-/, `${selector} should use ReDs tokens`);
  }
});

test('profile drawer follows ReDs sheet sizing, tap targets, and 390px content math', () => {
  assert.match(getRule('.profile-drawer-mask'), /width:\s*min\(100vw,\s*var\(--phone-max-width\)\)/);
  assert.match(getRule('.profile-drawer-mask'), /inset:\s*0 auto 0 max\(0px,\s*calc\(\(100vw - var\(--phone-max-width\)\) \/ 2\)\)/);
  assert.match(getRule('.profile-drawer.profile-drawer-v3'), /left:\s*max\(0px,\s*calc\(\(100vw - var\(--phone-max-width\)\) \/ 2\)\)/);
  assert.match(getRule('.profile-drawer.profile-drawer-v3'), /top:\s*0/);
  assert.match(getRule('.profile-drawer.profile-drawer-v3'), /width:\s*min\(318px,\s*calc\(var\(--phone-max-width\) - 72px\),\s*calc\(100vw - 72px\)\)/);
  assert.match(getRule('.profile-drawer.profile-drawer-v3'), /max-width:\s*calc\(var\(--phone-max-width\) - 72px\)/);
  assert.match(getRule('.profile-drawer.profile-drawer-v3'), /height:\s*100dvh/);
  assert.match(getRule('.profile-drawer.profile-drawer-v3'), /padding:\s*calc\(54px \+ var\(--reds-gap-7xl\)\) var\(--phone-gutter\) calc\(96px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(getRule('.profile-simple-avatar'), /width:\s*44px/);
  assert.match(getRule('.profile-simple-avatar'), /height:\s*44px/);
  assert.match(getRule('.profile-v3-section'), /width:\s*100%/);
  assert.match(getRule('.profile-my-trip-row'), /max-width:\s*100%/);
  assert.match(getRule('.profile-my-trip-card'), /flex:\s*0 0 102px/);
  assert.match(getRule('.profile-recommend-card'), /flex:\s*0 0 calc\(\(100% - var\(--reds-gap-default\)\) \/ 2\)/);
  assert.match(getRule('.profile-recommend-card'), /background:\s*var\(--reds-fill1\)/);
  assert.match(getRule('.profile-recommend-visual'), /left:\s*var\(--reds-gap-xs\)/);
  assert.match(getRule('.profile-recommend-visual img:first-child'), /left:\s*24px/);
  assert.match(app, /profileSectionHead\('偏好调整'\)/);
  assert.match(getRule('.profile-preference-panel > button'), /min-height:\s*36px/);
  assert.match(getRule('.profile-preference-panel > button'), /width:\s*100%/);
  assert.match(getRule('.profile-preference-panel'), /display:\s*flex/);
  assert.match(getRule('.profile-unlock-grid'), /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
});

test('profile drawer cards use existing seed image assets', () => {
  assert.match(app, /image:\s*'hero-1'/);
  assert.match(app, /const image = item\.image \|\| \['hero-1', 'article-4', 'article-2'\]\[index % 3\]/);
  assert.match(app, /const images = index === 0 \? \['hero-1', 'article-4'\] : \['article-3', 'article-1'\]/);
  assert.match(app, /<img src="\$\{seedHomeImageSrc\(images\[0\]\)\}" alt="" \/>/);
  assert.doesNotMatch(app, /figma-seed-home\/hero\.png/);
  assert.doesNotMatch(app, /figma-seed-home\/\$\{images\[[01]\]\}\.png/);
});

test('half-layer sheets consume ReDs semantic tokens', () => {
  const selectors = [
    '.secondary-mask',
    '.secondary-sheet',
    '.secondary-head',
    '.secondary-body',
    '.secondary-actions',
    '.secondary-head > button',
    '.secondary-content-card,\n.secondary-quote-card,\n.secondary-trip-card,\n.secondary-painting-card,\n.secondary-product-card,\n.secondary-skill-card,\n.secondary-service-grid article,\n.secondary-skill-detail article,\n.secondary-share-card',
    '.purchase-mask',
    '.purchase-sheet',
    '.purchase-actions button',
    '.search-mask',
    '.search-sheet',
    '.search-top h2',
    '.global-lightup-mask',
    '.global-lightup-panel',
    '.global-lightup-panel header',
    '.global-lightup-summary article',
    '.global-lightup-photo-card',
  ];

  for (const selector of selectors) {
    assert.match(getRule(selector), /var\(--reds-/, `${selector} should use ReDs tokens`);
  }
  assert.doesNotMatch(app, /<p>\$\{content\.desc\}<\/p>/);
});

test('half-layer sheets stay inside the 390px phone canvas', () => {
  assert.match(css, /--sheet-fixed-height:\s*min\(56dvh,\s*460px\)/);
  assert.match(css, /@keyframes redsSheetMaskIn/);
  assert.match(css, /@keyframes redsSheetUp/);
  assert.match(getRule('.secondary-mask'), /width:\s*min\(100vw,\s*var\(--phone-max-width\)\)/);
  assert.match(getRule('.secondary-mask'), /animation:\s*redsSheetMaskIn 180ms ease-out both/);
  assert.match(getRule('.secondary-sheet'), /width:\s*min\(100vw,\s*var\(--phone-max-width\)\)/);
  assert.match(getRule('.secondary-sheet'), /max-width:\s*var\(--phone-max-width\)/);
  assert.match(getRule('.secondary-sheet'), /animation:\s*redsSheetUp 240ms cubic-bezier\(0\.2,\s*0\.8,\s*0\.2,\s*1\) both/);
  assert.match(getRule('.secondary-sheet,\n.purchase-sheet,\n.search-sheet'), /height:\s*var\(--sheet-fixed-height\)/);
  assert.match(getRule('.secondary-body'), /padding:\s*var\(--reds-gap-3xl\) var\(--phone-gutter\) calc\(var\(--reds-gap-7xl\) \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(getRule('.secondary-body'), /overflow-y:\s*auto/);
  assert.match(getRule('.secondary-sheet.has-actions'), /grid-template-rows:\s*auto auto minmax\(0,\s*1fr\) auto/);
  assert.match(getRule('.secondary-sheet.has-actions .secondary-body'), /padding-bottom:\s*var\(--reds-gap-3xl\)/);
  assert.match(getRule('.secondary-actions .secondary-primary'), /width:\s*100%/);
  assert.match(getRule('.secondary-actions .secondary-primary'), /min-height:\s*44px/);
  assert.match(app, /footer:\s*`<button class="secondary-primary secondary-share-action" data-share-detail>\$\{isResult \? '分享体验卡' : '分享内容卡'\}<\/button>`/);
  assert.doesNotMatch(app, /<button class="secondary-primary" data-close-sheet>保存分享卡<\/button>/);
  assert.match(getRule('button[data-close-sheet],\nbutton[data-close-search],\nbutton[data-close-lightups]'), /position:\s*relative/);
  assert.match(getRule('button[data-close-sheet]::before,\nbutton[data-close-search]::before,\nbutton[data-close-lightups]::before'), /left:\s*50%/);
  assert.match(getRule('button[data-close-sheet]::before,\nbutton[data-close-search]::before,\nbutton[data-close-lightups]::before'), /transform:\s*translate\(-50%,\s*-50%\)/);
  assert.match(getRule('.secondary-grid'), /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(getRule('.secondary-grid.trips'), /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(getRule('.secondary-grid.trips .profile-my-trip-card'), /width:\s*100%/);
  assert.match(getRule('.secondary-grid.trips .profile-my-trip-card'), /min-width:\s*0/);
  assert.match(getRule('.secondary-recommend-grid'), /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(getRule('.search-sheet'), /width:\s*min\(100vw,\s*var\(--phone-max-width\)\)/);
  assert.match(getRule('.search-sheet'), /grid-template-rows:\s*auto auto auto minmax\(0,\s*1fr\)/);
  assert.match(getRule('.search-results'), /overflow-y:\s*auto/);
  assert.match(getRule('.purchase-sheet'), /top:\s*50%/);
  assert.match(getRule('.purchase-sheet'), /bottom:\s*auto/);
  assert.match(getRule('.purchase-sheet'), /width:\s*min\(calc\(100vw - \(var\(--phone-gutter\) \* 2\)\),\s*318px\)/);
  assert.match(getRule('.purchase-sheet'), /height:\s*auto/);
  assert.match(getRule('.purchase-sheet'), /overflow-y:\s*auto/);
  assert.match(getRule('.global-lightup-panel'), /top:\s*auto/);
  assert.match(getRule('.global-lightup-panel'), /bottom:\s*0/);
  assert.match(getRule('.global-lightup-panel'), /width:\s*min\(100vw,\s*var\(--phone-max-width\)\)/);
  assert.match(getRule('.global-lightup-panel'), /max-width:\s*var\(--phone-max-width\)/);
  assert.match(getRule('.global-lightup-panel'), /height:\s*var\(--sheet-fixed-height\)/);
  assert.match(getRule('.global-lightup-panel'), /border-radius:\s*var\(--reds-radius-large\) var\(--reds-radius-large\) 0 0/);
  assert.match(getRule('.global-lightup-panel'), /animation:\s*redsSheetUp 240ms cubic-bezier\(0\.2,\s*0\.8,\s*0\.2,\s*1\) both/);
  assert.doesNotMatch(css, /#screen:has\(\.global-lightup-panel\)\s*\{[\s\S]*?padding-(?:left|right):/);
  assert.match(getRule('.phone-shell:has(.global-lightup-panel)'), /margin-left:\s*auto/);
  assert.match(getRule('.phone-shell:has(.global-lightup-panel)'), /margin-right:\s*auto/);
  assert.match(getRule('.global-lightup-groups'), /overflow-y:\s*auto/);
  assert.match(getRule('.global-lightup-photo-card'), /width:\s*100%/);
});

test('profile trips sheet hides the visible scrollbar and centers its card grid', () => {
  assert.match(getRule('.secondary-sheet-profile-trips .secondary-body'), /scrollbar-width:\s*none/);
  assert.match(getRule('.secondary-sheet-profile-trips .secondary-body::-webkit-scrollbar'), /display:\s*none/);
  assert.match(getRule('.secondary-sheet-profile-trips .secondary-grid.trips'), /width:\s*100%/);
  assert.match(getRule('.secondary-sheet-profile-trips .secondary-grid.trips'), /max-width:\s*var\(--phone-content-width\)/);
  assert.match(getRule('.secondary-sheet-profile-trips .secondary-grid.trips'), /margin-left:\s*auto/);
  assert.match(getRule('.secondary-sheet-profile-trips .secondary-grid.trips'), /margin-right:\s*auto/);
});

test('same-view half-layer toggles preserve the background scroll position', () => {
  assert.match(app, /function getScrollSnapshot\(\) \{/);
  assert.match(app, /function restoreScrollAfterSameViewRender\(shouldRestoreScroll,\s*snapshot\) \{/);
  assert.match(app, /const \{ restoreSameViewScroll = true \} = options;/);
  assert.match(app, /const shouldRestoreScroll = restoreSameViewScroll && viewKey === lastViewKey;/);
  assert.match(app, /const scrollSnapshot = getScrollSnapshot\(\);/);
  assert.match(app, /restoreScrollAfterSameViewRender\(shouldRestoreScroll,\s*scrollSnapshot\);/);
});

test('share preview card uses an existing image background', () => {
  assert.match(getRule('.secondary-share-card'), /figma-ai-result\/result-bg\.png/);
  assert.doesNotMatch(css, /figma-seed-home\/hero\.png/);
});

test('global lightup more expands in place instead of opening another sheet', () => {
  assert.match(app, /function globalLightupGroup\(group\)/);
  assert.match(app, /data-toggle-lightup-kind="\$\{group\.kind\}"/);
  assert.match(app, /state\.lightupExpandedKinds = state\.lightupExpandedKinds\.includes\(kind\)/);
  assert.doesNotMatch(app, /data-open-sheet="lightup-\$\{group\.kind\}"/);
});

test('global lightup scenic card uses existing seed hero asset', () => {
  assert.match(app, /title:\s*'葛仙村 · 千灯入夜'[\s\S]*?image:\s*seedHeroImageSrc\('hero-1'\)/);
  assert.doesNotMatch(app, /figma-seed-home\/hero\.png/);
});
