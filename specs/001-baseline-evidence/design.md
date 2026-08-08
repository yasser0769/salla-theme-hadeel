# Design Handoff: HDL-01 — خط الأساس وخريطة الموجود والأدلة

**Design gate type**: توثيق بصري/تعليقات/QA  
**Status**: Approved  
**Figma file**: https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled  
**Figma page**: `00 · HDL-01 Baseline & Evidence` (`359:2`)  
**Primary board**: [HDL-01 / Board / Rev 1](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=359-3)  
**Design revision**: 1  
**Owner approval**: Approved by Yasser on 2026-08-08  

## هدف اللوحة

HDL-01 لا يصمم واجهة متجر جديدة. المخرج البصري هو لوحة أدلة واحدة تثبت حالة المشروع القابلة لإعادة القياس قبل بدء بقية المواصفات، وتربط الجرد والبناء والمخاطر ونقطة الأصل وملكية بوابة الإصدار.

تظل صفحة Figma الحالية `01 · Cover` دون تغيير. أضيفت صفحة مستقلة للوحة حتى لا تختلط أدلة HDL-01 بمكتبة الواجهة.

## محتوى المراجعة 1

1. **Lineage**: جذر هديل `8bf2ce6`، ولقطة Theme Raed المطابقة `dc902f6`، وTree مطابق `9d9056896ba1`، مع توضيح عدم وجود `merge-base` لأن التاريخ أعيد ابتداؤه.
2. **Inventory**: قوالب الصفحات والمكونات، مكونات Hadeel المخصصة، وسوم `salla-*`، الإعدادات، الترجمات، وحزم JavaScript/CSS.
3. **Build Evidence**: زمن بناء الإنتاج، نتائج `check-theme`، الأوزان الفعلية، وتجاوز سقف 1 MB الموثق.
4. **Risks & Ownership**: وزن الحزمة يملكه HDL-05؛ وتدقيق التمايز الكامل يملكه HDL-29/مالك الإصدار.
5. **Relationship Baseline**: إشارات اختلاف وتشابه عالية المستوى فقط، مع نص صريح يمنع المقارنة `feature-by-feature` في HDL-01.
6. **HDL-29 Release Gate**: بوابة حاجبة عبر المنتج والتصميم والتجربة والقدرات، ومسار `FAIL → owning specs → fix → re-audit`.
7. **Spec Coverage**: جميع المواصفات HDL-01…HDL-29 موزعة على المراحل الست دون فجوات أو تكرار.
8. **Method**: كيفية القياس وحدود الأدلة والـcommit الذي تمثل اللوحة لقطة له.

## Node IDs المعتمدة

| العنصر | الجهاز/الاتجاه | الحالة | Node ID | الرابط/الملاحظة |
|---|---|---|---|---|
| صفحة HDL-01 | Documentation / RTL | Revision 1 | `359:2` | `00 · HDL-01 Baseline & Evidence` |
| لوحة الأدلة كاملة | 1440×5016 / RTL | Approved — Revision 1 | `359:3` | [فتح اللوحة](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=359-3) |
| واجهات Mobile/Desktop | — | Not applicable | — | HDL-01 لوحة توثيق وليست واجهة Storefront. |
| حالات Loading/Empty/Error | — | Not applicable | — | لا توجد رحلة مستخدم أو حالة تفاعلية في مخرج HDL-01. |

## قرار العلاقة مع Theme Raed

- يسجل HDL-01 Baseline مختصرًا وقابلًا لإعادة المقارنة فقط.
- نقطة الأصل مثبتة بتطابق Tree بين جذر هديل ولقطة upstream، لا بوجود `merge-base` مشترك.
- لا توجد مقارنة تفصيلية `feature-by-feature` ضمن HDL-01.
- HDL-29 هو Release Gate الحاجب للتدقيق الكامل في تمايز المنتج والتصميم والتجربة والخصائص.
- إذا فشل أي محور، لا PASS ولا إطلاق؛ تعاد المشكلة إلى المواصفة المالكة، ثم تعالج ويعاد التدقيق.

## Settings Matrix

غير منطبق. لا تضيف HDL-01 إعدادات Merchant ولا تعدل `twilight.json` أو واجهة المتجر.

## التحقق البصري والآلي

- لقطة Figma كاملة أُنشئت بعد اكتمال اللوحة في `2026-08-08 17:29:33 +0300` بدقة أصلية `1440×5016`.
- صفحة HDL-01 تحتوي Top-level Frame واحدًا فقط؛ صفحة الغلاف الأصلية لم تعدل.
- لا عناصر مباشرة خارج حدود اللوحة، ولا أسماء طبقات افتراضية.
- جميع النصوص تستخدم Tajawal (`Regular`, `Bold`, `Black`) ولا توجد خطوط مفقودة.
- جميع التعبئات الصلبة في اللوحة مرتبطة بمتغيرات Hadeel المحلية؛ لم تُستورد مكونات Material أو مكتبات خارجية.
- عدد شرائح المواصفات `29`، من `HDL-01` إلى `HDL-29` دون نقص.
- التحقق النصي أثبت وجود: حدّ منع المقارنة التفصيلية، `BLOCKING RELEASE GATE`، قاعدة `HDL-29 = FAIL`، المحاور الأربعة، ومراجع الأصل واللقطة.

## Design Approval Checklist

- [x] المخرج لوحة توثيق فقط ولا يوسع HDL-01 إلى تصميم Storefront.
- [x] صفحة الغلاف الحالية لم تعدل.
- [x] نقطة الأصل/الـsnapshot base موثقة بأدلة commit وTree.
- [x] الفروقات والتشابهات مسجلة على مستوى عالٍ فقط.
- [x] خطر عدم كفاية التميّز له مالك واضح وبوابة إصدار حاجبة في HDL-29.
- [x] أدلة البناء والجرد قابلة لإعادة القياس.
- [x] جميع HDL-01…HDL-29 ممثلة في Coverage Map.
- [x] Figma visual QA والـNode validation مكتملان.
- [x] موافقة ياسر الصريحة على Revision 1.

## الموافقة

**Owner statement**: `APPROVE HDL-01 REV 1` — **Approved for Implementation**  
**Approved by**: Yasser  
**Date**: 2026-08-08  
**Revision**: 1
