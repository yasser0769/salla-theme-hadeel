# Design Handoff: HDL-02 — نظام تصميم Figma وبوابة الموافقة البصرية

**Design gate type**: نظام تصميم مرئي وحوكمة اعتماد
**Status**: Approved for Implementation — Revision 2
**Figma file**: https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled
**Figma page**: [16 · HDL-02 Design System](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=381-2) (`381:2`)
**Design root**: [HDL-02/Shared/Design-System/Responsive/Bidirectional/Rev-2](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=381-3) (`381:3`)
**Direction QA matrix**: [RTL/LTR Parity Matrix · Revision 2](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-2) (`398:2`)
**Design revision**: 2
**Owner approval**: Approved — Revision 2

## شرح مبسط

Revision 2 يؤسس اللغة البصرية المشتركة وطريقة اعتمادها، ويضيف مصفوفة مقارنة end-to-end صريحة بين Arabic/RTL وEnglish/LTR على الجوال والكمبيوتر. لا يصمم صفحات المشروع أو تدفقاته كاملة. يحتوي Foundations موثقة، وتسع عائلات Component sets ممثلة، وسجل Node IDs، ومصفوفة إعدادات، ومصفوفة تغطية، وبوابة QA قابلة لإعادة الاستخدام في المواصفات التالية.

Revision 1 أصبحت **Superseded** بعد رفض المالك كفاية RTL/LTR parity. لا تصلح مرجعًا لبدء Plan.

وافق ياسر صراحة على Revision 2؛ Plan لـHDL-02 مفتوح من 2026-08-08. وتبني المواصفات المرئية اللاحقة شاشاتها فوق هذا الأساس مع بوابة اعتماد مستقلة لكل Spec.

## النطاق والحدود

### داخل Revision 2

- Foundations للألوان، Typography، spacing، radii، grids، elevation، الأيقونات/الصور، وعقد motion أولي.
- Component sets ممثلة للأزرار، حقول الإدخال، الشارات، سعر المنتج، هيكل بطاقة المنتج، Drawer/Modal، Header/Navigation، Tabs/Accordion، وحالات Feedback.
- Arabic/RTL وEnglish/LTR حسب الحاجة، وحالات Default/Hover/Focus/Disabled/Loading/Empty/Error القابلة للانطباق.
- Node ID Registry وSettings Matrix وCoverage Matrix ودورة Revision واعتماد واضحة.

### مؤجل إلى المواصفات المالكة

- Home وProduct وCollection وSearch وCart والصفحات المساندة كتدفقات كاملة.
- الـPresets الأربعة ومتاجر الديمو.
- القيم النهائية للحركة والأداء والإعدادات الجديدة غير المثبتة.
- أي تعديل Twig/SCSS/JS أو `twilight.json`؛ لم يتغير مصدر الثيم في HDL-02 حتى هذه البوابة.

## Foundations ومصادر الحقيقة

| المجال | الموجود في الملف | قرار Revision 2 |
|---|---:|---|
| Variable collections | 8 | إعادة استخدام المجموعات المحلية؛ لا استيراد من Material 3 أو Simple Design System. |
| Variables | 150 | لا broken aliases، ولا `ALL_SCOPES`، ولا متغير بلا WEB syntax بعد المراجعة. |
| Text styles | 18 | Tajawal كعينة Figma؛ خط الإنتاج يظل محكومًا بإعداد التاجر `theme.font.name` عبر `--font-main`. |
| Effect styles | 5 | إعادة استخدام الظلال المحلية بدل إنشاء نظام موازٍ. |
| Foundations cards | 7 | موثقة داخل قسم Foundations (`382:2`). |

- تم تصحيح `neutral/muted` من `#757575` إلى قيمة المصدر `#878787` وربطه بوصف يوضح مصدره.
- `brand/primary` ودرجاته عينات مرئية لقيم يملكها التاجر وقت التشغيل، وليست ألوانًا ثابتة مفروضة.
- أضيف WEB syntax ووصف `Spike — Figma-only` للمتغيرات الدلالية Typography التي لا يوجد لها token إنتاج مثبت بعد.
- Motion يبقى عقدًا أوليًا موسومًا Spike حتى يحسم HDL-06 القيم النهائية.

