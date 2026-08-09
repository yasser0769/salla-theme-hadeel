# Design Handoff: HDL-03 — هندسة الإعدادات ومحرك التصميمات الجاهزة

**Design gate type**: Settings decision flow + storefront effect map  
**Status**: Approved for implementation; bilingual runtime evidence captured; Final Review disposition open  
**Figma file**: [Hadeel Design System](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled)  
**Figma page**: [17 · HDL-03 Settings & Presets](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=418-62) (`418:62`)  
**Design root**: [HDL-03/Settings-Preset-Engine/Responsive/Bidirectional/Rev-1](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=418-63) (`418:63`)  
**Design revision**: 1  
**Owner approval**: `APPROVE HDL-03 REV 1`  
**Planning state**: Complete; final evidence review open

## شرح مبسط

تثبت Revision 1 كيف يبدأ التاجر من Preset آمن، ثم يترك القيمة تتبع الـPreset أو يحولها إلى `Custom`. عند تبديل الـPreset تتغير القيم التابعة فقط، بينما تبقى القيمة المخصصة محفوظة. التصميم لا يعيد رسم لوحة سلة كاملة ولا يدعي سلوكًا منفذًا في الثيم.

## نطاق Revision 1

- خريطة Basic/Advanced وGlobal/Component فوق Settings Registry واحد.
- مقارنة Presets الأربعة بنفس المنتج والسعر والحالة.
- المسار الحرج: Follow Preset → Custom → تبديل Preset → حفظ Custom.
- Arabic Mobile RTL وArabic Desktop RTL وEnglish Mobile/Desktop LTR بنفس القيم والحالات.
- Safe/Blocked/Needs Review وقاعدة الحسم والفشل الآمن.
- فصل قرار HDL-03 عن التفاصيل البصرية التي تملكها HDL-24…HDL-27.

خارج النطاق: ترتيب الصفحات، استيراد الديمو، إنشاء المحتوى، أو اعتماد قيم Preset البصرية النهائية.

## Node IDs المعتمدة للمراجعة

| العنصر/الشاشة | الجهاز | اللغة/الاتجاه | الحالة | Node ID | رابط مباشر |
|---|---|---|---|---|---|
| Cover & scope | — | Arabic / RTL | Revision 1 | `418:64` | [Open](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=418-64) |
| Settings Map | Desktop board | Arabic / RTL | Basic/Advanced + Global/Component | `418:65` | [Open](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=418-65) |
| Preset comparison | Desktop board | Arabic / RTL | Same product/default state × 4 | `418:66` | [Open](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=418-66) |
| Arabic critical path | Mobile 390 | Arabic / RTL | Follow → Custom → switch → persist | `422:80` | [Open](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=422-80) |
| Arabic critical path | Desktop 1200 | Arabic / RTL | Same values/states | `422:101` | [Open](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=422-101) |
| English critical path | Desktop 1200 | English / LTR | Same values/states | `422:129` | [Open](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=422-129) |
| English critical path | Mobile 390 | English / LTR | Same values/states | `425:3` | [Open](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=425-3) |
| Safety, QA & approval | Desktop board | Arabic / RTL | Safe/Blocked/Needs Review | `418:70` | [Open](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=418-70) |
| Human Gate | — | Bilingual contract | Approved for Plan | `422:179` | [Open](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=422-179) |

## عقد المحتوى والحالات

تستخدم المقارنات القيم نفسها:

- Preset: `Luxury` ثم `Modern`.
- Follower: `16 px` ثم `12 px`.
- Custom: `24 px` قبل التبديل وبعده.
- النتيجة: `Custom remains 24 px` / `بقيت القيمة المخصصة 24 px`.

الاختلاف الوحيد بين أزواج الاتجاه هو اتجاه القراءة والترتيب المنطقي والمحاذاة ومكوّن Form Control المناسب؛ لا تتغير الدلالة أو القيمة أو الحالة.

## Preset Matrix

| Preset | الغرض المعروض في Revision 1 | الثابت في المقارنة | المالك النهائي |
|---|---|---|---|
| `luxury` | رحب، حواف ناعمة، عرض بصري | نفس المنتج، `299 ر.س`، متوفر، Default | HDL-24 |
| `modern` | متوازن، واضح، حركة هادئة | نفس المنتج، `299 ر.س`، متوفر، Default | HDL-25 |
| `minimal` | مساحة أكثر، حدود أقل | نفس المنتج، `299 ر.س`، متوفر، Default | HDL-26 |
| `practical_digital` | مضغوط، سريع المسح، معلوماتي | نفس المنتج، `299 ر.س`، متوفر، Default | HDL-27 |

هذه أوصاف أثر وليست قيم implementation معتمدة؛ Specs المالكة تثبت القيم النهائية.

## Settings Matrix

