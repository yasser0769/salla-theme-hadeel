# Feature Specification: هندسة الإعدادات ومحرك التصميمات الجاهزة

**English name**: Settings Architecture and Preset Engine
**Roadmap ID**: `HDL-03`
**Parent roadmap**: `ROADMAP.md` → `HDL-03`
**Feature directory**: `specs/003-settings-preset-engine/`
**Status**: Review — implementation and bilingual evidence complete; Final Review CHANGES on inherited FR-017/focus findings
**Classification**: Existing — Audit & Polish + Build
**Phase**: المرحلة 0 — الأساس
**Depends on**: HDL-01 (`done`), HDL-02 (`done`)
**Figma Gate**: Revision 1 approved by Yasser on 2026-08-08
**Owner Acceptance**: Pending — do not mark accepted before `ACCEPT HDL-03`
**Evidence baseline**: `twilight.json` contains 45 setting records: 37 interactive and 8 structural/static records at commit `5deac563`

## 1. شرح مبسط لياسر

ننظم خيارات هديل بحيث يبدأ التاجر بأربعة تصميمات جاهزة آمنة، ثم يرى الخيارات الأساسية قبل المتقدمة، ويستطيع تخصيص عنصر مهم من دون كسر بقية شخصية المتجر أو إنشاء نسخة كود مستقلة لكل تصميم.

النتيجة ليست لوحة تحكم خارجية ولا استنساخًا للوحة سلة. هي عقد واضح داخل الثيم يحدد:

- ما الذي يغيره كل Preset.
- ما الذي يتبع الـPreset وما الذي خصصه التاجر يدويًا.
- أين يعيش كل إعداد ومن يملكه.
- ما القيم الآمنة عند وجود بيانات قديمة أو ناقصة.

## Clarifications

### Session 2026-08-08

- **أسئلة المالك المطلوبة: 0.** حُسمت القرارات من الدستور وProduct Blueprint وتقريري HDL-01 وHDL-02 والمصدر الحالي، من دون افتراض خيار منتج جديد.
- `Follow Preset` هو الوضع الافتراضي لكل إعداد يدعم التبعية. عند تبديل الـPreset تتغير الإعدادات التابعة فقط؛ أي `Custom override` يبقى محفوظًا حتى يعيده التاجر صراحة إلى `Follow Preset`.
- ترتيب الحسم هو: Override صالح → قيمة الـPreset المحدد → القيمة الآمنة العامة. القيمة القديمة/غير المعروفة لا تكسر الواجهة، وتُعرض للتاجر كحالة تحتاج مراجعة قبل الحفظ التالي.
- اختيار Preset لا يعيد ترتيب الصفحة، ولا ينشئ أقسامًا، ولا يستورد محتوى ديمو، ولا ينسخ Twig/SCSS/JS. أي ادعاء من هذا النوع يبقى Spike منفصلًا.
- أسماء الـPreset القانونية في هذا العقد: `luxury`، `modern`، `minimal`، `practical_digital`. المواصفات HDL-24…HDL-27 تملك الضبط البصري النهائي لكل واحد.
- سجل الإعدادات يوثق العربية والإنجليزية. إظهار لغة تلقائية داخل لوحة إعدادات سلة يبقى Spike حتى تثبت صيغة Salla الرسمية دعم labels/descriptions متعددة اللغات.

## 2. الهدف والنتيجة المتوقعة

عند اكتمال HDL-03 يوجد داخل ثيم واحد:

1. Settings Registry كامل يغطي السجلات الحالية الـ45 وأي إعداد معتمد جديد، بلا ID مكرر أو معنى متداخل.
2. أربع Preset profiles تستخدم النواة نفسها وتنتج قيمًا متناسقة للهوية والمسافات والحواف والحركة والهيدر والبطاقات، مع ملكية واضحة للمواصفات اللاحقة.
3. عقد Resolution موحد لـ`Follow Preset` و`Custom` يمنع فقد تخصيصات التاجر عند تبديل التصميم.
4. تصنيف واضح لكل إعداد: Global أو Component، وBasic أو Advanced، وExisting أو Build أو Spike أو Deferred.
5. قيم fallback آمنة تمنع class غير معروف أو تركيب غير مقروء على الجوال.
6. دليل مرئي في Figma يشرح قرار التاجر وأثره، ثم تنفيذ قابل للتحقق في معاينة سلة الحقيقية بعد الموافقة والخطة.

