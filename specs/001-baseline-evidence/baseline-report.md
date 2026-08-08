# تقرير خط الأساس وخريطة الموجود والأدلة — HDL-01

**الحالة**: `accepted` — اجتاز التقرير بطارية التحقق V1–V21 ومقارنة البصمات T067 والمراجعة النهائية (`STATUS: PASS`، `BLOCKERS: 0`)، واعتمده المالك ياسر صراحة بعبارة `ACCEPT HDL-01` بتاريخ 2026-08-08 (T073، `data-model.md` §Report lifecycle).

---

## Header

| الحقل | القيمة |
|---|---|
| `baseline_sha` | `66b7b69e3117235c8a614a0502de21ca928e227e` (SHA-40 كامل، مطابق لمخرجات `git rev-parse HEAD` وقت القياس) |
| `branch` | `codex/hdl-01-baseline-evidence` |
| `comparator_ref` / `comparator_sha` | `origin/master` / `833f19d0` — الأمر `git rev-list --left-right --count origin/master...HEAD` أعطى `0 38` (متقدم 38، غير متأخر بشيء) |
| `measurement_date` | `2026-08-08` (تاريخ مطلق؛ أُعيد تشغيل أوامر الإثبات في نفس اليوم على نفس الالتزام) |
| `figma_reference` | ملف `12z0jRutTHcdhlZQrRmcXU`، الصفحة `00 · HDL-01 Baseline & Evidence` (`359:2`)، اللوحة `HDL-01 / Board / Rev 1` (`359:3`)، Revision 1 — معتمدة من ياسر بعبارة `APPROVE HDL-01 REV 1` بتاريخ 2026-08-08 |
| `tooling_versions` | Node `v26.5.0` (`node --version`)، pnpm `10.33.0` (`pnpm --version`)، Salla CLI `3.2.45` (`salla --version`)، Spec Kit `0.16.1` (`specify --version`) — كلها أُعيد تشغيلها وأعادت القيم نفسها عند `66b7b69e3117235c8a614a0502de21ca928e227e` بتاريخ 2026-08-08، ومدوَّنة أصلًا في `.specify/.runtime/hadeel-night-run.md` (16:50 +03) |
| أمر إثبات الالتزام | `git rev-parse HEAD` → `66b7b69e3117235c8a614a0502de21ca928e227e` |
| أمر إثبات الريموت | `git remote -v \| grep upstream` → `upstream https://github.com/SallaApp/theme-raed.git` |

**بيان الصلاحية**: كل رقم في هذا التقرير دليل على الالتزام `66b7b69e3117235c8a614a0502de21ca928e227e` **فقط**، وتنتهي صلاحيته كدليل عند أول تعديل مصدر بعده (`spec.md` §12، `data-model.md` §0). التحديث يكون بإعادة تشغيل الأوامر نفسها في `quickstart.md` §2 واستبدال الأرقام والـSHA — لا بتصحيح الأرقام في مكانها.

**بيان النطاق**: نافذة تنفيذ Kimi K3 High (T011–T045) تُنشئ وتعدّل ملفًا واحدًا فقط هو `specs/001-baseline-evidence/baseline-report.md`. لا يُنشأ ولا يُعدَّل ولا يُنقل ولا يُحذف أي ملف تحت `src/` أو `public/` أو `twilight.json` أو `src/locales/*.json` أو `package.json` أو `pnpm-lock.yaml` أو `ROADMAP.md` أو `docs/spec-kit/spec-index.json` أو `AGENTS.md` أو `spec.md` أو `design.md` (invariant I-3). سجل التشغيل `.specify/.runtime/hadeel-night-run.md` قد يُلحقه **المنسّق فقط خارج هذه النافذة** عند T009 وT074؛ أي تعديل داخل النافذة يُسقِط الميزة عند مقارنة T067.

---
## HDL-01-FR-001 — سجل القدرات وتصنيف الـ29

### أولًا: تصنيف صفوف ROADMAP.md الـ29

**القاعدة المرتبة المطبقة** (`research.md` R-002، قواعد R1.1–R1.3): Spike أولًا إن كانت القدرة الجوهرية للصف تعتمد على سلوك سلة غير مؤكد يجب حسمه قبل التخطيط أصلًا؛ ثم `Existing — Audit & Polish` إن وُجد تنفيذ مسؤول عن القدرة الجوهرية في `src/` عند `66b7b69e3117235c8a614a0502de21ca928e227e`؛ ثم `Build`؛ و`Deferred` فقط حيث يضعها أثر حاكم خارج الإصدار (لا يوجد صف كذلك عند خط الأساس — القاعدة 4 غير مطبقة على أي صف). التصنيف يُقرَّر على القدرة **الجوهرية** لا على اكتمال كل بند فرعي.

**أدلة الإنتاج**: محتوى `ROADMAP.md` — عدد الصفوف مقاس بالأمر `grep -cE '^\| HDL-[0-9]{2} ' ROADMAP.md` → `29` صفًا `HDL-01`…`HDL-29` (عند `66b7b69e3117235c8a614a0502de21ca928e227e`) — وقيم `docs/spec-kit/spec-index.json` المقروءة بأمر `node -e "const j=require('./docs/spec-kit/spec-index.json'); for (const f of j.features) console.log(f.id+' | '+f.classification)"` وملخَّصة بالأمر `node -e "const j=require('./docs/spec-kit/spec-index.json');const c=j.features.map(f=>f.classification);console.log('compound',c.filter(x=>x.includes('+')).length,'+Build only',c.filter(x=>x==='Existing — Audit & Polish + Build').length,'+Build+Spike',c.filter(x=>x==='Existing — Audit & Polish + Build + Spike').length)"` → `compound 18 +Build only 15 +Build+Spike 3` (عند `66b7b69e3117235c8a614a0502de21ca928e227e`). عمود «التصنيف الأساسي» أحادي القيمة دائمًا (R1.2)؛ وعمود «تصنيف spec-index» ينقل القيمة **حرفيًا كما هي في الملف** لغرض توثيق التباين فقط (R1.6)، ولا يُعدَّل ملف `docs/spec-kit/spec-index.json` في HDL-01 إطلاقًا.

| # | ID | المواصفة | المرحلة | التصنيف الأساسي (واحد فقط) | تصنيف `spec-index` (حرفي) | divergence | `source_location` | `expected_evidence` | `dependencies` |
|---|---|---|---|---|---|---|---|---|---|
| 1 | HDL-01 | خط الأساس وخريطة الموجود والأدلة | المرحلة 0 — الأساس | Existing — Audit & Polish | Existing — Audit & Polish | لا | `specs/001-baseline-evidence/` | invisible | — |
| 2 | HDL-02 | نظام تصميم Figma وبوابة الموافقة البصرية | المرحلة 0 — الأساس | Build | Build | لا | — (صف Build بلا تنفيذ حالي؛ المرجع ملف Figma `12z0jRutTHcdhlZQrRmcXU`) | visual | HDL-01 |
| 3 | HDL-03 | هندسة الإعدادات ومحرك التصميمات الجاهزة | المرحلة 0 — الأساس | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `twilight.json` (45 سجل إعداد) | behavioral | HDL-01, HDL-02 |
| 4 | HDL-04 | العربية والإنجليزية وRTL/LTR وإمكانية الوصول | المرحلة 0 — الأساس | Existing — Audit & Polish | Existing — Audit & Polish | لا | `src/locales/ar.json`, `src/locales/en.json` (86/86 مفتاحًا) | visual | HDL-01, HDL-02 |
| 5 | HDL-05 | الأداء وحجم الحزمة وبوابات CI | المرحلة 0 — الأساس | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `scripts/check-theme.mjs`, `.github/workflows/verify-production-bundle.yml` | performance | HDL-01 |
| 6 | HDL-06 | نظام الحركة بثلاثة مستويات | المرحلة 0 — الأساس | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `src/assets/js/` (حزمة animejs مستخدمة), `src/assets/styles/` | behavioral | HDL-02, HDL-03, HDL-05 |
| 7 | HDL-07 | الهيدر بأربعة تخطيطات | المرحلة 1 — النواة التجارية المشتركة | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `src/views/components/header/header.twig`, إعداد `header_layout` | visual | HDL-02, HDL-03, HDL-04, HDL-05, HDL-06 |
| 8 | HDL-08 | القائمة البسيطة وMega Menu وقائمة الجوال | المرحلة 1 — النواة التجارية المشتركة | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `src/assets/js/partials/main-menu.js` | behavioral | HDL-07, HDL-03, HDL-04, HDL-05 |
| 9 | HDL-09 | بحث Drawer مباشر واقتراحات ونتائج | المرحلة 1 — النواة التجارية المشتركة | Existing — Audit & Polish | Existing — Audit & Polish + Build + Spike | نعم | `src/views/components/header/header.twig` (بحث `salla-search`) | behavioral | HDL-02, HDL-03, HDL-04, HDL-05, HDL-07 |
| 10 | HDL-10 | بطاقات المنتجات والشراء والمعاينة السريعة | المرحلة 1 — النواة التجارية المشتركة | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `src/assets/js/partials/product-card.js` (يعرّف `custom-salla-product-card`) | visual | HDL-02, HDL-03, HDL-04, HDL-05, HDL-06 |
| 11 | HDL-11 | سلوك الإضافة وCart Drawer وصفحة السلة | المرحلة 1 — النواة التجارية المشتركة | Existing — Audit & Polish | Existing — Audit & Polish | لا | `src/assets/js/cart.js`, `src/assets/js/partials/add-product-toast.js`, `src/views/pages/cart.twig` | behavioral | HDL-03, HDL-04, HDL-05, HDL-10 |
| 12 | HDL-12 | شريط الجوال السفلي وتنسيق العناصر الثابتة | المرحلة 1 — النواة التجارية المشتركة | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | إعداد `show_mobile_toolbar` في `twilight.json` | visual | HDL-03, HDL-04, HDL-05, HDL-07, HDL-09, HDL-11 |
| 13 | HDL-13 | الفوتر بثلاثة إلى أربعة أشكال | المرحلة 1 — النواة التجارية المشتركة | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `src/views/components/footer/footer.twig` | visual | HDL-02, HDL-03, HDL-04, HDL-05 |
| 14 | HDL-14 | Hero والسلايدر والصورة والفيديو الرئيسي | المرحلة 2 — مكونات الرئيسية | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `src/views/components/home/enhanced-slider.twig`, `src/views/components/home/photos-slider.twig` | visual | HDL-02, HDL-03, HDL-04, HDL-05, HDL-06, HDL-07 |
| 15 | HDL-15 | أقسام عرض المنتجات في الرئيسية | المرحلة 2 — مكونات الرئيسية | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `src/views/components/home/featured-products-style1.twig` وشقيقاتها style2/style3، `products-slider.twig` | visual | HDL-02, HDL-03, HDL-04, HDL-05, HDL-06, HDL-10 |
| 16 | HDL-16 | التصنيفات والماركات والروابط السريعة | المرحلة 2 — مكونات الرئيسية | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `src/views/components/home/brands.twig`, `main-links.twig`, `square-photos.twig` | visual | HDL-02, HDL-03, HDL-04, HDL-05 |
| 17 | HDL-17 | مكونات المحتوى والعروض والثقة في الرئيسية | المرحلة 2 — مكونات الرئيسية | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `src/views/components/home/store-features.twig`, `fixed-banner.twig`, `testimonials.twig`, `youtube.twig` | visual | HDL-02, HDL-03, HDL-04, HDL-05, HDL-06 |
| 18 | HDL-18 | صفحة المنتج بثلاثة تخطيطات | المرحلة 3 — المنتج والكتالوج | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `src/views/pages/product/single.twig` | visual | HDL-02, HDL-03, HDL-04, HDL-05, HDL-06, HDL-10 |
| 19 | HDL-19 | معرض صور وفيديو المنتج | المرحلة 3 — المنتج والكتالوج | Existing — Audit & Polish | Existing — Audit & Polish + Build + Spike | نعم | `src/views/pages/product/single.twig` (معرض الصور), إعداد `imageZoom` | behavioral | HDL-18, HDL-04, HDL-05, HDL-06 |
| 20 | HDL-20 | خيارات المنتج والشراء الثابت وتجربة المنتجات الرقمية | المرحلة 3 — المنتج والكتالوج | Existing — Audit & Polish | Existing — Audit & Polish + Build + Spike | نعم | `src/views/pages/partials/product/options.twig`, إعداد `sticky_add_to_cart` | behavioral | HDL-18, HDL-19, HDL-10, HDL-11, HDL-03, HDL-04, HDL-05 |
| 21 | HDL-21 | صفحة التصنيف والفلترة والكتالوج | المرحلة 3 — المنتج والكتالوج | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `src/views/pages/product/index.twig`, `src/assets/js/products.js` (`salla-filters`) | visual | HDL-02, HDL-03, HDL-04, HDL-05, HDL-10 |
| 22 | HDL-22 | SEO والبنية الدلالية والـBreadcrumbs | المرحلة 3 — المنتج والكتالوج | Existing — Audit & Polish | Existing — Audit & Polish | لا | `src/views/layouts/master.twig`, وسوم `salla-breadcrumb` في القوالب | source-code | HDL-04, HDL-05, HDL-14, HDL-18, HDL-21 |
| 23 | HDL-23 | الصفحات المساندة والمتجر الكامل | المرحلة 3 — المنتج والكتالوج | Existing — Audit & Polish | Existing — Audit & Polish + Build | نعم | `src/views/pages/` (blog, brands, customer, loyalty, page-single, thank-you, landing-page) | visual | HDL-02, HDL-03, HDL-04, HDL-05, HDL-07, HDL-13, HDL-22 |
| 24 | HDL-24 | Preset فاخر وأنيق — ديمو العطور والمنتجات الراقية | المرحلة 4 — التصميمات الجاهزة | Build | Build | لا | — (صف Build؛ لا Preset موجودًا اليوم) | visual | HDL-03, HDL-06, HDL-07, HDL-08, HDL-09, HDL-10, HDL-11, HDL-13, HDL-14, HDL-15, HDL-16, HDL-17, HDL-18, HDL-19, HDL-20, HDL-21, HDL-23 |
| 25 | HDL-25 | Preset عصري وحيوي — ديمو الأزياء والجمال | المرحلة 4 — التصميمات الجاهزة | Build | Build | لا | — (صف Build) | visual | HDL-24, HDL-03, HDL-07, HDL-10, HDL-14, HDL-18, HDL-21 |
| 26 | HDL-26 | Preset بسيط وهادئ — ديمو المنزل والديكور | المرحلة 4 — التصميمات الجاهزة | Build | Build | لا | — (صف Build) | visual | HDL-24, HDL-25, HDL-03, HDL-07, HDL-10, HDL-14, HDL-18, HDL-21 |
| 27 | HDL-27 | Preset عملي وتقني — ديمو الاشتراكات والبطاقات الرقمية | المرحلة 4 — التصميمات الجاهزة | Build | Build | لا | — (صف Build) | visual | HDL-24, HDL-25, HDL-26, HDL-03, HDL-07, HDL-09, HDL-10, HDL-11, HDL-18, HDL-20, HDL-21 |
| 28 | HDL-28 | تهيئة التاجر والديموهات وتجهيز صفحة سوق سلة | المرحلة 5 — الإطلاق | Build | Build | لا | — (صف Build) | visual | HDL-23, HDL-24, HDL-25, HDL-26, HDL-27, HDL-03 |
| 29 | HDL-29 | التقوية والاختبارات والإطلاق المرحلي | المرحلة 5 — الإطلاق | Build | Build | لا | — (صف Build؛ يملك بوابة `HDL-29-FR-011`) | performance | HDL-01, HDL-02, HDL-03, HDL-04, HDL-05, HDL-06, HDL-07, HDL-08, HDL-09, HDL-10, HDL-11, HDL-12, HDL-13, HDL-14, HDL-15, HDL-16, HDL-17, HDL-18, HDL-19, HDL-20, HDL-21, HDL-22, HDL-23, HDL-24, HDL-25, HDL-26, HDL-27, HDL-28 |

