# Design Handoff: HDL-07 — الهيدر بأربعة تخطيطات

**Design gate type**: واجهة مرئية كاملة
**Status**: Revision 1 — approved for implementation
**Figma file**: https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled
**Figma page**: `19 · HDL-07 Header Layouts` (`456:2`)
**Review board**: https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-2
**Design revision**: 1
**Owner approval**: `APPROVE HDL-07 REV 1` — 2026-08-11

## القرار المصمم

- نواة واحدة للشعار والقائمة والبحث والحساب والمفضلة والسلة.
- أربعة IDs للتخطيط: `centered`, `start`, `transparent`, `commerce`.
- القيمتان القائمتان `centered|start` تحتفظان بمعناهما؛ لا توجد migration مدمرة.
- الأربعة Desktop متميزة، لكنها تنهار إلى نواة Mobile واحدة.
- `transparent` للرئيسية فقط افتراضيًا، ويتحول إلى سطح مقروء بعد التمرير.
- إذا لم يوجد Hero مؤهل أو لم يتوفر تباين/شعار مناسب، يستخدم الهيدر العادي فورًا.
- تفاصيل Mega Menu يملكها HDL-08، ونتائج/اقتراحات البحث يملكها HDL-09.

## مكونات Figma

| المكوّن | Node ID | الرابط | العقد |
|---|---:|---|---|
| Review board | `460:2` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-2) | لوحة Rev 1 الكاملة |
| Desktop headers | `457:202` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=457-202) | Layout 4 × Direction 2 × State 2 = 16 variants |
| Mobile header | `459:112` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=459-112) | Direction 2 × State 4 = 8 variants |
| HDL-02 reused primitive | `389:61` | [فتح](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=389-61) | أصل الاتجاه/الجهاز/فتح البحث؛ لا يعدّل في HDL-07 |

## Desktop — نفس المحتوى والحالة

| التخطيط | Arabic / RTL / Top | English / LTR / Top |
|---|---|---|
| Centered | [`460:40`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-40) | [`460:54`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-54) |
| Start | [`460:69`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-69) | [`460:83`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-83) |
| Transparent | [`460:98`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-98) | [`460:112`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-112) |
| Commerce | [`460:127`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-127) | [`460:143`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-143) |

## Mobile — الحالات الحرجة

| الاتجاه | Top | Scrolled | Menu open | Search open |
|---|---|---|---|---|
| Arabic RTL | [`460:223`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-223) | [`460:238`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-238) | [`460:253`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-253) | [`460:270`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-270) |
| English LTR | [`460:287`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-287) | [`460:302`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-302) | [`460:317`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-317) | [`460:334`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-334) |

## الشفافية والفشل الآمن

| السيناريو | Node ID | القرار |
|---|---:|---|
| Dark Hero / Top | [`460:164`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-164) | شعار/حبر فاتح فوق Hero داكن |
| Scrolled / Surface | [`460:179`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-179) | سطح ثابت مع ارتفاع محجوز، دون layout jump |
| No Hero / Fallback | [`460:194`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-194) | هيدر عادي فورًا، دون flash |
| Light Hero / Auto contrast | [`460:208`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=460-208) | حبر/شعار داكن مثبت؛ وإلا تلغى الشفافية |

## Edge cases

اللوحة [`461:229`](https://www.figma.com/design/12z0jRutTHcdhlZQrRmcXU/Untitled?node-id=461-229) تغطي:

- شعارًا طويلًا وقائمة مزدحمة في RTL وLTR؛ الروابط الزائدة تنتقل إلى More بدل الالتفاف.
- غياب صورة الشعار؛ يعرض اسم المتجر كنص مقروء.
- إخفاء البحث؛ تعاد موازنة أهداف اللمس المتبقية.
- أهداف لمس 44px، وترتيب focus منطقي، وعودة focus إلى المشغّل بعد إغلاق Drawer.

## Settings Matrix

| Setting ID | المستوى | القيم | القرار |
|---|---|---|---|
| `header_layout` | Basic | `centered|start|transparent|commerce` | الحفاظ على القيمتين القائمتين وإضافة قيمتين فقط |
| `header_is_sticky` | Basic | boolean | ID قائم؛ يحجز الارتفاع لمنع القفزة |
| `header_transparent_home` | Basic | boolean | الرئيسية وHero المؤهل فقط |
| `header_show_search` | Basic | boolean | تحكم ظهور جديد؛ لا يعيد بناء البحث |
| `header_show_wishlist` | Basic | boolean | ID قائم |
| `header_show_account` | Basic | boolean | تحكم ظهور جديد |
| `header_logo_size` | Advanced | `small|medium|large` | نطاق آمن، بلا تشويه |
| `header_density` | Advanced | `compact|comfortable` | ID وقيم قائمة |
| `header_transparent_ink` | Advanced | `auto|light|dark` | `auto` يفشل إلى الهيدر العادي عند عدم اليقين |

## What mirrors / what does not / why

- **Mirrors**: ترتيب start/end، جهة Drawer، اتجاه submenu، الأسهم الاتجاهية، ومسار focus.
- **Does not mirror**: الشعار، صور Hero/المنتج، Search/Cart/Play/Check، الأرقام والعملات والروابط.
- **Why**: ينعكس ما يحمل معنى اتجاهيًا فقط؛ الهوية والصور والرموز غير الاتجاهية تبقى ثابتة.

## حدود الإثبات

- Figma يثبت نية المنتج والتصميم، ولا يثبت سلوك Salla runtime.
- قدرة تحديد أول Hero مناسب، وتوفر شعار فاتح/داكن، وتفاصيل Salla editor هي **Spike** في Plan.
- حالات loading/error لبيانات Mega Menu ونتائج البحث تقع في HDL-08/09؛ HDL-07 يثبت shell وفشل الهيدر الآمن فقط.
- لا توجد صور أو خطوط أو أصول جديدة في التصميم؛ الخط الفعلي يأتي من اختيار التاجر في سلة.

## Design Approval Checklist

- [x] Mobile Arabic/RTL complete.
- [x] Desktop Arabic/RTL complete.
- [x] Critical English/LTR parity reviewed.
- [x] Top, scrolled, menu-open, search-open, no-Hero, light-Hero and long-content states reviewed.
- [x] Merchant settings and variants annotated.
- [x] Feasibility unknowns marked as Spike.
- [x] Performance-sensitive media avoided; no new media requirement.
- [x] Owner wrote: **APPROVE HDL-07 REV 1**.
- [x] Approval date recorded.

## الموافقة

**Owner statement**: `APPROVE HDL-07 REV 1`
**Approved by**: Yasser
**Date**: 2026-08-11
**Revision**: 1
**Acceptance gate**: `460:411` — بوابة قبول Figma للوحة Revision 1 (تطابق
القبول البصري النهائي في مرحلة المعاينة الحية).