## Node ID Registry

| العائلة/الوثيقة | Node ID | التغطية |
|---|---|---|
| Foundations | [`382:2`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=382-2) | 7 بطاقات تأسيسية |
| Button | [`384:37`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=384-37) | 16: الحجم × الأسلوب × الحالة |
| Form Control | [`384:61`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=384-61) | 16: Input/Select × الحالة × LTR/RTL |
| Badge / Status | [`384:73`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=384-73) | 4 Tone variants |
| Product Price | [`386:15`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=386-15) | Regular/Sale/SoldOut/Free |
| Product Card Skeleton | [`386:49`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=386-49) | 6: RTL/LTR × Loading/Default/SoldOut |
| Overlay Shell | [`386:129`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=386-129) | 12: Drawer/Modal × RTL/LTR × Ready/Loading/Error |
| Header Navigation | [`389:61`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=389-61) | 8: Desktop/Mobile × RTL/LTR × Default/SearchOpen |
| Tabs Accordion | [`389:105`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=389-105) | 16: Tab/Accordion × RTL/LTR × 4 حالات |
| Feedback State | [`389:137`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=389-137) | 6: RTL/LTR × Loading/Empty/Error |
| Governance | [`390:2`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=390-2) | دورة Draft/Review/Approved/Reopened/Superseded |
| Node ID Registry | [`390:24`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=390-24) | السجل المرئي للعائلات التسع |
| Settings Matrix | [`391:2`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=391-2) | 12 حقلاً/قرارًا |
| Coverage Matrix | [`391:96`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=391-96) | 7 أبعاد تغطية |
| QA / Approval Gate | [`391:139`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=391-139) | Approved for Implementation — owner record in this handoff |
| RTL/LTR QA Matrix | [`398:2`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-2) | أربعة Frames متقابلة + قواعد الانعكاس |
| Arabic Mobile RTL | [`398:5`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-5) | Mobile · RTL · 390×980 |
| English Mobile LTR | [`398:6`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-6) | Mobile · LTR · 390×980 |
| Arabic Desktop RTL | [`398:7`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-7) | Desktop specimen · RTL · 608×900 |
| English Desktop LTR | [`398:8`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=398-8) | Desktop specimen · LTR · 608×900 |

المجموع: **9 Component sets و88 variants**. كل الأسماء تبدأ بـ`HDL-02/Shared/`، وكل Solid fill داخل المكونات مرتبط بمتغير محلي.

## Settings Matrix

| الخاصية المرئية | Setting ID / المصدر | القيم المؤكدة | الحالة |
|---|---|---|---|
| اللون الأساسي | `color_primary` / CSS runtime vars | قيمة يحددها التاجر | Existing — runtime-controlled |
| خط المتجر | `font` + `use_theme_font` | خط التاجر / خط الثيم | Existing — runtime-controlled |
| عرض التخطيط | `layout_width` | `compact`, `wide`, `full` | Existing; default runtime path `wide` |
| تباعد الأقسام | `section_spacing` | `compact`, `balanced`, `spacious` | Existing; default `balanced` |
| شكل الحواف | `corner_style` | `square`, `soft`, `rounded` | Existing; default `square` |
| شكل بطاقة المنتج | `product_card_style` | `minimal`, `bordered`, `elevated` | Existing; default `minimal` |
| تخطيط الهيدر | `header_layout` | `centered`, `start` | Existing; default `centered` |
| كثافة الهيدر | `header_density` | `compact`, `comfortable` | Existing; default `comfortable` |
| إظهار المفضلة | `header_show_wishlist` | Boolean | Existing; default `true` |
| شريط أدوات الجوال | `show_mobile_toolbar` | Boolean | Existing; default `true` |
| مستوى الحركة | يملكه HDL-06 | TBD | Spike — ليس إعدادًا مثبتًا بعد |
| حقول Overlay جديدة | يثبتها Spec المالك | TBD | Spike إذا لم تكن موجودة في المصدر |

الإعدادان `announcement_enabled=true` و`footer_is_dark=true` موثقان كسياق قائم، لكنهما لا ينشئان Variant جديدًا في عائلات HDL-02 الممثلة.