**قراءة الجدول**: 29/29 صفًا مصنفة، كل صف بتصنيف أساسي واحد بالضبط (R1.1، R1.2، V3، V5): **22 × `Existing — Audit & Polish`** (القاعدة 2) و**7 × `Build`** (القاعدة 3: HDL-02, HDL-24, HDL-25, HDL-26, HDL-27, HDL-28, HDL-29)، و0 × `Spike` و0 × `Deferred` على مستوى التصنيف الأساسي. الملخّص مقاس من الجدول نفسه بالأمر `awk -F'|' '$2 ~ /^[[:space:]]*[0-9]+[[:space:]]*$/ && $3 ~ /HDL-[0-9][0-9]/ {p=$6; gsub(/^[[:space:]]+|[[:space:]]+$/,"",p); c[p]++} END {for (k in c) print c[k], k}' specs/001-baseline-evidence/baseline-report.md` → `22 Existing — Audit & Polish` و`7 Build` (عند `66b7b69e3117235c8a614a0502de21ca928e227e`). الـ18 صفًا ذات `divergence = نعم` تظهر مجتمعة كفرق مفتوح واحد في قسم «فروق مفتوحة» (الفرق رقم 2، R1.6)، وملف `docs/spec-kit/spec-index.json` غير معدَّل. لا صف بلا `expected_evidence` (R1.5)، ولا صف مؤجل بلا أثر حاكم (R1.4).
### ثانيًا: سجل المستودع الشامل (RepositoryInventoryRecord — 87 سجلًا)

أربع مجموعات مصدر موضوعية (R1A.1–R1A.4، invariant I-9). كل جدول مسبوق بالأمر المنتِج له، وكلها مُشغَّلة عند `66b7b69e3117235c8a614a0502de21ca928e227e` بتاريخ 2026-08-08. لا خلية فارغة في الحالة أو المصدر أو المسؤولية (R1A.3).

**الجدول 1 من 4 — قوالب الصفحات (21 سجلًا)**. الأمر المنتِج: `find src/views/pages -type f -name "*.twig" | sort | sed 's#^#page:#'` → 21 مفتاحًا عند `66b7b69e3117235c8a614a0502de21ca928e227e`.

| `record_key` | kind | source_location | current_state | responsibility_owner |
|---|---|---|---|---|
| `page:src/views/pages/blog/index.twig` | page-template | `src/views/pages/blog/index.twig` | present | HDL-23 |
| `page:src/views/pages/blog/single.twig` | page-template | `src/views/pages/blog/single.twig` | present | HDL-23 |
| `page:src/views/pages/brands/index.twig` | page-template | `src/views/pages/brands/index.twig` | present | HDL-23 |
| `page:src/views/pages/brands/single.twig` | page-template | `src/views/pages/brands/single.twig` | present | HDL-23 |
| `page:src/views/pages/cart.twig` | page-template | `src/views/pages/cart.twig` | present | HDL-11 |
| `page:src/views/pages/customer/notifications.twig` | page-template | `src/views/pages/customer/notifications.twig` | present | HDL-23 |
| `page:src/views/pages/customer/orders/index.twig` | page-template | `src/views/pages/customer/orders/index.twig` | present | HDL-23 |
| `page:src/views/pages/customer/orders/single.twig` | page-template | `src/views/pages/customer/orders/single.twig` | present | HDL-23 |
| `page:src/views/pages/customer/profile.twig` | page-template | `src/views/pages/customer/profile.twig` | present | HDL-23 |
| `page:src/views/pages/customer/wallet.twig` | page-template | `src/views/pages/customer/wallet.twig` | present | HDL-23 |
| `page:src/views/pages/customer/wishlist.twig` | page-template | `src/views/pages/customer/wishlist.twig` | present | HDL-23 |
| `page:src/views/pages/index.twig` | page-template | `src/views/pages/index.twig` | present | HDL-14 |
| `page:src/views/pages/landing-page.twig` | page-template | `src/views/pages/landing-page.twig` | present | HDL-23 |
| `page:src/views/pages/loyalty.twig` | page-template | `src/views/pages/loyalty.twig` | present | HDL-23 |
| `page:src/views/pages/page-single.twig` | page-template | `src/views/pages/page-single.twig` | present | HDL-23 |
| `page:src/views/pages/partials/product/options.twig` | page-template | `src/views/pages/partials/product/options.twig` | present | HDL-20 |
| `page:src/views/pages/partials/product/reservations.twig` | page-template | `src/views/pages/partials/product/reservations.twig` | present | HDL-20 |
| `page:src/views/pages/product/index.twig` | page-template | `src/views/pages/product/index.twig` | present | HDL-21 |
| `page:src/views/pages/product/single.twig` | page-template | `src/views/pages/product/single.twig` | present | HDL-18 |
| `page:src/views/pages/testimonials.twig` | page-template | `src/views/pages/testimonials.twig` | present | HDL-17 |
| `page:src/views/pages/thank-you.twig` | page-template | `src/views/pages/thank-you.twig` | present | HDL-11 |

**الجدول 2 من 4 — قوالب المكونات (22 سجلًا)**. الأمر المنتِج: `find src/views/components -type f -name "*.twig" | sort | sed 's#^#component-template:#'` → 22 مفتاحًا عند `66b7b69e3117235c8a614a0502de21ca928e227e`.