## 3. فحص الموجود والتصنيف قبل البناء

### Baseline مثبت

- `twilight.json`: 45 سجلًا؛ 37 تفاعليًا (`type != static`) و8 عناوين/فواصل بنيوية.
- إعدادات عامة مطبقة فعليًا: `layout_width`، `section_spacing`، `corner_style`، `product_card_style`، `header_layout`، `header_density`، `use_theme_font` وغيرها.
- `master.twig` يحول ستة إعدادات إلى body classes، و`storefront-system.scss` يملك القيم المطابقة الحالية.
- الشروط مثبتة حاليًا في حقول مزودي التقسيط فقط؛ لا يُفترض دعم صيغة شرط جديدة بلا دليل.
- لا يوجد الآن Setting ID موثق يختار Preset كاملًا، ولا عقد موحد لحفظ Follow/Custom.

| التصنيف | نطاق HDL-03 |
|---|---|
| **Existing — Audit & Polish** | جرد السجلات الـ45، تصحيح الملكية/التجميع/defaults، وتوحيد الإعدادات العامة المطبقة حاليًا دون تغيير معناها بلا سبب. |
| **Build** | Preset selector، Settings Registry، profiles الأربعة، وعقد Follow/Custom وfallbacks الآمنة. |
| **Spike** | ترجمة لوحة سلة تلقائيًا، إخفاء Advanced بصيغة شروط جديدة، إعادة ترتيب الصفحة، أو استيراد ديمو. |
| **Deferred** | الشكل النهائي للـPresets في HDL-24…27، تفاصيل Header/Card/Motion في Specs المالكة، وأي تطبيق خارجي. |

### داخل النطاق

- تعريف مجموعات الإعدادات وترتيب Basic قبل Advanced.
- تعريف حدود Global مقابل Component fields.
- تعريف profiles الأربعة وقيمها أو ملكية قيمها عندما تكون المواصفة المالكة لاحقة.
- Follow Preset/Custom للعناصر التي لها variant فعلي ومفيد.
- Registry لكل Setting ID ومعناه ونطاقه ونوعه وقيمه وfallback وترجمته ومالكه ودليله.
- مسار ترحيل آمن للقيم القديمة أو غير المعروفة.
- تصميم Figma لرحلة الاختيار والتبديل والـoverride والحالات غير الآمنة.

### خارج النطاق

- تطبيق خارجي أو خدمة مطلوبة للتخصيص البصري العادي.
- استيراد متجر ديمو أو إنشاء/ترتيب أقسام الصفحة تلقائيًا.
- تنفيذ التفاصيل البصرية النهائية لـHDL-24…HDL-27 قبل Specs الخاصة بها.
- إضافة إعداد بلا أثر حقيقي قابل للإثبات.
- نسخ كود أو أصول أو نص أو هوية Kalles أو Theme Raed.

## 4. المستخدمون والرحلات القابلة للاختبار

### User Story 1 — بداية سريعة لتاجر مبتدئ (P1)

كتاجر غير تقني، أريد اختيار شخصية جاهزة وفهم ما ستغيره، حتى أبدأ بقيم آمنة دون المرور على كل إعداد.

**اختبار مستقل:**

1. Given متجر جديد أو إعدادات لا تحتوي Overrides صالحة.
2. When يختار التاجر أحد الـPresets الأربعة ويؤكد الاختيار.
3. Then تحل كل خاصية مشاركة إلى profile ذلك الـPreset، وتظل الأسعار والشراء والمحتوى كما هي، ولا يُنشأ قسم أو محتوى ديمو.

### User Story 2 — تخصيص مضبوط لتاجر متقدم (P1)

كتاجر متقدم، أريد تحويل عنصر مهم من Follow Preset إلى Custom، حتى أميّز متجري دون فقد بقية النظام.