## التغطية والتفاعل

- المرجع الأول Arabic Mobile/RTL، ثم Arabic Desktop/RTL، ثم English/LTR parity للحالات الحرجة.
- لا تعتمد وظيفة على Hover فقط؛ Focus وDisabled ظاهران حيث ينطبقان.
- Drawer وModal يوضحان Ready وLoading وError واتجاهي RTL/LTR.
- Header يوضح Desktop/Mobile وDefault/SearchOpen في الاتجاهين.
- Feedback يوضح Loading وEmpty وError في الاتجاهين.
- العناوين والأسعار الدلالية بقيت قيمًا مستقلة لكل Variant؛ أزيلت Text properties المشتركة حين كانت تمحو المعنى أو النص الإنجليزي.
- لا تعرض أي فرضية منصة أو إعداد غير مثبت كميزة نهائية؛ تحمل `Spike` وتعود إلى Spec المالك.

## RTL/LTR Parity · Revision 2

تستخدم الـFrames الأربعة السيناريو والحالات الدلالية نفسها: Header `Default`، Tab `Active`، Input وSelect في `Focus`، زر Primary في `Default`، Carousel مع Pagination، وDrawer في `Ready`.

تمت المقارنة والإصلاح في:

- ترتيب Frame وAuto Layout الفعلي، لا تبديل النص فقط.
- محاذاة Paragraph إلى اليمين في العربية وإلى اليسار في الإنجليزية.
- ترتيب الأيقونة والنص؛ أيقونة Cart غير اتجاهية وتنتقل إلى logical start دون قلب شكلها.
- توثيق mapping لـ`START` و`END` إلى padding الفيزيائي المناسب لكل اتجاه.
- فتح Drawer/Menu من start: اليمين في RTL واليسار في LTR.
- Breadcrumbs وBack؛ `رجوع →` في RTL و`← Back` في LTR.
- Carousel/Pagination: Previous على start وNext على end، مع قلب الأسهم الاتجاهية وترتيب العناصر، دون قلب وسائط المنتج.
- Button/Input/Select/Tab بالقيم والحالات نفسها في كل زوج.
- عزل `SAR 249.00` و`SKU HDL-2026` وURL بعلامات Unicode Bidi isolate داخل النص المختلط.
- عقد ترتيب تركيز دلالي من `Focus/01` إلى `Focus/08` في كل Frame. التحقق الفعلي من DOM والكيبورد بعد التنفيذ يبقى لـHDL-04 والمواصفة المستهلكة.

لوحة `What mirrors / What does not mirror / Why` موجودة داخل `398:2`. ما لا ينعكس: هندسة شعار HADEEL، وسائط/صور المنتجات، الصور الفوتوغرافية، وأيقونات Search وCart وPlay وCheck غير الاتجاهية.

أصلحت Revision 2 فجوة في Component Set `384:61`: كانت Text property `Label#384:17` موصولة بثمانية LTR variants فقط. أصبحت جميع Labels الـ16 موصولة بالعقد نفسه، وأثبتت instances العربية والإنجليزية قبول override الصحيح.

## دورة Revision والانحرافات

الحالات المعتمدة هي `Draft → Review → Approved`. أي تغيير مرئي أو سلوكي أو إعداد تاجر بعد الاعتماد يعيد Revision إلى `Reopened`، ويصدر Revision جديدًا؛ السابق يصبح `Superseded` ولا يظل مرجع تنفيذ صالحًا.

قالب تسجيل أي فرق بين Figma وسلة:

| Node ID | الفرق المرصود | السبب (Salla/Accessibility/Performance/Responsive/Product) | Spec المالك | القرار | موافقة المالك |
|---|---|---|---|---|---|
| TBD | TBD | TBD | HDL-XX | Accept / Fix / Spike | Pending |

## Code Connect

لم توجد ملفات Code Connect في المستودع، ولا يوجد مكوّن كود 1:1 صالح للربط في هذا النطاق. أداة Code Connect نفسها مقيدة بخطة/مقعد Figma يتطلب Dev أو Full seat على Organization/Enterprise. لذلك الربط الحالي القابل للتتبع هو WEB variable syntax + Node ID Registry؛ هذا قيد أداة غير حاجب لاعتماد HDL-02، ولا يعني الادعاء بوجود ربط كود غير منفذ.

