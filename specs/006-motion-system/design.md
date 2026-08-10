# Design Handoff: HDL-06 — نظام الحركة بثلاثة مستويات

**Design gate type**: واجهة مرئية كاملة
**Status**: Revision 1 — Approved for Implementation
**Figma file**: https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled
**Figma page**: [18 · HDL-06 Motion System](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=443-2)
**Main board**: [HDL-06 Motion System · Revision 1](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=443-3)
**Design revision**: 1
**Design model**: GPT-5.6 Sol High via Codex; Claude Opus 5 High was retried at the new-Spec boundary, produced no output, and was stopped safely
**Owner approval**: Approved by Yasser on 2026-08-10 after correcting CTA logical-start alignment

## شرح مبسط

Revision 1 توحّد الحركة في عقد واحد بثلاث شخصيات قابلة للتمييز، وتحافظ على ظهور السعر وCTA والمحتوى الحرج عند `0ms`. تصميم Figma يستخدم Tajawal للعرض داخل ملف التصميم فقط؛ الثيم في التشغيل لا يشحن أي خط محلي ويستخدم خط التاجر القادم من إعدادات سلة مع system fallback.

## القرار البصري والسلوكي

| المستوى | الحد الأقصى | الانتقال | المسافة | Reveal |
|---|---:|---|---:|---|
| Calm | 160ms | Dissolve / state feedback | 0–4px | Off |
| Balanced | 240ms | Smart Animate / standard | 0–8px | مرة واحدة لغير الحرج |
| Rich | 400ms | Smart Animate / emphasized | 0–20px | Stagger محدود |
| Rich + Reduced Motion | 100ms | Dissolve / state-only | 0px | صفر حركة غير ضرورية |

`prefers-reduced-motion` يتغلب دائمًا على اختيار التاجر. خفض حركة الجوال مفعّل افتراضيًا ويقيد Rich إلى سلوك Balanced في reveal/hover، دون تعطيل feedback أو حالات loading/error.

## Node IDs وروابط المراجعة

| العنصر/الشاشة | الجهاز | اللغة/الاتجاه | الحالة | Node ID | الرابط |
|---|---|---|---|---|---|
| Cover + contract | Responsive | Arabic / RTL first | Revision 1 | `443:4` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=443-4) |
| Motion token contract | Responsive | Bidirectional | Calm/Balanced/Rich/Reduce | `443:21` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=443-21) |
| Calm storyboard | Mobile | Arabic / RTL | Five identical cases | `444:3` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=444-3) |
| Balanced storyboard | Mobile | Arabic / RTL | Five identical cases | `444:49` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=444-49) |
| Rich storyboard | Mobile | Arabic / RTL | Five identical cases | `444:95` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=444-95) |
| Rich + Reduced Motion | Mobile | Arabic / RTL | Accessibility override | `444:141` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=444-141) |
| Direction parity matrix | Mobile/Desktop | Arabic RTL + English LTR | Same content/state/timing | `446:3` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=446-3) |
| Arabic Mobile RTL | Mobile | Arabic / RTL | Balanced | `446:7` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=446-7) |
| English Mobile LTR | Mobile | English / LTR | Balanced | `446:30` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=446-30) |
| Arabic Desktop RTL | Desktop | Arabic / RTL | Balanced | `446:54` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=446-54) |
| English Desktop LTR | Desktop | English / LTR | Balanced | `446:77` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=446-77) |
| QA + Settings | Responsive | Bidirectional | Allowed/Forbidden/Spike | `446:100` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=446-100) |

## Prototypes القابلة للنقر

افتح Frame الحالة المغلقة واضغط الزر الأساسي؛ زر **إغلاق** يعيد الحالة. التفاعلات القياسية في Figma مثبتة في الاتجاهين لكل زوج.