| الخاصية المرئية | النطاق | Setting ID / source | المستوى | القيم/الحالة | التصنيف والمالك |
|---|---|---|---|---|---|
| Preset المتجر | Global | proposed `preset_profile`؛ يقفل في Plan بعد مطابقة `twilight.json` | Basic | `luxury`, `modern`, `minimal`, `practical_digital` | Build — HDL-03 |
| عرض المحتوى | Global | `layout_width` | Basic | Existing allowed values + Follow/Custom contract when supported | Existing — HDL-03 |
| مسافات الأقسام | Global | `section_spacing` | Basic | Existing allowed values + safe default | Existing — HDL-03 |
| الحواف | Global | `corner_style` | Basic | Follow Preset / Custom; example `16 px` / `24 px` | Existing + contract — HDL-03 |
| نمط بطاقة المنتج | Global/component ownership | `product_card_style` | Basic | Follow Preset / Custom | Existing; final variants HDL-10 |
| تخطيط الهيدر | Global | `header_layout` | Basic | Follow Preset / Custom | Existing; final variants HDL-07 |
| كثافة الهيدر | Global | `header_density` | Advanced | Follow Preset / Custom | Existing; final behavior HDL-07 |
| مصدر الخط | Global | `use_theme_font` + Salla runtime `theme.font.*` | Basic | Merchant font / theme font | Existing runtime contract |

لا يعتمد هذا الجدول ID جديدًا للتنفيذ قبل Plan. الاسم `preset_profile` مقترح traceability فقط، ويجب أن يثبت Plan عدم تعارضه مع السجل الفعلي قبل أن يصبح عقدًا.

## حالات السلامة

| الحالة | الشرط | القرار المرئي |
|---|---|---|
| Safe | Preset صالح ومفاتيح معروفة | تحديث القيم التابعة فقط |
| Blocked | Preset غير معروف أو قيمة تالفة | استخدام `safe_default` بلا حذف Custom |
| Needs Review | عقد منصة أو قيمة قديمة غير مثبتة | لا تعرض كخيار نهائي؛ Spike أو مراجعة تاجر |

أولوية الحسم المصممة: `valid Custom → selected Preset → safe default`.

## إعادة استخدام HDL-02

Revision 1 تعيد استخدام Instances معتمدة من HDL-02:

- Button set `384:37`.
- Form Control set `384:61` باتجاهات RTL/LTR وحالات Default/Focus.
- Product Card Skeleton set `386:49` بنفس Direction/State للمقارنة.
- Foundations: متغيرات الألوان والمسافات والحواف، Tajawal text styles، وSubtle shadow.

لم يُنشأ Component Set موازٍ، ولم تتغير مكتبة HDL-02.

## Spikes والفروقات المقبولة

| البند | السبب | الحالة |
|---|---|---|
| labels/descriptions متعددة اللغات داخل لوحة إعدادات سلة | صيغة المنصة لم تثبت بعد | Spike؛ لا تعرض كقدرة منفذة |
| إخفاء Advanced بشروط جديدة | الشروط الحالية المثبتة تخص حقول التقسيط فقط | Spike؛ لا نخمن صيغة جديدة |
| شكل لوحة سلة الفعلي | Figma يثبت القرار والمحتوى لا DOM منصة Salla | يُطابق بعد التنفيذ في live preview |
| Loading/empty/error | المسار لا يطلب شبكة ولا يعرض قائمة نتائج | N/A لهذه البوابة؛ Safe/Blocked/Needs Review هي حالات الفشل ذات الصلة |

## QA Evidence — Revision 1

- Visual review بعد آخر تعديل: PASS للغلاف، Settings Map، مقارنة Presets، Arabic Mobile، Arabic Desktop، English Mobile/Desktop، ولوحة Safety/QA.
- Structural audit: 7/7 sections موجودة؛ 0 placeholder؛ 0 عنصر خارج حدوده.
- Typography audit: 100 free-standing text nodes؛ كلها Tajawal؛ 0 missing fonts؛ 0 fixed-height clipping.
- Instance audit: 26 Instances؛ 6 Button، 16 Form Control، 4 Product Card Skeleton.
- Direction audit: 10 RTL Form Controls و6 LTR Form Controls؛ 0 direction مجهول.
- Exact frame dimensions: Mobile `390 px`، Desktop `1200 px`.
- Source/build/live-preview: `N/A — no source change`. هذه الأدلة تثبت visual intent فقط، ولا تدعي runtime DOM أو keyboard أو ARIA أو performance verification.

## Design Approval Checklist

- [x] Mobile Arabic/RTL complete.
- [x] Desktop Arabic/RTL complete.
- [x] Mobile and desktop English/LTR critical parity complete.
- [x] Same values and states used across direction/viewport comparisons.
- [x] Focus, Safe, Blocked, Needs Review, persistence, and long-label intent reviewed.
- [x] Merchant settings, ownership, existing/build/deferred boundaries, and variants annotated.
- [x] Feasibility unknowns marked as Spike and not presented as implemented features.
- [x] HDL-02 Foundations and reusable components used where applicable.
- [x] Direct page, root, board, and critical-frame Node links recorded.
- [x] Owner wrote `APPROVE HDL-03 REV 1`.
- [x] Approval date and statement recorded.

## الموافقة

**Owner statement**: `APPROVE HDL-03 REV 1`  
**Approved by**: Yasser  
**Date**: 2026-08-08  
**Revision**: 1  
**Next action after approval**: Plan opened automatically; no further confirmation required until the next defined Human Gate.