| `record_key` | kind | source_location | current_state | responsibility_owner |
|---|---|---|---|---|
| `component-template:src/views/components/category/cover.twig` | component-template | `src/views/components/category/cover.twig` | present | HDL-21 |
| `component-template:src/views/components/footer/footer.twig` | component-template | `src/views/components/footer/footer.twig` | present | HDL-13 |
| `component-template:src/views/components/header/header.twig` | component-template | `src/views/components/header/header.twig` | present | HDL-07 |
| `component-template:src/views/components/home/brands.twig` | component-template | `src/views/components/home/brands.twig` | present | HDL-16 |
| `component-template:src/views/components/home/custom-testimonials.twig` | component-template | `src/views/components/home/custom-testimonials.twig` | present | HDL-17 |
| `component-template:src/views/components/home/enhanced-slider.twig` | component-template | `src/views/components/home/enhanced-slider.twig` | present | HDL-14 |
| `component-template:src/views/components/home/enhanced-square-banners.twig` | component-template | `src/views/components/home/enhanced-square-banners.twig` | present | HDL-17 |
| `component-template:src/views/components/home/featured-products-style1.twig` | component-template | `src/views/components/home/featured-products-style1.twig` | present | HDL-15 |
| `component-template:src/views/components/home/featured-products-style2.twig` | component-template | `src/views/components/home/featured-products-style2.twig` | present | HDL-15 |
| `component-template:src/views/components/home/featured-products-style3.twig` | component-template | `src/views/components/home/featured-products-style3.twig` | present | HDL-15 |
| `component-template:src/views/components/home/fixed-banner.twig` | component-template | `src/views/components/home/fixed-banner.twig` | present | HDL-17 |
| `component-template:src/views/components/home/fixed-products.twig` | component-template | `src/views/components/home/fixed-products.twig` | present | HDL-15 |
| `component-template:src/views/components/home/latest-products.twig` | component-template | `src/views/components/home/latest-products.twig` | present | HDL-15 |
| `component-template:src/views/components/home/main-links.twig` | component-template | `src/views/components/home/main-links.twig` | present | HDL-16 |
| `component-template:src/views/components/home/parallax-background.twig` | component-template | `src/views/components/home/parallax-background.twig` | present | HDL-17 |
| `component-template:src/views/components/home/photos-slider.twig` | component-template | `src/views/components/home/photos-slider.twig` | present | HDL-14 |
| `component-template:src/views/components/home/products-slider.twig` | component-template | `src/views/components/home/products-slider.twig` | present | HDL-15 |
| `component-template:src/views/components/home/slider-products-with-header.twig` | component-template | `src/views/components/home/slider-products-with-header.twig` | present | HDL-15 |
| `component-template:src/views/components/home/square-photos.twig` | component-template | `src/views/components/home/square-photos.twig` | present | HDL-16 |
| `component-template:src/views/components/home/store-features.twig` | component-template | `src/views/components/home/store-features.twig` | present | HDL-17 |
| `component-template:src/views/components/home/testimonials.twig` | component-template | `src/views/components/home/testimonials.twig` | present | HDL-17 |
| `component-template:src/views/components/home/youtube.twig` | component-template | `src/views/components/home/youtube.twig` | present | HDL-17 |

**الجدول 3 من 4 — المكونات المخصصة المعلنة (7 سجلات)**. الأمر المنتِج: `node -e "const j=require('./twilight.json');console.log(j.components.map(x=>'custom-component:'+x.path).sort().join('\\n'))"` → 7 مفاتيح عند `66b7b69e3117235c8a614a0502de21ca928e227e`.

| `record_key` | kind | source_location | current_state | responsibility_owner |
|---|---|---|---|---|
| `custom-component:category.cover` | custom-component | `twilight.json` → `components[].path` = `category.cover`، القالب `src/views/components/category/cover.twig` | present | HDL-21 |
| `custom-component:home.brands` | custom-component | `twilight.json` → `components[].path` = `home.brands`، القالب `src/views/components/home/brands.twig` | present | HDL-16 |
| `custom-component:home.custom-testimonials` | custom-component | `twilight.json` → `components[].path` = `home.custom-testimonials`، القالب `src/views/components/home/custom-testimonials.twig` | present | HDL-17 |
| `custom-component:home.enhanced-slider` | custom-component | `twilight.json` → `components[].path` = `home.enhanced-slider`، القالب `src/views/components/home/enhanced-slider.twig` | present | HDL-14 |
| `custom-component:home.enhanced-square-banners` | custom-component | `twilight.json` → `components[].path` = `home.enhanced-square-banners`، القالب `src/views/components/home/enhanced-square-banners.twig` | present | HDL-17 |
| `custom-component:home.main-links` | custom-component | `twilight.json` → `components[].path` = `home.main-links`، القالب `src/views/components/home/main-links.twig` | present | HDL-16 |
| `custom-component:home.slider-products-with-header` | custom-component | `twilight.json` → `components[].path` = `home.slider-products-with-header`، القالب `src/views/components/home/slider-products-with-header.twig` | present | HDL-15 |

**الجدول 4 من 4 — الإعدادات التفاعلية المهمة (37 سجلًا)**. الأمر المنتِج: `node -e "const j=require('./twilight.json');console.log(j.settings.filter(x=>x.type!=='static').map(x=>'setting:'+x.id).sort().join('\\n'))"` → 37 مفتاحًا عند `66b7b69e3117235c8a614a0502de21ca928e227e`. المعيار الموضوعي للانتقاء: كل سجل في `twilight.json.settings[]` يحقق `type != "static"` — لا انتقاء بالانطباع.

| `record_key` | kind | source_location | current_state | responsibility_owner |
|---|---|---|---|---|
| `setting:announcement_enabled` | important-setting | `twilight.json` → `settings[].id` = `announcement_enabled` | present | HDL-07 |
| `setting:announcement_show_icon` | important-setting | `twilight.json` → `settings[].id` = `announcement_show_icon` | present | HDL-07 |
| `setting:announcement_style` | important-setting | `twilight.json` → `settings[].id` = `announcement_style` | present | HDL-07 |
| `setting:announcement_text` | important-setting | `twilight.json` → `settings[].id` = `announcement_text` | present | HDL-07 |
| `setting:corner_style` | important-setting | `twilight.json` → `settings[].id` = `corner_style` | present | HDL-03 |
| `setting:enable_add_product_toast` | important-setting | `twilight.json` → `settings[].id` = `enable_add_product_toast` | present | HDL-11 |
| `setting:enable_more_menu` | important-setting | `twilight.json` → `settings[].id` = `enable_more_menu` | present | HDL-08 |
| `setting:footer_is_dark` | important-setting | `twilight.json` → `settings[].id` = `footer_is_dark` | present | HDL-13 |
| `setting:footer_show_contacts` | important-setting | `twilight.json` → `settings[].id` = `footer_show_contacts` | present | HDL-13 |
| `setting:footer_show_description` | important-setting | `twilight.json` → `settings[].id` = `footer_show_description` | present | HDL-13 |
| `setting:footer_show_payments` | important-setting | `twilight.json` → `settings[].id` = `footer_show_payments` | present | HDL-13 |
| `setting:footer_show_social` | important-setting | `twilight.json` → `settings[].id` = `footer_show_social` | present | HDL-13 |
| `setting:header_density` | important-setting | `twilight.json` → `settings[].id` = `header_density` | present | HDL-07 |
| `setting:header_is_sticky` | important-setting | `twilight.json` → `settings[].id` = `header_is_sticky` | present | HDL-07 |
| `setting:header_layout` | important-setting | `twilight.json` → `settings[].id` = `header_layout` | present | HDL-07 |
| `setting:header_show_wishlist` | important-setting | `twilight.json` → `settings[].id` = `header_show_wishlist` | present | HDL-07 |
| `setting:imageZoom` | important-setting | `twilight.json` → `settings[].id` = `imageZoom` | present | HDL-19 |
| `setting:is_more_button_enabled` | important-setting | `twilight.json` → `settings[].id` = `is_more_button_enabled` | present | HDL-08 |
| `setting:layout_width` | important-setting | `twilight.json` → `settings[].id` = `layout_width` | present | HDL-03 |
| `setting:product_add_to_cart_animation` | important-setting | `twilight.json` → `settings[].id` = `product_add_to_cart_animation` | present | HDL-11 |
| `setting:product_add_to_cart_animation_interval` | important-setting | `twilight.json` → `settings[].id` = `product_add_to_cart_animation_interval` | present | HDL-11 |
| `setting:product_card_style` | important-setting | `twilight.json` → `settings[].id` = `product_card_style` | present | HDL-10 |
| `setting:product_index_show_breadcrumbs` | important-setting | `twilight.json` → `settings[].id` = `product_index_show_breadcrumbs` | present | HDL-21 |
| `setting:product_installment_enabled` | important-setting | `twilight.json` → `settings[].id` = `product_installment_enabled` | present | HDL-20 |
| `setting:product_installment_show_mispay` | important-setting | `twilight.json` → `settings[].id` = `product_installment_show_mispay` | present | HDL-20 |
| `setting:product_installment_show_tabby` | important-setting | `twilight.json` → `settings[].id` = `product_installment_show_tabby` | present | HDL-20 |
| `setting:product_installment_show_tamara` | important-setting | `twilight.json` → `settings[].id` = `product_installment_show_tamara` | present | HDL-20 |
| `setting:product_show_breadcrumbs` | important-setting | `twilight.json` → `settings[].id` = `product_show_breadcrumbs` | present | HDL-18 |
| `setting:product_show_wishlist` | important-setting | `twilight.json` → `settings[].id` = `product_show_wishlist` | present | HDL-10 |
| `setting:section_spacing` | important-setting | `twilight.json` → `settings[].id` = `section_spacing` | present | HDL-03 |
| `setting:show_mobile_toolbar` | important-setting | `twilight.json` → `settings[].id` = `show_mobile_toolbar` | present | HDL-12 |
| `setting:show_tags` | important-setting | `twilight.json` → `settings[].id` = `show_tags` | present | HDL-18 |
| `setting:slider_background_size` | important-setting | `twilight.json` → `settings[].id` = `slider_background_size` | present | HDL-14 |
| `setting:squar_photo_bg_image_size` | important-setting | `twilight.json` → `settings[].id` = `squar_photo_bg_image_size` | present | HDL-16 |
| `setting:sticky_add_to_cart` | important-setting | `twilight.json` → `settings[].id` = `sticky_add_to_cart` | present | HDL-20 |
| `setting:use_theme_font` | important-setting | `twilight.json` → `settings[].id` = `use_theme_font` | present | HDL-03 |
| `setting:vertical_fixed_products` | important-setting | `twilight.json` → `settings[].id` = `vertical_fixed_products` | present | HDL-15 |

**السجلات المستبعدة — `static_count = 8`**: الأمر المنتِج: `node -e "const j=require('./twilight.json');console.log(j.settings.filter(x=>x.type==='static').length)"` → `8` عند `66b7b69e3117235c8a614a0502de21ca928e227e`، والأمر `node -e "const j=require('./twilight.json');console.log('settings',(j.settings||[]).length,'components',(j.components||[]).length)"` → `settings 45 components 7` (45 = 8 static + 37 تفاعليًا). سبب الاستبعاد الموضوعي (R1A.4): سجلات `type = "static"` الثمانية عناوين وفواصل بنيوية داخل شاشة الإعدادات وليست إعدادات يغيّرها التاجر؛ يُسجَّل عددها وهذا السبب بدل اختيار «الإعدادات المهمة» بالانطباع.

**أعداد الجرد المساندة** (لقسم FR-002 والمخاطر)، كلها عند `66b7b69e3117235c8a614a0502de21ca928e227e`:
`find src/assets/js -name "*.js" | wc -l` → `24`؛
`find src/assets/styles -name "*.scss" | wc -l` → `42`؛
`grep -rhoE '<salla-[a-z0-9-]+' src/ | sort -u | wc -l` → `58` وسم `salla-*` مميزًا؛
`node -e` بعدّ المفاتيح الورقية على `src/locales/ar.json` و`src/locales/en.json` → `ar 86 en 86`. **وإثبات صفر المفاتيح الناقصة لا يُستنتج من تساوي العددين بل يُقاس فرقًا للمجموعتين** بالأمر `node -e "const f=(o,p)=>Object.keys(o).flatMap(k=>typeof o[k]==='object'&&o[k]?f(o[k],p+k+'.'):[p+k]);const a=new Set(f(require('./src/locales/ar.json'),'')),b=new Set(f(require('./src/locales/en.json'),''));console.log('only-ar',[...a].filter(k=>!b.has(k)).length,'only-en',[...b].filter(k=>!a.has(k)).length)"` → `only-ar 0 only-en 0` — تطابق تام للمجموعتين، بلا استدلال من التساوي العددي.