**اختبار مستقل:**

1. Given أن بطاقة المنتج تتبع الـPreset الحالي.
2. When يختار التاجر Variant يدويًا ثم يبدل الـPreset.
3. Then تبقى البطاقة على Override اليدوي، وتتغير الإعدادات الأخرى التابعة فقط، ويمكن إعادة البطاقة إلى Follow Preset بخطوة صريحة.

### User Story 3 — ترحيل آمن لمتجر قائم (P1)

كتاجر قائم، أريد أن تبقى القيم القديمة قابلة للعرض ولا تكسر متجري، حتى أراجعها قبل اعتماد النظام الجديد.

**اختبار مستقل:**

1. Given قيمة قديمة أو غير معروفة في إعداد مشارك.
2. When يحل الثيم الإعداد للعرض.
3. Then يستخدم fallback آمنًا موثقًا، ولا يرسم class غير معروف، ويُسجل الإعداد كـ`Needs review` بدل الكتابة الصامتة فوق قيمة التاجر.

### User Story 4 — سجل واحد لفريق الصيانة (P2)

كفريق صيانة، أريد سجلًا قابلًا للمقارنة آليًا، حتى لا يتكرر ID أو يتغير معناه بين المواصفات.

**اختبار مستقل:**

1. Given `twilight.json` وcomponent fields والعقود المعتمدة.
2. When يولد فحص السجل.
3. Then تكون جميع IDs فريدة، وكل سجل له owner ونطاق/default/fallback وقيم وترجمات ودليل، ولا يوجد Setting مقروء في Twig وغير معلن.

## 5. نموذج المجال وقواعد الحسم

### الكيانات الوظيفية

| الكيان | الحقول المطلوبة |
|---|---|
| `PresetProfile` | `id`, `name_ar`, `name_en`, `purpose`, `owned_values`, `deferred_values`, `version` |
| `SettingRecord` | `id`, `scope`, `tier`, `type`, `allowed_values`, `safe_default`, `preset_support`, `override_support`, `owner_spec`, `label_ar`, `label_en`, `evidence_status`, `source` |
| `SettingResolution` | `setting_id`, `mode` (`follow_preset`/`custom`), `custom_value`, `resolved_value`, `resolved_from`, `validation_state` |
| `MigrationDecision` | `setting_id`, `legacy_value`, `fallback`, `merchant_action`, `owner`, `evidence` |

### ترتيب الحسم الإلزامي

1. إذا كان الوضع `custom` والقيمة ضمن allowed values: استخدم القيمة اليدوية.
2. وإلا إذا كان profile المحدد يملك قيمة مثبتة: استخدم قيمة الـPreset.
3. وإلا: استخدم `safe_default` العام.
4. القيمة اليدوية غير الصالحة لا تُطبق ولا تُحذف صامتًا؛ تصبح `Needs review`.
5. تبديل الـPreset لا يغير أي سجل في وضع `custom`.
6. إعادة عنصر إلى `follow_preset` تلغي تأثير Override لذلك العنصر فقط بعد تأكيد واضح.

## 6. المتطلبات الوظيفية