| المستوى | Closed Node | Open Node | Transition المثبت |
|---|---|---|---|
| Calm | [`447:7`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=447-7) | [`447:24`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=447-24) | Dissolve 160ms |
| Balanced | [`447:43`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=447-43) | [`447:60`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=447-60) | Smart Animate 240ms |
| Rich | [`447:79`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=447-79) | [`447:96`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=447-96) | Smart Animate 400ms + bounded spatial hierarchy |
| Rich + Reduced Motion | [`447:115`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=447-115) | [`447:132`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=447-132) | Dissolve 100ms; no spatial movement |

واجهة Figma timeline المتقدمة (`metronome`) غير متاحة في جلسة الأداة، لذلك استخدم Revision 1 انتقالات Figma القياسية القابلة للنقر مع Storyboards زمنية للحالات الخمس. هذا قيد في أداة التصميم، وليس ادعاءً عن runtime سلة.

## Settings Matrix

| الخاصية | النطاق | Setting ID | المستوى | القيم/الافتراضي | الحالة |
|---|---|---|---|---|---|
| شخصية الحركة | Global | `motion_level` | Basic | `calm / balanced / rich`; default `balanced` | New |
| خفض Rich على الجوال | Global | `motion_reduce_mobile` | Advanced | boolean; default `true` | New |
| Feedback بعد الإضافة | Product | `product_add_to_cart_animation` | Advanced | القيم الحالية؛ لا جذب دوري | Existing — meaning narrowed safely |
| الفاصل القديم | Product | `product_add_to_cart_animation_interval` | Compatibility | القيمة المخزنة تبقى؛ لا مؤقت دوري | Existing — no-op |

## QA وحدود المنصة

- **Allowed**: feedback بعد الفعل، Drawer/Modal state، reveal واحد لغير المحتوى الحرج، Slider transition.
- **Forbidden**: CTA دوري، محتوى مخفي حتى JavaScript، bounce متكرر، smooth scroll تحت reduce.
- **Mirrors**: start/end translation، جهة Drawer، واتجاه Slider/Carousel.
- **Does not mirror**: fade، scale، spinner، الشعارات، صور المنتجات، الصور الفوتوغرافية، Search/Cart/Play/Check.
- **CTA logical start**: زر العربية عند اليمين في RTL، وزر الإنجليزية عند اليسار في LTR؛ الإطارات الأربعة المثبتة تستخدم wrappers `451:23`–`451:26`.
- **Platform-owned Spike**: انتقالات `salla-drawer` و`salla-modal` و`salla-slider` الداخلية لا تعتبر قابلة للتحكم حتى يثبت API أو rendered storefront.
- حالات القبول المسجلة: Loading، Empty، Error، Disabled، نص طويل، mixed SKU/URL، No-JS، وجهاز منخفض الأداء.

## الفروقات المقبولة بين Figma وسلة

| الفرق | السبب | موافقة المالك |
|---|---|---|
| انتقالات مكونات سلة الداخلية قد تختلف عن Prototype | Platform-owned Spike؛ لا override هش قبل قياس المتجر الفعلي | Approved as a runtime verification boundary |
| خط Figma هو Tajawal، بينما runtime يستخدم خط التاجر + system fallback | قرار معماري دائم: لا Fonts محلية داخل الثيم | Approved |

## Design Approval Checklist

- [x] Mobile Arabic/RTL complete.
- [x] Desktop Arabic/RTL comparison complete.
- [x] Critical English/LTR parity reviewed with the same content and timing.
- [x] Loading, empty, error, disabled, long-content, and no-JS states documented where applicable.
- [x] Merchant settings and legacy compatibility annotated.
- [x] Feasibility unknowns marked as Platform-owned Spike.
- [x] Performance invariant and critical content at `0ms` annotated.
- [x] Owner wrote: **Approved for Implementation** (`APPROVE HDL-06 REV 1`).
- [x] Approval date recorded.

## الموافقة

**Owner statement**: **Approved for Implementation — APPROVE HDL-06 REV 1**
**Approved by**: Yasser
**Date**: 2026-08-10
**Revision**: 1