---
## HDL-01-FR-002 — خريطة المصدر إلى المخرجات

**سلطة الربط الوحيدة**: `webpack.config.js:11-24` (مقروءة بالأمر `sed -n '11,24p' webpack.config.js` عند `66b7b69e3117235c8a614a0502de21ca928e227e`) — 12 مدخلًا → 13 مخرجًا (`app` يصدر `app.css` و`app.js` معًا) (R2.2). أحجام المخرجات مقاسة بالأمر `find public -maxdepth 1 -type f \( -name "*.js" -o -name "*.css" \) -exec stat -f "%z %N" {} \; | sort -rn` عند `66b7b69e3117235c8a614a0502de21ca928e227e` بتاريخ 2026-08-08.

### جدول المدخل ← المخرج (12 مدخلًا، 13 مخرجًا)

| مدخل webpack | المصدر (`src/assets/…`) | مخرج `public/` | البايتات عند خط الأساس |
|---|---|---|---|
| `app` | `styles/app.scss`, `js/wishlist.js`, `js/app.js`, `js/blog.js` | `app.css` + `app.js` | 802,732 + 128,388 |
| `product` | `js/product.js`, `js/products.js` | `product.js` | 56,127 |
| `home` | `js/home.js` | `home.js` | 36,947 |
| `product-card` | `js/partials/product-card.js` | `product-card.js` | 31,643 |
| `add-product-toast` | `js/partials/add-product-toast.js` | `add-product-toast.js` | 25,605 |
| `checkout` | `js/cart.js`, `js/thankyou.js` | `checkout.js` | 11,727 |
| `main-menu` | `js/partials/main-menu.js` | `main-menu.js` | 10,421 |
| `testimonials` | `js/testimonials.js` | `testimonials.js` | 9,957 |
| `digital-files` | `js/partials/digital-files.js` | `digital-files.js` | 5,720 |
| `pages` | `js/loyalty.js`, `js/brands.js` | `pages.js` | 5,284 |
| `wishlist-card` | `js/partials/wishlist-card.js` | `wishlist-card.js` | 5,142 |
| `order` | `js/order.js` | `order.js` | 3,389 |

### جدول القدرات المغلق — 14 سجلًا بالضبط (R2.6، invariant I-4)

الأعمدة: القدرة | مسارات المصدر تحت `src/` | مدخل webpack | مخرج `public/` أو السبب الصريح | البايتات | التصنيف (يطابق `primary_classification` للمواصفة المالكة) | مكونات `salla-*` المعتمدة (مقاسة بـ`grep -oE 'salla-[a-z0-9-]+'` على ملفات المصدر عند `66b7b69e3117235c8a614a0502de21ca928e227e`). التصنيف في كل السجلات `Existing — Audit & Polish` لأن المواصفات المالكة (HDL-04…HDL-23) كلها مصنفة أساسًا كذلك في جدول FR-001 (I-4).

| # | capability | source_paths | webpack_entry | public_output | output_bytes | classification | salla_components |
|---|---|---|---|---|---|---|---|
| 1 | `app` — النواة المشتركة (الأنماط الكاملة + سكربتات عامة) | `src/assets/styles/app.scss`, `src/assets/js/wishlist.js`, `src/assets/js/app.js`, `src/assets/js/blog.js` | `app` | `public/app.css` + `public/app.js` | 802,732 + 128,388 | Existing — Audit & Polish | `salla-add-product-button`, `salla-cart-summary`, `salla-modal-body`, `salla-modal-overlay` |
| 2 | `home` — سكربت الرئيسية | `src/assets/js/home.js` | `home` | `public/home.js` | 36,947 | Existing — Audit & Polish | — (لا وسم في هذا الملف) |
| 3 | `product-card` — بطاقة المنتج (Product Card) | `src/assets/js/partials/product-card.js` | `product-card` | `public/product-card.js` | 31,643 | Existing — Audit & Polish | `salla-product-card`, `salla-add-product-button`, `salla-button`, `salla-count-down`, `salla-modal`, `salla-product-options`, `salla-progress-bar` |
| 4 | `main-menu` — القائمة الرئيسية | `src/assets/js/partials/main-menu.js` | `main-menu` | `public/main-menu.js` | 10,421 | Existing — Audit & Polish | `salla-menu`, `salla-products-list` |
| 5 | `wishlist-card` — بطاقة المفضلة | `src/assets/js/partials/wishlist-card.js` | `wishlist-card` | `public/wishlist-card.js` | 5,142 | Existing — Audit & Polish | `salla-add-product-button`, `salla-button` |
| 6 | `add-product-toast` — رسالة الإضافة وسلوك Cart Drawer | `src/assets/js/partials/add-product-toast.js` | `add-product-toast` | `public/add-product-toast.js` | 25,605 | Existing — Audit & Polish | `salla-button`, `salla-cart-summary`, `salla-drawer`, `salla-hadeel-cart-drawer`, `salla-quantity-input`, `salla-skeleton` |
| 7 | `digital-files` — الملفات الرقمية | `src/assets/js/partials/digital-files.js` | `digital-files` | `public/digital-files.js` | 5,720 | Existing — Audit & Polish | — (لا وسم في هذا الملف) |
| 8 | `checkout` — صفحة السلة والشكر | `src/assets/js/cart.js`, `src/assets/js/thankyou.js` | `checkout` | `public/checkout.js` | 11,727 | Existing — Audit & Polish | `salla-gifting` |
| 9 | `pages` — الولاء والماركات | `src/assets/js/loyalty.js`, `src/assets/js/brands.js` | `pages` | `public/pages.js` | 5,284 | Existing — Audit & Polish | — (لا وسم في هذين الملفين) |
| 10 | `product` — صفحة المنتج والكتالوج | `src/assets/js/product.js`, `src/assets/js/products.js` | `product` | `public/product.js` | 56,127 | Existing — Audit & Polish | `salla-add-product-button`, `salla-installment`, `salla-modal`, `salla-products-slider`, `salla-slider`, `salla-drawer`, `salla-filters`, `salla-products-list` |
| 11 | `order` — صفحة الطلب | `src/assets/js/order.js` | `order` | `public/order.js` | 3,389 | Existing — Audit & Polish | `salla-button` |
| 12 | `testimonials` — الآراء | `src/assets/js/testimonials.js` | `testimonials` | `public/testimonials.js` | 9,957 | Existing — Audit & Polish | `salla-comments` |
| 13 | `twig-templates` — كل القوالب (الهيدر، البحث، الفوتر، الصفحات) | `src/views/**/*.twig` (21 قالب صفحة + 22 قالب مكون + `src/views/layouts/master.twig` و`customer.twig`) | — | no `public/` output — rendered server-side by Salla | — | Existing — Audit & Polish | 58 وسم `salla-*` مميزًا عبر `src/` (منها `salla-search`, `salla-user-menu`, `salla-breadcrumb`, `salla-slider`, `salla-products-list`, `salla-loyalty`, `salla-wallet`) |
| 14 | `locales` — الترجمات | `src/locales/ar.json`, `src/locales/en.json` (86/86 مفتاحًا) | — | no `public/` output — merged by Salla at publish time | — | Existing — Audit & Polish | — |

**قواعد القراءة**: السجلان 13 و14 لا يُنتجان ملفًا في `public/` والسبب صريح في الخلية نفسها — القوالب تُصيَّر من خوادم سلة، والترجمات تُدمج وقت النشر — فلا خلية فارغة (R2.1، R2.5). `public/` مخرج بناء مولَّد ولا يُعدَّل يدويًا إطلاقًا (`AGENTS.md` القاعدة 1)؛ التغيير يكون في `src/` ثم يُعاد البناء. هذا الجدول **يصف الموجود فقط ولا يصف أي تعديل**؛ قرار التغيير مملوك للمواصفة المالكة (R2.4، FR-007).

**بحث القدرة الواحدة (اختبار US2)**: من يسأل عن **Cart Drawer** يجد السجلين 6 و8 (المصدر، المخرج، 25,605 + 11,727 بايت، التصنيف)؛ وعن **Product Card** يجد السجل 3؛ وعن **Header/Search** يجد السجل 13 بمساره `src/views/components/header/header.twig` والوسم `salla-search` — بلا خلايا فارغة وبلا أي توجيه لتعديل `public/` يدويًا.

### التوفيق مع إجمالي `public/` (R2.3، invariant I-6)

عند `66b7b69e3117235c8a614a0502de21ca928e227e`، وبنفس أمر القياس `find public -type f -exec stat -f "%z" {} \; | awk '{s+=$1} END {print s}'` → `1557969`:

| المكوّن | البايتات | الأمر المنتِج |
|---|---|---|
| 12 حزمة JS مجتمعة | 330,350 | جمع مخرجات `find public -maxdepth 1 -type f \( -name "*.js" -o -name "*.css" \) -exec stat -f "%z %N" {} \;` |
| `app.css` | 802,732 | نفس الأمر |
| 5 ملفات خطوط Thmanyah `.woff2` | 385,492 | `find public/images/fonts -type f -exec stat -f "%z" {} \; \| awk '{s+=$1} END {print s}'` |
| الباقي (رخص + صور) | ≈ 39,395 | الفرق المحسوب من الإجمالي 1,557,969 |
| **الإجمالي** | **1,557,969** | `find public -type f -exec stat -f "%z" {} \; \| awk '{s+=$1} END {print s}'` |

330,350 + 802,732 + 385,492 + 39,395 = 1,557,969 — التوفيق تام عند `66b7b69e3117235c8a614a0502de21ca928e227e`.

---
## HDL-01-FR-003 — نتائج البناء والفحص

الأرقام منقولة **حرفيًا كما طبعها الأداة** قبل أي تأويل (R3.1)، وكل سجل يحمل الأمر + SHA + تاريخ التشغيل + حالة الخروج + عدد الأخطاء والتحذيرات الحرفي (R3.2). جميعها على `66b7b69e3117235c8a614a0502de21ca928e227e`.

### سجل 1 — الحارس الساكن

- **command**: `node scripts/check-theme.mjs --json`
- **sha**: `66b7b69e3117235c8a614a0502de21ca928e227e` · **run_date**: `2026-08-08 16:52 +03` (تشغيل خط الأساس المدوَّن في `.specify/.runtime/hadeel-night-run.md` عند الالتزام نفسه)
- **تحقق لاحق مميَّز**: أُعيد تشغيل الأمر نفسه داخل نافذة تنفيذ HDL-01 مساء 2026-08-08 (+03) فأعاد المخرجات نفسها حرفيًا (`0`/`0` والفحوص الخمسة `ok`) — إعادة التحقق منفصلة عن تشغيل خط الأساس المدوَّن ومذكورة صراحة كي لا يُخلط بينهما
- **exit_status**: success (`EXIT=0`)
- **errors**: `0` · **warnings**: `0`
- **key_outputs**: الفحوص الساكنة الخمسة كلها `ok` — `duplicate-selectors` («no selector is split across component files»)، `hardcoded-arabic` («no hardcoded Arabic outside src/locales»)، `dead-classes` («every theme class in SCSS is rendered somewhere»)، `css-variables` («every referenced custom property is defined»)، `theme-settings` («every setting read by a template is declared in twilight.json»).