- **HDL-03-FR-001**: يعرض تنظيم الإعدادات Basic قبل Advanced داخل كل مجموعة، ولا يكون خيار أساسي معتمدًا على فتح مجموعة متقدمة.
- **HDL-03-FR-002**: تبقى الـPresets الأربعة داخل ثيم واحد ونواة واحدة دون نسخ كاملة من Twig أو CSS أو JavaScript.
- **HDL-03-FR-003**: يوجد selector واحد بقيم `luxury` و`modern` و`minimal` و`practical_digital`، وله default آمن موثق.
- **HDL-03-FR-004**: يملك كل profile خريطة قيم متناسقة أو إحالة Deferred صريحة إلى Spec مالكة؛ لا توجد قيمة غامضة أو غير مصنفة.
- **HDL-03-FR-005**: يستخدم كل setting يدعم التبعية وضعي `follow_preset` و`custom` وفق ترتيب الحسم في §5؛ `follow_preset` هو الافتراضي.
- **HDL-03-FR-006**: يحفظ تبديل الـPreset جميع Overrides الصالحة. تعرض الواجهة شرحًا ثابتًا لنطاق التغيير وحالات Follow/Custom قبل الحفظ؛ أما الملخص الديناميكي المحسوب قبل التأكيد فيبقى Spike غير قابل للاختيار حتى تثبت Salla واجهة إعدادات قابلة للقراءة/الكتابة لهذا الغرض.
- **HDL-03-FR-007**: يوفر كل Override إجراءً صريحًا للعودة إلى Follow Preset. لا يعرض reset جماعيًا إلا بعد إثبات واجهة Salla تكتب عدة إعدادات وتحافظ على القيم المخفية وتطلب تأكيدًا يوضح نطاق الفقد؛ وإلى ذلك الحين يبقى Reset All Spike غير قابل للاختيار.
- **HDL-03-FR-008**: يغطي Settings Registry كل سجلات `twilight.json` الحالية الـ45 وكل ID جديد معتمد، مع صفر تكرار وصفر سجل بلا owner/default/fallback/source.
- **HDL-03-FR-009**: يكون كل ID ثابت المعنى؛ تغيير معنى ID قائم ممنوع، ويحتاج المعنى الجديد ID جديدًا وخطة ترحيل.
- **HDL-03-FR-010**: يحدد كل سجل Global أو Component. ما يؤثر في المتجر كله لا يتكرر داخل المكونات، وما يخص قسمًا واحدًا لا يصبح إعدادًا عامًا بلا مبرر.
- **HDL-03-FR-011**: يحتوي السجل `label_ar` و`label_en` ووصفًا مفهومًا؛ عرض اللغتين تلقائيًا داخل لوحة سلة لا يُعتمد قبل إثبات قدرة المنصة.
- **HDL-03-FR-012**: ترفض عملية الحسم قيمة غير معروفة وتستخدم fallback آمنًا دون class مكسور أو قيمة CSS غير صالحة، مع حالة `Needs review` قابلة للتتبع.
- **HDL-03-FR-013**: لا يعتمد التخصيص البصري العادي على تطبيق أو API أو طلب شبكة إضافي وقت العرض.
- **HDL-03-FR-014**: لا يغيّر اختيار Preset محتوى التاجر أو ترتيب الصفحة أو الأقسام؛ أي قدرة import/reorder تبقى Spike ولا تعرض كميزة نهائية.
- **HDL-03-FR-015**: لا يضيف النظام إعدادًا إلا إذا كان له أثر مرئي/سلوكي حقيقي، owner، وقاعدة اختبار مستقلة.
- **HDL-03-FR-016**: أي قيمة تصبح body class تملك allowlist كاملة؛ القيم غير الأساسية تملك selector مطابقًا، والقيمة التي تنفذها القواعد الأساسية تُسجل صراحةً `base_variant: true`. يمنع توليد class من نص غير موثق.
- **HDL-03-FR-017**: لا تظهر تركيبة افتراضية تقلل وضوح السعر أو الإتاحة أو زر الشراء أو تكسر عرض 320px أو العربية الطويلة.

## 7. مجموعات الإعدادات وملكيتها

| المجموعة | أمثلة Basic | أمثلة Advanced | المالك النهائي |
|---|---|---|---|
| البداية السريعة | Preset، Follow/Custom summary | reset all overrides | HDL-03 + HDL-24…27 |
| الهوية العامة | عرض المحتوى، spacing، corners، font source | درجات دقيقة مثبتة فقط | HDL-03 |
| Header/Navigation | layout، sticky، wishlist | density، menu details | HDL-07/08 |
| المنتجات والبطاقات | card variant | badges/actions details | HDL-10/18…20 |
| Home sections | variant وعدد العناصر الأساسي | media/behavior detail | HDL-14…17 داخل component fields |
| Cart/Mobile/Footer | visibility/layout الأساسي | granular behavior | HDL-11…13 |
| Motion/Performance | motion level | per-effect controls المثبتة | HDL-05/06 |