## دليل التحقق

- تدقيق Figma النهائي: **PASS**.
- صفحة `381:2` تحتوي Top-level root واحدًا: `381:3` بحجم `1440×13018` و17 قسمًا مباشرًا.
- مصفوفة الاتجاه `398:2` بحجم `1312×2342`، وفيها Frames الجوال `390×980` والكمبيوتر `608×900` كاملة بلا قص من صفوف الأب.
- المكونات: 9 sets، 88 variants، بلا أسماء افتراضية أو مكررة، وبلا عناصر خارج الحدود.
- المتغيرات: 8 collections، 150 variables، بلا aliases مكسورة أو `ALL_SCOPES` أو WEB syntax ناقص.
- النصوص: لا طبقات نصية متجاوزة أو فارغة في الفحص البنيوي؛ أصلح التفاف سطر focus في Frameَي الجوال.
- تم التقاط وفحص صور بعد الإنشاء لكل Component set، ثم Node Registry وSettings Matrix وCoverage Matrix وQA gate والجذر كاملًا.
- تم إصلاح تعبئة metadata غير المقصودة، واتجاه Form Control، وتداخل شبكة Product Price، وText properties التي كانت تمحو القيم الدلالية، ثم أعيد الفحص.
- تدقيق Revision 2 المحدد للاتجاه: **PASS** لكل Frame على Variant الجهاز/الاتجاه، جهة Drawer، ترتيب Breadcrumb/Button/Carousel، Bidi isolation، `Focus/01…08`، Tajawal، والمحاذاة والحدود.
- التحقق الصوري النهائي تم بعد الإصلاح لكل Frame منفردًا، ولمصفوفة `398:2` كاملة، ولوحة Form Control `384:38`.
- محاولة حفظ Named Version History لم تُنفذ لأن `saveVersionHistoryAsync` غير مدعوم في بيئة Figma الحالية؛ لم تحدث كتابة جزئية. Revision مثبتة في الجذر والحوكمة والبوابة وNode IDs.
- صفحة HDL-01 المحمية (`359:2`) ولوحتها (`359:3`) بقيتا موجودتين بالاسم والـNode IDs نفسيهما.
- Build/guard/live Salla preview: **N/A — no source change**. لم يتغير `src/` أو `public/` أو سلوك واجهة المتجر في مرحلة Figma.

## Design Approval Checklist

- [x] Arabic/RTL هو مسار التصميم الأول وممثل في العائلات المناسبة.
- [x] Desktop وMobile ممثلان في Header والمناطق التي يتغير فيها التخطيط.
- [x] Arabic Mobile RTL وEnglish Mobile LTR متقابلان بالمحتوى والحالة نفسيهما.
- [x] Arabic Desktop RTL وEnglish Desktop LTR متقابلان بالمحتوى والحالة نفسيهما.
- [x] Auto Layout order وparagraph alignment وicon/text order وlogical spacing وDrawer/Menu وBreadcrumb/Back وCarousel/Pagination وBidi isolation وfocus contract مراجعة.
- [x] Loading وEmpty وError وDisabled وFocus ممثلة حيث تنطبق.
- [x] Merchant settings وVariants موثقة في Settings Matrix.
- [x] Feasibility unknowns معلّمة `Spike` ومملوكة لمواصفات لاحقة.
- [x] لا توجد مكتبة طرف ثالث مستوردة أو مكوّن منسوخ.
- [x] Node IDs وRevision ودليل QA مسجلة.
- [x] Owner wrote: **APPROVE HDL-02 REV 2**.

## الموافقة

**Owner statement**: `APPROVE HDL-02 REV 2`
**Approved by**: Yasser
**Date**: 2026-08-08
**Revision**: 2

أي تغيير لاحق يمس النية المرئية أو السلوك أو الاتجاه أو Variant يعيد البوابة إلى `Reopened` ويرفع Revision قبل استمرار التنفيذ المتأثر.