### سجل 2 — حارس مزامنة البناء

- **command**: `node scripts/check-theme.mjs --build --json`
- **sha**: `66b7b69e3117235c8a614a0502de21ca928e227e` · **run_date**: `2026-08-08 16:52 +03` (تشغيل خط الأساس المدوَّن في `.specify/.runtime/hadeel-night-run.md` عند الالتزام نفسه)
- **تحقق لاحق مميَّز**: أُعيد تشغيل الأمر نفسه داخل نافذة تنفيذ HDL-01 مساء 2026-08-08 (+03) فأعاد المخرجات نفسها حرفيًا (`0`/`0` و`build-sync` ok) — إعادة تحقق منفصلة عن تشغيل خط الأساس المدوَّن
- **exit_status**: success (`EXIT=0`)
- **errors**: `0` · **warnings**: `0`
- **key_outputs**: الفحوص الخمسة نفسها `ok`، إضافة إلى `build-sync` = «public/ matches a fresh production build». الأمر آمن بذاته: يبني داخل `mkdtempSync(tmpdir(), 'hadeel-build-')` عبر `--output-path` (`scripts/check-theme.mjs:319-321`) ويقارن البصمات فقط، فلا يكتب شيئًا في `public/`.

### سجل 3 — بناء الإنتاج

- **command**: `npx webpack --mode production`
- **sha**: `66b7b69e3117235c8a614a0502de21ca928e227e` · **run_date**: 2026-08-08 16:52 +03 (مدوَّن في `.specify/.runtime/hadeel-night-run.md` عند الالتزام نفسه)
- **exit_status**: success
- **errors**: `0` · **warnings**: **3 تحذيرات أداء** (webpack performance warnings)
- **duration**: `22.437s`
- **key_outputs**: `app.css` = 784 KiB، `app.js` = 125 KiB، مدخل `app` المشترك = 909 KiB (إشارة أداة بناء وليست حد منصة — build-tool signal, not a platform limit).

### إفصاح الاستبدال (R3.4، research.md R-003)

أرقام سجل 3 منقولة عن تشغيل فعلي نُفِّذ على هذا الـSHA نفسه (2026-08-08 16:52 +03، مدوَّن في `.specify/.runtime/hadeel-night-run.md`). **لم يُعَد تشغيل `npx webpack --mode production` المجرد إطلاقًا داخل نافذة تنفيذ/تحقق HDL-01**؛ لأن التشغيل المجرد يمسح `public/` ويعيد كتابتها (`webpack.config.js:25-29`، `output.clean: true`)، وهذا محظور في HDL-01. صيغة إعادة الإنتاج الآمنة هي:

```bash
npx webpack --mode production --output-path "$(mktemp -d)"
```

وصحّة الأرقام المنقولة مؤيدة مستقلًا بسجل 2 الذي يقرر أن `public/` الحالية مطابقة لبناء إنتاج جديد عند الالتزام نفسه. الزمن `22.437s` يتغير من آلة لآلة؛ أرقام البايتات هي ما يجب أن يتطابق عند إعادة التشغيل.

أي تعارض بين وثائق المستودع وهذه النتائج المقاسة مسجَّل في قسم «فروق مفتوحة» ولم يُصلَّح هنا (R3.3، FR-003).

---

## HDL-01-FR-004 — قياس حجم الحزمة

كل القياسات على `66b7b69e3117235c8a614a0502de21ca928e227e` بتاريخ 2026-08-08. سقف سلة المرجعي: «Public themes: **1 MB max.** Private themes: **2 MB.**» (`docs/building-a-salla-theme.md:27`).

| القياس | البايتات | القيمة المقروءة | الأمر المنتِج | comparable_to_salla_limit | الثقة |
|---|---|---|---|---|---|
| إجمالي `public/` الخام (33 ملفًا) | 1,557,969 | 1,521.5 KiB | `find public -type f -exec stat -f "%z" {} \; \| awk '{s+=$1} END {print s}'` → `1557969`؛ العدد `find public -type f \| wc -l` → `33` | **نعم — القياس الوحيد المقارَن بسقف سلة** (R4.1) | طريقة سلة `needs-salla-confirmation` (R4.4) |
| تخصيص `public/` بنظام الملفات | — | 1,604 KiB | `du -sk public/` → `1604` (كتل تخصيص لا حمولة؛ يعتمد على الآلة) | لا | confirmed |
| مدخل webpack `app` (`app.css` + `app.js`) | 931,120 | 909 KiB | من سجل البناء FR-003 (`npx webpack --mode production` عند الـSHA) | **لا — إشارة أداة بناء وليست حد منصة** (R4.2) | confirmed |
| `app.css` | 802,732 | 784 KiB · 51.5% من الإجمالي | `find public -type f -exec stat -f "%z %N" {} \; \| sort -rn \| head -8` | لا | confirmed |
| `app.js` | 128,388 | 125 KiB | نفس الأمر | لا | confirmed |
| 12 حزمة JS مجتمعة | 330,350 | 322.6 KiB · 21.2% | جمع مخرجات الأمر نفسه | لا | confirmed |
| 5 ملفات خطوط Thmanyah `.woff2` | 385,492 | 376.5 KiB · 24.7% | `find public/images/fonts -type f -exec stat -f "%z" {} \; \| awk '{s+=$1} END {print s}'` → `385492` | لا | confirmed |

أكبر ثمانية أصول عند خط الأساس (الأمر: `find public -type f -exec stat -f "%z %N" {} \; | sort -rn | head -8` عند `66b7b69e3117235c8a614a0502de21ca928e227e`): `app.css` 802,732؛ `app.js` 128,388؛ `thmanyahsans-Bold.woff2` 79,160؛ `thmanyahsans-Medium.woff2` 79,064؛ `thmanyahsans-Regular.woff2` 77,776؛ `thmanyahsans-Black.woff2` 77,112؛ `thmanyahsans-Light.woff2` 72,380؛ `product.js` 56,127.

**قراءة التجاوز (R4.3، R4.5)**: الإجمالي 1,557,969 بايت يساوي **155.8%** من 1 MB بالأساس العشري (10⁶ = 1,000,000 بايت) و**148.6%** من 1 MiB بالأساس الثنائي (2²⁰ = 1,048,576 بايت) — الحكم واحد تحت القراءتين: **تجاوز مؤكد لسقف الثيم العام**. الهدف الداخلي ≤85% من السقف (الدستور V) أي 850,000 بايت (MB) أو 891,289 بايت (MiB)، والفجوة إلى الهدف الداخلي ≈ **651 KiB**. مطابقة طريقة قياسنا لطريقة سلة (خام أم تخصيص، MB أم MiB، قبل أم بعد تحويل النشر، وهل الخطوط والصور داخلة في السقف نفسه) **غير مؤكدة** وتُحمل كـSpike إلى HDL-05 (`needs-salla-confirmation`، research.md R-004) — دون أن يتغير الحكم تحت أي تفسير. هذا القسم **خط أساس مقاس وليس هدف تحسين** (`spec.md` §10، R4.5)؛ لا يُحسَّن داخل HDL-01، وملك العلاج HDL-05 (قسم المخاطر).

---
## HDL-01-FR-005 — سياسة الأدلة

توحيد قواعد الدستور VI و`AGENTS.md` §Definition of done في جدول واحد (R5.1–R5.5). كل صف يشترط commit SHA على الدليل فلا يطفو أي دليل بلا حالة كود (R5.4)، وكل دليل يجب أن يكون **بعد** التغيير زمنيًا (`timestamp_rule`، `AGENTS.md` §Definition of done). الاستبدال عند تعطل المعاينة هو **تأجيل لا إعفاء** (R5.5): يبقى التغيير غير مقبول حتى يوجد دليل المعاينة. لا يُقبل أي Mockup محلي مستقل كدليل عن الثيم إطلاقًا (R5.3، `AGENTS.md` §Evidence rules، الدستور VI).

| change_type | الدليل المطلوب | معاينة سلة غير متاحة / Salla preview unavailable — البديل المؤقت | visual_evidence_required |
|---|---|---|---|
| `source-code` (تعديل `src/`) | بناء إنتاج ناجح + الحارس `0/0` + commit SHA | البناء والحارس إلزاميان ويبقى دليل المعاينة مؤجلًا لا معفًى عنه، والتغيير يبقى غير مقبول | نعم عندما يكون للتعديل أثر مرئي |
| `build-output` (تغير `public/`) | `node scripts/check-theme.mjs --build` يقرر أن `public/` يطابق بناءً جديدًا + commit SHA | الحارس محلي ومتاح دائمًا — لا بديل مطلوب | لا |
| `visual` (تغيير بصري) | لقطة شاشة من **واجهة سلة المُصيَّرة** مختومة زمنيًا **بعد** التغيير + commit SHA | رابط معاينة يدوي يوفره المالك (الدستور VI)؛ المعاينة المحلية أو الـMockup ليست بديلًا | نعم |
| `behavioral` (تفاعل/سلوك) | قياس DOM حي أو التقاط تفاعل على الواجهة المُصيَّرة + commit SHA | كما في البصري؛ القراءة من الكود فقط ليست إثباتًا | نعم |
| `performance` (أداء/حجم) | رقم مقاس + الأمر المنتِج + commit SHA | أرقام حجم البناء المحلية تحل محل فحص الحزمة مؤقتًا؛ أما Lighthouse فلا بديل محليًا له | لا |
| `invisible` (توثيق، تعليقات، مواصفات — **هذه الميزة HDL-01**) | **لا يلزم دليل بصري / no visual evidence required.** commit SHA + الحارس ما زال أخضر + `git status` يثبت النطاق | لا ينطبق — لا معاينة أصلًا في هذا النوع | **لا (false)** |

قواعد ثابتة منقولة: أي قطعة دليل أقدم من الكود الذي تصفه ليست دليلًا (`AGENTS.md` §Evidence rules)؛ أي رقم بلا أمر منتِج وcommit SHA ليس دليلًا (`spec.md` §8)؛ و«غير مُتحقق منه» تُقال صراحة ولا تُلمَّح.

---

## HDL-01-FR-006 — المخاطر مرتبة بأثر الإطلاق

سبعة مخاطر مرتبة بأثر الإطلاق: الحاجبة أولًا ثم غير الحاجبة (R6.3، R6.4). كل صف يحمل دليلًا **مقاسًا** بأمره على `66b7b69e3117235c8a614a0502de21ca928e227e` — لا انطباعات — ومالكًا غير فارغ، وعلم حجب صريح، وعبارة أن HDL-01 لا يعالجه (R6.1، R6.2، R6.5). الفئات الست في `spec.md` §5 (الحجم، الأداء، الهوية، RTL/LTR، المعاينة، الفروع) كلها حاضرة إضافة إلى فئة doc-drift.