الإحالة إلى Spec لاحقة لا تسمح لـHDL-03 باختراع قيمها؛ تسجل ownership وplaceholder غير قابل للاختيار حتى اعتماد تلك Spec.

## 8. الحالات الطرفية والفشل

- تبديل Preset مع صفر Override، Override واحد، وعدة Overrides.
- قيمة custom كانت صحيحة ثم حُذفت من allowed values في إصدار لاحق.
- ID قديم لم يعد له owner أو معنى قابل للاستمرار.
- profile ناقص قيمة تملكها Spec لاحقة.
- تاجر يطلب reset عنصر واحد أو reset جميع Overrides.
- labels عربية/إنجليزية طويلة داخل مساحة إعداد ضيقة.
- إعداد Boolean تابع لشرط والشرط غير متاح في نسخة سلة المستهدفة.
- غياب JavaScript أو فشل أي خدمة خارجية لا يمنع القيم الأساسية؛ النظام لا يحتاج شبكة وقت العرض.
- تطبيق preset مرتين متتاليتين يعطي النتيجة نفسها ولا يراكم طبقات أو classes.

## 9. بوابة Figma قبل Plan

**نوع البوابة:** Settings decision flow + storefront effect map، وليست إعادة رسم لوحة تحكم سلة كاملة.

يجب أن تعرض Revision واحدة قابلة للمقارنة:

1. Settings Map: Global/Component وBasic/Advanced وExisting/Build/Spike/Deferred.
2. Preset selector بالعربية على الجوال أولًا، مع ملخص الأثر قبل التأكيد.
3. مقارنة نفس المحتوى والحالة عبر الـPresets الأربعة، لا أربعة متاجر بمحتوى مختلف.
4. Follow Preset → Custom override → switch preset → return to Follow Preset.
5. Safe/Blocked/Needs review للحالات القديمة أو التركيبات غير المسموحة.
6. Arabic Mobile RTL، Arabic Desktop RTL، وEnglish/LTR parity للمسار الحرج.
7. QA note يوضح ما هو قرار داخل HDL-03 وما تملكه HDL-24…27 أو Specs المكونات.

لا تبدأ Plan قبل اكتمال:

- [x] رابط الصفحة وNode IDs مباشرة لكل لوحة/Frame معتمد.
- [x] استخدام Foundations ومكونات HDL-02 المعتمدة حيث تنطبق.
- [x] نفس المحتوى والحالات في مقارنات الاتجاه والـPreset.
- [x] تصميم النص الطويل وfocus/blocked/needs-review حيث تنطبق؛ loading/empty/error غير منطبقة على مسار بلا نتائج غير متزامنة.
- [x] توضيح ما يتغير وما يبقى Override عند تبديل Preset.
- [x] تمييز Spikes بصريًا وعدم تقديمها كخيارات قابلة للتنفيذ.
- [x] تسجيل موافقة ياسر الصريحة على Revision 1: `APPROVE HDL-03 REV 1`.
- [x] تسجيل Revision وعبارة موافقة ياسر الصريحة في `design.md`.

## 10. متطلبات الجودة غير الوظيفية

- **الأداء والحجم**: لا طلب شبكة جديد لحسم الـPreset، ولا نسخة bundle لكل Preset. يجب أن تقيس الخطة أثر CSS/JS وتمنع تكرار قواعد كاملة لكل profile.
- **الوصول**: قرار Follow/Custom وحالة التحذير لا يعتمدان على اللون وحده؛ labels وfocus order والرسائل قابلة للقراءة بلوحة المفاتيح.
- **التعريب**: Arabic/RTL أولًا وEnglish/LTR مكافئة. لا يكتشف الثيم اللغة بنفسه، ولا يستخدم letter-spacing يكسر العربية.
- **الأمان والثقة**: لا HTML خام، ولا scripts خارجية، ولا مسح صامت لتخصيصات التاجر.
- **الاعتمادية**: Resolution حتمي؛ نفس preset + overrides يعطي القيم نفسها في كل render.
- **الرصد**: التحقق الآلي يخرج IDs المكررة/المفقودة، القيم غير المعروفة، owner gaps، وclass mappings الناقصة كأخطاء قابلة للتتبع.