| # | الفئة | الخطر | الدليل المقاس عند `66b7b69e3117235c8a614a0502de21ca928e227e` | المالك | blocks_public_launch | ملاحظة العلاج |
|---|---|---|---|---|---|---|
| 1 | identity | التمايز عن Theme Raed | جذر هديل `8bf2ce6fab2d8939f344e620203bb6638b80b161` بشجرة `9d9056896ba11ead6f6a108857c1e6f7aca4bad9` مطابقة بايتيًا لشجرة Raed `dc902f62775f25bf98f67b76da93eb098b1e207d` (`git cat-file -p … \| head -1`)؛ `src/views/layouts/master.twig:97` يصيّر صنف body `theme-raed` (`grep -n "theme-raed" src/views/layouts/master.twig`)؛ 6 مراجع `raed/preview-images` في `twilight.json` (`grep -c 'raed/preview-images' twilight.json` → `6`)؛ 14 سطرًا مطابقًا لـRaed في `README.md` (`grep -ci "raed" README.md` → `14` — عدّ أسطر مطابقة لا عدّ تكرارات)؛ وصف `twilight.json` يقول «ثيم أزياء» والمخطط يعرّف ثيم سوق عام | **HDL-29 عبر `HDL-29-FR-011`** (يوجّه العلاج للمواصفات المالكة) | **نعم** | HDL-01 يسجّل فقط ولا يعالج ولا يحسم؛ التدقيق الكامل بوابة إطلاق في `HDL-29-FR-011` |
| 2 | bundle | حجم الحزمة فوق سقف سلة العام | `public/` = 1,557,969 بايت = 1,521.5 KiB (`find public -type f -exec stat -f "%z" {} \; \| awk …` → `1557969`) مقابل 1 MB؛ 148.6% (MiB) / 155.8% (MB)؛ الفجوة إلى هدف 85% ≈ 651 KiB؛ `app.css` 51.5% والخطوط 24.7% | **HDL-05** | **نعم** | HDL-01 لا يعالج — مقاس ومسجَّل فقط (R6.5) |
| 3 | performance | ثقل مدخل البناء وغياب قياس الأداء | 3 تحذيرات أداء webpack ومدخل `app` = 909 KiB (إشارة أداة بناء وليست حد منصة — build-tool signal, not a platform limit) (`npx webpack --mode production` عند الـSHA، سجل FR-003)؛ لا يوجد أي تشغيل Lighthouse عند هذا الالتزام | **HDL-05** | **نعم** (الدستور V) | HDL-01 لا يعالج |
| 4 | rtl-ltr-a11y | RTL/LTR وإمكانية الوصول غير مقاسين | تكافؤ الترجمات 86/86 مقاس ونظيف (`node -e` بعدّ المفاتيح الورقية → `ar 86 en 86`)؛ لا توجد مصفوفة عرض RTL/LTR ولا درجة وصول عند خط الأساس | **HDL-04** (وبوابة درجات الوصول مشتركة مع HDL-05) | **نعم** (الدستور IV/V) | HDL-01 يسلّم القياس الحالي كخط أساس ولا يعالج |
| 5 | preview | توفر معاينة سلة | Salla CLI `3.2.45` موثّق (`salla --version`)؛ الثيم `224400990` باسم `Hadeel` بحالة `development` (الأمر القرائي المنتِج: `salla theme list`، مدوَّن في `.specify/.runtime/hadeel-night-run.md` بتاريخ 2026-08-08 17:03 +03 على `66b7b69e3117235c8a614a0502de21ca928e227e`)؛ القدرة متاحة ولم تُستدعَ قط (لا تغيير مصدر يُتحقق منه) | **HDL-05** تشغيليًا؛ **HDL-29** عند الإطلاق | **نعم** | المعاينة غير منطبقة (N/A) على HDL-01 لأنه لا تغيير مصدر يُتحقق منه؛ HDL-01 لا يعالج؛ الشرط يعود كاملًا عند أول تغيير مصدر لاحق |
| 6 | branches | فروع غير مدمجة/قديمة | 5 فروع dependabot غير متضمَّنة في HEAD، وفرعا codex متضمَّنان بالكامل، و`upstream/master` متباعد `3333 97` بلا `merge-base` (حلقة `git merge-base --is-ancestor` في quickstart.md §2.7) | **HDL-05** (التبعيات/CI)؛ مالك الإصدار لنظافة الفروع | **لا** | HDL-01 لا يعالج |
| 7 | doc-drift | التوثيق يخالف التشغيل | `AGENTS.md` يقول إن الحارس «يبلّغ عن أخطاء سابقة» والمقاس `0 أخطاء / 0 تحذيرات` (`node scripts/check-theme.mjs --json`)؛ و`spec-index.json` يحمل تصنيفات مركّبة ضد قاعدة «واحد فقط» في FR-001 | **HDL-05** (وثائق الحارس/CI)؛ مالك الحوكمة (ياسر) لفهرس spec-kit | **لا** | HDL-01 يسجّل الفرقين في «فروق مفتوحة» ولا يعالج |

قاعدة الترتيب: الحاجبة للإطلاق أولًا مرتبة بمسافة العلاج، ثم غير الحاجبة. **HDL-01 لا يعالج أي صف من هذه الصفوف السبعة** (R6.5).

---

## HDL-01-FR-007 — قاعدة عدم إعادة البناء قبل التصنيف

القاعدة الثابتة: **Preserve, Audit, Then Improve** (الدستور VII) — لا يُعاد بناء أي عنصر قبل فحص الموجود وتصنيفه إلى `Existing — Audit & Polish` أو `Build` أو `Spike` أو `Deferred`. تطبيقها على هذا المشروع: جدول FR-001 أعلاه يغطي 29/29 صفًا من `ROADMAP.md` بتصنيف أساسي واحد لكل صف، فأي صف في HDL-02…HDL-29 له تصنيف معلن قبل أن يبدأ أي وكيل فيه؛ **الصف الذي بلا تصنيف صفٌ لا يجوز لأي مواصفة أن تبدأ بناءه**. التصنيفات الأساسية الـ22 من نوع `Existing — Audit & Polish` تعني تحديدًا: يوجد تنفيذ مسؤول في `src/` عند `66b7b69e3117235c8a614a0502de21ca928e227e` يجب تدقيقه وتحسينه أولًا، ويُمنع استبداله ببناء موازٍ. وهذا هو الرد العملي على انحدارات هذا المستودع الموثقة في `AGENTS.md` §Regressions (أنماط موازية، طبقات overriding، إعادة تنفيذ ما توفره Twilight): يمنع FR-001/FR-002 ظهورها قبل أن تبدأ.

---
## خط أساس العلاقة مع Theme Raed

نطاق محدود ومعتمد من المالك في `DECISION HDL-01` (ياسر، 2026-08-08، `docs/spec-kit/DECISION-LOG.md`): خمسة بنود بالضبط، لا أكثر ولا أقل (R8.1). كل القياسات على `66b7b69e3117235c8a614a0502de21ca928e227e` بتاريخ 2026-08-08.

1. **الأصل/القاعدة — مُثبتة بتطابق اللقطة (tree equality)، لا بالنسب (ancestry).** جذر هديل `8bf2ce6fab2d8939f344e620203bb6638b80b161` (الأمر: `git rev-list --max-parents=0 HEAD`) شجرته `9d9056896ba11ead6f6a108857c1e6f7aca4bad9` (`git cat-file -p 8bf2ce6fab2d8939f344e620203bb6638b80b161 | head -1`). والتزام Theme Raed `dc902f62775f25bf98f67b76da93eb098b1e207d` (2026-04-09، `feat(CP-1114): Support Brand on Offer (#856)`) شجرته **نفسها** `9d9056896ba11ead6f6a108857c1e6f7aca4bad9` (`git cat-file -p dc902f62775f25bf98f67b76da93eb098b1e207d | head -1`). إذن بدأ هديل لقطة بايتية مطابقة لـRaed عند تلك النقطة. وبشكل مستقل وغير متناقض: `git merge-base upstream/master HEAD` **لا يرجع شيئًا (exit 1)** — التاريخان غير مرتبطين لأن تاريخ هديل أُعيد ابتداؤه. تُذكر الحقيقتان معًا دائمًا (R8.4، research.md R-007): تطابق الشجرة يثبت الأصل، وغياب الـmerge-base يفسّر لماذا لا يجد Git سلفًا مشتركًا؛ وذكر أيٍّ منهما وحده مضلِّل.
2. **فروق حالية على مستوى عالٍ — مستوى المستودع/البنية فقط (R8.2).** محور التاريخ: هديل تاريخ مُعاد ابتداؤه من لقطة Raed، يبلغ **97 التزامًا إجمالًا بما فيها جذر اللقطة نفسه، و96 التزامًا بعده** — مقاسًا بالأمرين `git rev-list --count HEAD` → `97` و`git rev-list --count 8bf2ce6fab2d8939f344e620203bb6638b80b161..HEAD` → `96` عند `66b7b69e3117235c8a614a0502de21ca928e227e` — بينما `upstream/master` مستقل بـ3333 التزامًا (`git rev-list --left-right --count upstream/master...HEAD` → `3333 97`). محور البناء: 12 مدخل webpack مقسّمة بالصفحات في `webpack.config.js:11-24`. محور التنسيق: نظام SCSS مرتب ITCSS بدخول واحد `app.scss`. محور الإعدادات: 45 سجلًا (37 تفاعليًا + 8 بنيوية) في `twilight.json`. محور الترجمات: ملفان `src/locales/ar.json` و`en.json` بتكافؤ 86/86. هذا وصف بنيوي موجز لا تحليل ميزات.
3. **مواضع التشابه القوي — إشارات مخاطرة تستحق فحصًا لاحقًا، وليست نتائج ولا أحكامًا (R8.5).** صنف body `theme-raed` المصيَّر في `src/views/layouts/master.twig:97` (`grep -n "theme-raed" src/views/layouts/master.twig`)؛ **6** مراجع موروثة لأصول `raed/preview-images/*` في `twilight.json` (`grep -c 'raed/preview-images' twilight.json` → `6` — أسطر مطابقة)؛ 14 سطرًا مطابقًا لـRaed في `README.md` (`grep -ci "raed" README.md` → `14` — عدّ أسطر مطابقة لا تكرارات). هذه إشارات تُسجَّل للفحص اللاحق، لا إثبات تكرار.
4. **خطر الهوية/التمايز عند الإطلاق ومالكه.** الخطر مرتبة 1 في جدول FR-006، حاجب للإطلاق العام، ومالكه **HDL-29 عبر `HDL-29-FR-011`**: لا PASS ولا إطلاق دون تمايز مُثبت؛ كل FAIL يعود إلى مواصفته المالكة، يُعالَج هناك، ثم يُعاد التدقيق.
5. **مراجع الالتزامات والأدلة لإعادة المقارنة لاحقًا على النقطة نفسها.** SHA الطرفين: جذر هديل `8bf2ce6fab2d8939f344e620203bb6638b80b161` ولقطة Raed `dc902f62775f25bf98f67b76da93eb098b1e207d`؛ الشجرتان (المتطابقتان): `9d9056896ba11ead6f6a108857c1e6f7aca4bad9`؛ `origin/master` عند `833f19d0b5793a8c07384b303f9a4222b97b3bd1` (`git rev-parse origin/master`)؛ `upstream/master` عند `3bd09f11f8d9a2a346838acbe78861eae7826c47` (`git rev-parse upstream/master`)؛ العدّان `0 38` (`git rev-list --left-right --count origin/master...HEAD`) و`3333 97` (`git rev-list --left-right --count upstream/master...HEAD`)؛ الأوامر كلها مذكورة في البنود أعلاه وفي quickstart.md §2.8؛ تاريخ القياس 2026-08-08؛ خط الأساس `66b7b69e3117235c8a614a0502de21ca928e227e`.

**نص المنع الصريح (R8.2، R8.3، invariant I-7)**: لا يجري HDL-01 أي مقارنة ميزة بميزة (feature-by-feature) مع Theme Raed — لا هنا ولا في أي قسم آخر من هذا التقرير. التدقيق الكامل للتمايز عبر المنتج والتصميم البصري والتجربة والقدرات محال بالكامل إلى البوابة الحاجبة **`HDL-29-FR-011`**؛ وإن ظهرت الحاجة لمثل هذا التحليل أثناء أي عمل لاحق تُسجَّل كإشارة في البند 3 وتُحال إلى HDL-29 ولا تُنفَّذ هنا. توقفت أوامر هذا القسم عند شرط الإيقاف في quickstart.md §2.8 ولم تُمدَّد إلى أي diff ملف بملف.

---

## جرد الفروع

مقاس على `66b7b69e3117235c8a614a0502de21ca928e227e` بتاريخ 2026-08-08. الأوامر المنتِجة: `git branch -r --format='%(refname:short) %(objectname:short)'` → **10 مراجع بعيدة بالضبط**؛ `git rev-list --left-right --count origin/master...HEAD` → `0 38`؛ `git rev-list --left-right --count upstream/master...HEAD` → `3333 97`؛ وحلقة `git merge-base --is-ancestor` على المراجع العشرة (quickstart.md §2.7).

| المرجع | الطرف | الحالة | أمر الدليل | ملاحظة |
|---|---|---|---|---|
| `origin` (الاسم الرمزي `origin/HEAD`) | `833f19d0` | comparator-alias | `git branch -r` | **اسم مستعار رمزي يحل على الطرف نفسه لـ`origin/master` — ليس عملًا منفصلًا** (R7.6) |
| `origin/master` | `833f19d0` | comparator | `git rev-list --left-right --count origin/master...HEAD` → `0 38` | مرجع المقارنة؛ HEAD متقدم 38 وغير متأخر |
| `origin/codex/product-buy-button-options` | `66b7b69e` | identical-to-head | `git merge-base --is-ancestor` | **الحالة الطرفية الأولى (`spec.md` §8): الالتزام نفسه لخط الأساس — يبدو عملًا منفصلًا وليس كذلك** (R7.2) |
| `origin/codex/figma-product-collection` | `14fbe512` | contained-in-head | `git merge-base --is-ancestor` → contained-in-HEAD | **الحالة الطرفية الثانية (`spec.md` §8): مدمج فعليًا في خط الأساس واسمه ما زال مفتوحًا فيُظن عملًا معلقًا** (R7.3) |
| `origin/dependabot/npm_and_yarn/animejs-4.3.6` | `32cdcef1` | pending | `git merge-base --is-ancestor` → pending | ترقية تبعية معلقة |
| `origin/dependabot/npm_and_yarn/babel/core-7.29.0` | `4a5d9179` | pending | نفس الأمر → pending | ترقية تبعية معلقة |
| `origin/dependabot/npm_and_yarn/babel/plugin-transform-runtime-7.29.0` | `a4cfdeae` | pending | نفس الأمر → pending | ترقية تبعية معلقة |
| `origin/dependabot/npm_and_yarn/css-loader-7.1.4` | `d014b9ba` | pending | نفس الأمر → pending | ترقية تبعية معلقة |
| `origin/dependabot/npm_and_yarn/postcss-loader-8.2.1` | `3eae0e4a` | pending | نفس الأمر → pending | ترقية تبعية معلقة |
| `upstream/master` (SallaApp/theme-raed) | `3bd09f11` | diverged-unrelated | `git rev-list --left-right --count upstream/master...HEAD` → `3333 97`؛ `git merge-base upstream/master HEAD` → بلا ناتج (exit 1) | متباعد بتاريخ غير مرتبط (R7.5) |

**التوفيق (R7.4، V17)**: 10 مراجع = 1 اسم مستعار رمزي للمقارن + `origin/master` المقارن + **2 مدمج/مطابق** (`product-buy-button-options` مطابق لـHEAD، `figma-product-collection` متضمَّن) + **5 فروع dependabot معلقة** + **1 متباعد** (`upstream/master`). المرجع المحلي `codex/hdl-01-baseline-evidence` عند `66b7b69e` هو HEAD — خط الأساس نفسه، وليس مرجعًا بعيدًا. المقارن واسمه المستعار صفّان مرجعيان لا عملًا معلقًا.

---
## قصص المستخدم — دليل القبول

### US1 — كمالك المشروع (P1)

اختبار القبول المستقل (`spec.md` §4): «Given تقرير موجود في `specs/001-baseline-evidence/` يذكر `66b7b69e` وتاريخ القياس؛ When يفتحه ياسر دون فتح الكود؛ Then يجد كل صف من الـ29 مصنفًا بواحد من الأربعة، وقائمة مخاطر مرتبة، دون تغيير أي ملف في `src/` أو `public/`».

- **Given**: القسم `## Header` يثبت الـSHA الكامل `66b7b69e3117235c8a614a0502de21ca928e227e` وتاريخ القياس 2026-08-08.
- **Then (تصنيف الـ29)**: قسم `HDL-01-FR-001` — 29/29 صفًا، تصنيف أساسي واحد لكل صف، مع المصدر والدليل المتوقع والتبعيات، و18 تباين `spec-index` موثقًا دون تعديل الملف (V3، V5، V6).
- **Then (المخاطر المرتبة)**: قسم `HDL-01-FR-006` — سبعة مخاطر مرتبة بأثر الإطلاق، كل خطر بدليل مقاس ومالك وعلم حجب صريح (V11).
- **إضافات US1 (tasks.md)**: خط أساس العلاقة مع Theme Raed بخمسة بنود بالضبط مع نص المنع والإحالة إلى `HDL-29-FR-011` (V7، V8، V9، V10)؛ وجرد الفروع العشرة كل مرجع بحالته مع توفيق 2/5/1 (V17).
- **دون تغيير مصدر**: يُثبت ميكانيكيًا بقسم «طريقة القياس وحدودها» (أوامر quickstart.md §5) — لا سطر `M`/`A`/`D`/`R` لأي ملف مصدر أو إعداد متتبع (V20).

### US2 — كمطور أو وكيل (P1)

اختبار القبول المستقل: «وكيل بدأ HDL-02 فما بعد، يبحث عن قدرة كبيرة واحدة (Cart Drawer أو Product Card أو Header)، فيجد مسار المصدر المسؤول ومخرج البناء وتصنيفها».

- جدول القدرات المغلق في `HDL-01-FR-002` (14 سجلًا) يجيب بنظرة واحدة: **Cart Drawer** ← السجلان 6 و8 (`src/assets/js/partials/add-product-toast.js`، `src/assets/js/cart.js` ← `public/add-product-toast.js` 25,605 بايت و`public/checkout.js` 11,727 بايت، `Existing — Audit & Polish`)؛ **Product Card** ← السجل 3 (`src/assets/js/partials/product-card.js` ← `public/product-card.js` 31,643 بايت)؛ **Header/Search** ← السجل 13 بمسار `src/views/components/header/header.twig` والوسم `salla-search`.
- لا خلية فارغة: القالب والترجمات يحملان سبب عدم وجود مخرج صراحةً (R2.1)؛ ولا أي توجيه لتعديل `public/` يدويًا (R2.5)؛ والتصنيف يطابق تصنيف المواصفة المالكة في FR-001 (invariant I-4، V12).

### US3 — كمراجع جودة (P2)

اختبار القبول المستقل: «التقرير سجّل أرقام خط الأساس على `66b7b69e`؛ تُعاد الأوامر نفسها بعد أي تعديل؛ يُحسب الفرق كرقم مقابل التزام مسمّى».

- أرقام البناء والحارس حرفية في `HDL-01-FR-003` (الحارس 0/0، `--build` 0/0 مع `build-sync` ok، البناء 22.437s، `app.css` 784 KiB، `app.js` 125 KiB، مدخل `app` 909 KiB (إشارة أداة بناء وليست حد منصة)، 3 تحذيرات أداء) — كل سجل بأمره وتاريخه وSHA.
- أرقام الحزمة في `HDL-01-FR-004` (`public/` = 1,557,969 بايت) مع قياس واحد فقط موسوم «مقارَن بسقف سلة» (V13) والتجاوز مذكور بالأساسين 148.6 و155.8 (V14).
- سياسة الأدلة في `HDL-01-FR-005` بصفّي «لا يلزم دليل بصري» و«معاينة سلة غير متاحة» (V15، V16).
- أوامر إعادة الإنتاج كلها في `quickstart.md` §2 وملخصة في «طريقة القياس وحدودها» — أي وكيل يعيد تشغيلها على `66b7b69e3117235c8a614a0502de21ca928e227e` فيحصل على القيم نفسها (V2، V12، V18، V19).

---

## فروق مفتوحة

ثلاثة تعارضات موثقة-مقاسة (research.md R-008، قواعد R9.1–R9.3). **التشغيل هو الحقيقة والوثيقة هي الفرق المسجَّل**؛ `fixed_here = false` في كل صف، والملف المسمّى في كل صف **غير معدَّل** في HDL-01. المالك «مقترح» لأن HDL-01 لا يملك إسناد عمل لمواصفة أخرى.