## 11. الأدلة المطلوبة للقبول

- [x] المواصفة بلا مؤشرات clarification غير محسومة أو placeholder غير مصنف.
- [x] Figma Revision معتمدة حسب §9.
- [x] Plan تجتاز Constitution Check وتحدد الأثر الحجمي والشبكي وإعادة الاستخدام والترحيل.
- [x] Registry يطابق `twilight.json` وcomponent fields بعد التغيير، بصفر duplicate/missing owner/default/fallback.
- [x] `npx webpack --mode production` ينجح عند وجود تغيير مصدر.
- [x] `node scripts/check-theme.mjs --build` ينجح بلا زيادة أخطاء.
- [x] معاينة سلة بعد آخر تعديل تثبت الاختيار والتبديل والـoverride/fallback.
- [ ] Arabic RTL وEnglish LTR على mobile/desktop، مع عرض 320px ونص طويل. — evidence captured, but product-route overflow leaves FR-017 unresolved.
- [x] قياس bundle delta وnetwork delta وتوثيق accessibility evidence. — evidence includes one open off-screen focus finding.
- [ ] Final Review مستقل ثم `ACCEPT HDL-03` من ياسر.

## 12. معايير النجاح القابلة للقياس

- أربعة Presets قانونية داخل ثيم واحد، وصفر نسخة كاملة من شجرة Twig/CSS/JS لكل Preset.
- 45/45 سجلًا عامًا و62/62 حقلًا component/nested حاليًا مصنفًا بمفتاح scope-qualified في Registry، و100% من أي سجل جديد يحقق الحقول المطلوبة.
- صفر Setting ID مكرر، وصفر ID مقروء من القوالب وغير معلن.
- 100% من الإعدادات التابعة تحافظ على Custom overrides عند تبديل الـPreset.
- 100% من القيم غير المعروفة تنتهي إلى fallback موثق ولا تولد class غير معروفة.
- صفر طلب شبكة runtime جديد لحسم التصميم.
- ينجح المسار الحرج في مصفوفة Arabic/English × Mobile/Desktop، بما فيها 320px.
- يستطيع مختبر مستقل من الشرح الثابت وحالات Follow/Custom وخريطة الحسم تحديد نطاق ما سيتغير وما سيبقى مخصصًا قبل الحفظ؛ ولا يُدّعى وجود ملخص ديناميكي قبل التأكيد ما لم تثبته Spike سلة.

## 13. العناصر المؤجلة والـSpikes

- إثبات صيغة labels/descriptions متعددة اللغات داخل لوحة سلة.
- إثبات دعم شروط Advanced الجديدة وصيغتها الدقيقة قبل اعتمادها.
- ملخص التأثير الديناميكي قبل التأكيد وReset All متعدد الإعدادات؛ لا يعرضان كخيارات قبل إثبات واجهة كتابة أصلية من Salla.
- أي import للديمو أو reorder للأقسام؛ خارج ميزة V1 ما لم تنشأ Spike مستقلة ويوافق عليها المالك.
- القيم البصرية النهائية للـPresets الأربعة تملكها HDL-24…27.
- التطبيق التفصيلي للHeader/Card/Motion/Footer يظل داخل Specs المالكة، مع التزامها بعقد HDL-03.

## 14. تعريف الانتهاء

تعتبر HDL-03 منتهية فقط عندما:

1. تغطي الخطة والمهام HDL-03-FR-001…017 وتغلق Spikes أو تبقيها غير قابلة للاختيار.
2. يطابق Registry المصدر الفعلي، وتعمل قواعد الحسم والترحيل بلا فقد overrides.
3. تمر بوابات build/guard/preview والحجم والوصول وRTL/LTR المطلوبة.
4. تتطابق معاينة سلة مع Figma المعتمد أو تُوثق الفروقات ويوافق عليها المالك.
5. يسجل التقرير النهائي الأدلة ثم يكتب ياسر `ACCEPT HDL-03`.