| # | documented_claim (حرفيًا) | measured_reality (بالأمر، عند `66b7b69e3117235c8a614a0502de21ca928e227e`) | proposed_owner | fixed_here |
|---|---|---|---|---|
| 1 | `AGENTS.md:103-104` — «It currently reports pre-existing errors — do not let that number grow» (تظهر بالأمر `sed -n "103,104p" AGENTS.md` لأن الاقتباس يمتد على السطرين معًا) | `node scripts/check-theme.mjs --json` → `0` أخطاء / `0` تحذيرات والفحوص الخمسة `ok`. النتيجة العملية: ميزانية الأخطاء هنا **صفر**، فأي خطر يظهر هو خطأ جديد | HDL-05 (يملك بوابات الحارس/CI) | **false** — `AGENTS.md` غير معدَّل |
| 2 | `docs/spec-kit/spec-index.json` — 18 قيمة `classification` مركّبة في الحقول `features[].classification`، مواقعها بالأسطر: 45, 79, 95, 113, 133, 152, 172, 211, 232, 251, 272, 293, 312, 332, 353, 372, 394, 434 (تظهر بالأمر `grep -n '"classification": "Existing — Audit & Polish +' docs/spec-kit/spec-index.json`)، وتُلخَّص بالاستعلام `node -e "const j=require('./docs/spec-kit/spec-index.json');const c=j.features.map(f=>f.classification);console.log('compound',c.filter(x=>x.includes('+')).length,'+Build only',c.filter(x=>x==='Existing — Audit & Polish + Build').length,'+Build+Spike',c.filter(x=>x==='Existing — Audit & Polish + Build + Spike').length)"` → `compound 18 +Build only 15 +Build+Spike 3` | قاعدة FR-001 تشترط تصنيفًا واحدًا بالضبط لكل صف؛ التقرير يعيّن تصنيفًا أساسيًا واحدًا ويوثّق التباين (جدول FR-001، عمودا `index_classification` و`divergence`) بأمر `node -e` المذكور هناك | مالك الحوكمة (ياسر) — انظر research.md R-002 | **false** — `spec-index.json` غير معدَّل |
| 3 | `twilight.json:1952-1953` — `description.ar`: «ثيم أزياء عربي أولاً…» و`description.en`: «An Arabic-first fashion theme…» (تظهران بالأمر `sed -n '1952,1953p' twilight.json`؛ ويُنتج الوصف برمجيًا بالأمر `node -e "const j=require('./twilight.json');console.log(j.description.ar,'\|',j.description.en)"`) | الأثر الحاكم يعرّف هديل ثيم **سوق عام** لا ثيم قطاع واحد: `docs/spec-kit/PRODUCT-BLUEPRINT.md:5` — «هديل ثيم عام يُباع في سوق سلة، وليس ثيمًا لقطاع واحد» (تظهر بالأمر `sed -n '5p' docs/spec-kit/PRODUCT-BLUEPRINT.md`)، ويؤيده `.specify/memory/constitution.md:169` — «Hadeel is a general-purpose Salla marketplace theme…»؛ الوصف الموروث يخالف الهوية المعتمدة | HDL-28 (صفحة سوق سلة) — ويوجَّه عبر `HDL-29-FR-011` إن صار FAIL تمايز | **false** — `twilight.json` غير معدَّل |

---

## طريقة القياس وحدودها

### الأوامر المستخدمة ومصدر كل مخرَج

كل الأوامر أدناه شُغِّلت على `66b7b69e3117235c8a614a0502de21ca928e227e` بتاريخ 2026-08-08 (دليلها الكامل في `quickstart.md` §2):

| الأمر | ماذا أنتج | أين استُخدم |
|---|---|---|
| `git rev-parse HEAD` | SHA خط الأساس | Header |
| `git remote -v \| grep upstream` | ريموت upstream = SallaApp/theme-raed | Header |
| `git rev-list --left-right --count origin/master...HEAD` → `0 38` | عدّ المقارن | Header، الفروع، العلاقة |
| `git branch -r --format='%(refname:short) %(objectname:short)'` | 10 مراجع بعيدة | جرد الفروع |
| حلقة `git merge-base --is-ancestor` | حالة كل مرجع | جرد الفروع |
| `git rev-list --left-right --count upstream/master...HEAD` → `3333 97` | التباعد مع upstream | الفروع، العلاقة |
| `git rev-list --max-parents=0 HEAD` | الجذر `8bf2ce6f…` | العلاقة، بند 1 |
| `git cat-file -p <sha> \| head -1` (مرتين) | الشجرتان المتطابقتان `9d9056896ba1…` | العلاقة، بند 1 |
| `git merge-base upstream/master HEAD` → exit 1 | غياب السلف المشترك | العلاقة، بند 1 |
| `node scripts/check-theme.mjs --json` | 0/0، خمسة فحوص ok | FR-003 سجل 1 |
| `node scripts/check-theme.mjs --build --json` | 0/0، `build-sync` ok | FR-003 سجل 2 |
| `npx webpack --mode production` (مدوَّن عند الـSHA) | 22.437s، 784/125/909 KiB (الـ909 KiB إشارة أداة بناء وليست حد منصة)، 3 تحذيرات | FR-003 سجل 3 |
| `find public -type f -exec stat -f "%z" {} \; \| awk '{s+=$1} END {print s}'` → `1557969` | إجمالي `public/` | FR-002، FR-004 |
| `find public -type f \| wc -l` → `33`؛ `du -sk public/` → `1604` | عدد الملفات والتخصيص | FR-004 |
| `find public -type f -exec stat -f "%z %N" {} \; \| sort -rn \| head -8` | أكبر 8 أصول | FR-004 |
| `find public/images/fonts -type f -exec stat -f "%z" {} \; \| awk …` → `385492` | إجمالي الخطوط | FR-002، FR-004 |
| `find public -maxdepth 1 -type f \( -name "*.js" -o -name "*.css" \) -exec stat -f "%z %N" {} \; \| sort -rn` | 13 مخرجًا بأحجامها | FR-002 |
| `sed -n '11,24p' webpack.config.js` | 12 مدخل webpack | FR-002 |
| `find src/views/pages -type f -name "*.twig" …` (21) / `find src/views/components …` (22) | مجموعتا مفاتيح القوالب | سجل FR-001 |
| `node -e` على `twilight.json` (components → 7، settings type!=static → 37، static → 8، total → 45) | مجموعتا المكونات والإعدادات | سجل FR-001 |
| `node -e` بعدّ مفاتيح `src/locales/*.json` → `ar 86 en 86` | تكافؤ الترجمات | FR-001، FR-006 خطر 4 |
| `find src/assets/js -name "*.js" \| wc -l` → `24`؛ `find src/assets/styles -name "*.scss" \| wc -l` → `42` | أعداد السكربتات والأنماط | FR-001 المساندة |
| `grep -rhoE '<salla-[a-z0-9-]+' src/ \| sort -u \| wc -l` → `58` | وسوم `salla-*` المميزة | FR-001 المساندة |
| `grep -n "theme-raed" src/views/layouts/master.twig` → السطر 97 | صنف body الموروث | FR-006، العلاقة بند 3 |
| `grep -c 'raed/preview-images' twilight.json` → `6`؛ `grep -ci "raed" README.md` → `14` سطرًا مطابقًا | إشارات التشابه (الأمران يعدّان الأسطر المطابقة) | FR-006، العلاقة بند 3 |
| `node -e` على `docs/spec-kit/spec-index.json` | 29 تصنيفًا، 18 مركّبًا | FR-001، فروق مفتوحة |

### ما لا تستطيع هذه الأوامر إثباته (حدود الطريقة)

- طريقة قياس سلة الفعلية لسقف 1 MB (خام/تخصيص، MB/MiB، قبل/بعد النشر) — غير قابلة للحسم محليًا، `needs-salla-confirmation`، محمولة كـSpike إلى HDL-05.
- `du -sk` يقيس تخصيص نظام الملفات لا الحمولة، ويختلف بين الآلات؛ لذلك ليس الرقم المقارَن.
- الزمن `22.437s` خاص بالآلة والتشغيل المدوَّن؛ أرقام البايتات هي القابلة لإعادة الإنتاج.
- قراءة الكود لا تثبت سلوكًا بصريًا أو تفاعليًا؛ لا Lighthouse ولا مصفوفة RTL/LTR عند هذا الالتزام (مخاطر 3 و4).
- مخرجات `output/` وأي لقطات أقدم من الكود الذي تصفه ليست دليلًا (`AGENTS.md` §Evidence rules) ولم تُستخدم.
- **أمران خطيران لم يُشغَّلا عمدًا داخل نافذة تنفيذ/تحقق HDL-01**: `npx webpack --mode production` المجرد (يمسح `public/` ويعيد كتابتها — `webpack.config.js:25-29`؛ أرقام البناء منقولة عن تشغيل خط الأساس المدوَّن على الـSHA نفسه) و`salla theme preview` (يترك `public/` بناء تطوير — `docs/salla-twilight-notes.md` §6؛ **ولم تُشغَّل المعاينة قط في هذه الميزة**). استُخدمت بدلًا منهما الصيغ الآمنة المذكورة أعلاه.

### بنود «لا تنطبق» المسجَّلة مع بدائلها

- **معاينة واجهة سلة: لا تنطبق على HDL-01** لأن أي ملف في `src/` أو `public/` لم يتغير (`spec.md` §10). سُجِّلت حالة التوفر بدلًا منها: Salla CLI `3.2.45` موثّق؛ الثيم `224400990` باسم `Hadeel` بحالة `development`؛ القدرة **متاحة ولم تُستدعَ، ولم تُشغَّل المعاينة قط في HDL-01** (الأمر القرائي المنتِج للحالة: `salla theme list` — مدوَّن في `.specify/.runtime/hadeel-night-run.md` بتاريخ 2026-08-08 17:03 +03 على الالتزام نفسه `66b7b69e3117235c8a614a0502de21ca928e227e`). الشرط يعود كاملًا عند أول تغيير مصدر، وأي تغيير كهذا ينتقل إلى مواصفته المالكة. **لم تُشغَّل أي معاينة.**
- **اختبار الجوال/الكمبيوتر بالعربية RTL والإنجليزية LTR: لا ينطبق** (لا واجهة عميل في هذا المخرج). البديل المقاس المسلَّم إلى HDL-04: تكافؤ الترجمات 86/86 بصفر مفاتيح ناقصة (`node -e` بعدّ المفاتيح الورقية على الملفين عند `66b7b69e3117235c8a614a0502de21ca928e227e`)، ولا توجد مصفوفة عرض RTL/LTR عند خط الأساس، ولا تشغيل Lighthouse لإمكانية الوصول عند هذا الالتزام.
- **مقارنة Figma بمعاينة سلة: لا تنطبق على HDL-01** (بوابة من نوع توثيق/QA ولا شاشات واجهة معتمدة) وتبدأ من HDL-02 (`spec.md` §9 و§13، `design.md` §Node IDs). لوحة `359:3` Revision 1 معتمدة من ياسر بتاريخ 2026-08-08.

### إثبات صفر الأثر على المصدر (quickstart.md §5)

شُغِّل عند `66b7b69e3117235c8a614a0502de21ca928e227e` بعد كتابة هذا التقرير:

- §5.1 `git status --porcelain -- src/ public/ package.json pnpm-lock.yaml twilight.json AGENTS.md | grep -vE '^\?\?'` → **بلا أي مخرجات** (لا تعديل على ملف متتبع).
- §5.2 الفحص الموسّع نفسه على كامل المستودع مع استبعاد حزمة spec-kit غير المتتبعة سلفًا → السطر الوحيد ` M .vscode/settings.json` (حالة سابقة مملوكة للمستخدم، لم يلمسها HDL-01).
- §5.3 `ls specs/001-baseline-evidence/` → الملفات المخططة فقط، وملف التقرير الجديد الوحيد هو `baseline-report.md`.
- §5.4/§5.5 بصمات `spec.md` و`design.md` و`.specify/.runtime/hadeel-night-run.md` **قورنت عند T067 (مكتمل)** باللقطة `/tmp/hdl-01-preimpl-shasums.txt` المأخوذة قبل فتح نافذة التنفيذ، وطابقتها جميعًا بلا تغيير — نتيجة مسجَّلة لا فحصًا مستقبليًا.

---

*نهاية التقرير. كل رقم أعلاه قابل لإعادة الإنتاج على `66b7b69e3117235c8a614a0502de21ca928e227e` بأوامر `quickstart.md` §2؛ وعند أول تعديل مصدر يُعاد قياس التقرير كاملًا ولا تُرقَّع أرقامه في مكانها.*
