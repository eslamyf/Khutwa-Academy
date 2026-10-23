// Khutwa Academy - Course Lessons Data (Frontend Only / No Backend)
// To change/add real YouTube video IDs, update the `videoId` field for each lesson below.

export const COURSES_LESSONS = {
  frontend: {
    id: 'frontend',
    title: 'معسكر تطوير واجهات الويب',
    instructor: 'م. إسلام ياسر',
    instructorRole: 'Senior Frontend Engineer & Web Instructor',
    price: 650,
    lessons: [
      {
        id: 'fe_01',
        title: 'إزاي بيشتغل الويب',
        duration: 12,
        description: 'تفهم إيه اللي بيحصل بالظبط من لحظة ما تكتب عنوان موقع لحد ما الصفحة تظهر.',
        objectives: [
          'الفرق بين المتصفح والسيرفر',
          'يعني إيه Frontend و Backend',
          'رحلة الطلب والرد (HTTP Request & Response)'
        ],
        videoId: 'edBBbWSdfAg',
        isFree: true,
        resources: [
          { name: 'ملخص رحلة الويب (PDF)', type: 'pdf' },
          { name: 'رسم توضيحي للـ Client/Server', type: 'image' }
        ]
      },
      {
        id: 'fe_02',
        title: 'HTML من الصفر',
        duration: 60,
        description: 'تبني هيكل أي صفحة ويب بإيدك باستخدام العناصر القياسية والدلالية.',
        objectives: [
          'العناوين والفقرات والروابط',
          'الصور والقوائم والجداول',
          'هيكل صفحة كاملة و Semantic HTML'
        ],
        videoId: '6QAELgirvjs',
        isFree: false,
        resources: [
          { name: 'ملف الدرس التوجيهي (PDF)', type: 'pdf' },
          { name: 'الكود المصدري للتطبيقات', type: 'code' }
        ]
      },
      {
        id: 'fe_03',
        title: 'CSS والتخطيط',
        duration: 30,
        description: 'تلوّن الصفحة وترتب عناصرها باحترافية وتتحكم في المسافات والتصميم.',
        objectives: [
          'الألوان والخطوط ونموذج الصندوق (Box Model)',
          'تخطيط العناصر بواسطة Flexbox',
          'بناء شبكات متطورة بـ CSS Grid'
        ],
        videoId: 'X1ulCwyhCVM',
        isFree: false,
        resources: [
          { name: 'دليل Flexbox السريع (PDF)', type: 'pdf' },
          { name: 'ملفات الستايل الجاهزة', type: 'code' }
        ]
      },
      {
        id: 'fe_04',
        title: 'JavaScript أساسيات',
        duration: 35,
        description: 'تخلي الصفحة تتفاعل مع المستخدم وتستجيب للنقرات والأحداث ديناميكياً.',
        objectives: [
          'المتغيرات وأنواع البيانات والدوال',
          'التعامل مع شجرة الصفحة DOM',
          'الاستجابة للنقر والأحداث Event Listeners'
        ],
        videoId: 'GM6dQBmc-Xg',
        isFree: false,
        resources: [
          { name: 'شيت شيت جافاسكريبت (PDF)', type: 'pdf' },
          { name: 'مشاريع وأكواد تطبيقية', type: 'code' }
        ]
      },
      {
        id: 'fe_05',
        title: 'مشروع الأسبوع: صفحة شخصية',
        duration: 28,
        description: 'تطبق كل اللي اتعلمته في بناء بورتفوليو حقيقي متكامل يعرض مهاراتك.',
        objectives: [
          'تخطيط هيكل المشروع وتقسيم المهام',
          'كتابة كود نظيف وتطبيقي',
          'التنفيذ خطوة بخطوة حتى الانتهاء'
        ],
        videoId: 'UB1O30fR-EE',
        isFree: false,
        resources: [
          { name: 'تصميم المشروع (Figma / PDF)', type: 'pdf' },
          { name: 'كود البورتفوليو المصدري', type: 'code' }
        ]
      },
      {
        id: 'fe_06',
        title: 'التجاوب مع الموبايل',
        duration: 22,
        description: 'موقعك يظبط على أي شاشة سواء موبايل أو تابلت أو شاشات عملاقة.',
        objectives: [
          'قواعد Media Queries ونقاط التوقف Breakpoints',
          'منهجية التصميم للهاتف أولاً Mobile First',
          'اختبار التجاوب على مختلف الأجهزة'
        ],
        videoId: '1Rs2ND1ryYc',
        isFree: false,
        resources: [
          { name: 'دليل التجاوب مع الشاشات (PDF)', type: 'pdf' },
          { name: 'أكواد الميديا كويري المتجاوبة', type: 'code' }
        ]
      },
      {
        id: 'fe_07',
        title: 'رفع المشروع أونلاين',
        duration: 15,
        description: 'تنشره ويشوفه الناس بلينك حي على الإنترنت وتضيفه لسيرتك الذاتية.',
        objectives: [
          'استخدام Git و GitHub لحفظ الكود',
          'النشر المجاني على GitHub Pages و Vercel',
          'ربط الدومين وإرسال الرابط للعملاء والشركات'
        ],
        videoId: 'LbChVEs_mLs',
        isFree: false,
        resources: [
          { name: 'خطوات الرفع خطوة بخطوة (PDF)', type: 'pdf' },
          { name: 'أوامر Git الأساسية', type: 'code' }
        ]
      }
    ]
  },
  ux: {
    id: 'ux',
    title: 'مسار التصميم UX/UI',
    instructor: 'أ. سارة أحمد',
    instructorRole: 'Lead Product & UX/UI Designer',
    price: 500,
    lessons: [
      {
        id: 'ux_01',
        title: 'يعني إيه UX؟',
        duration: 10,
        description: 'مدخل لعالم تجربة المستخدم وكيف تؤثر على نجاح المنتجات الرقمية.',
        objectives: [
          'الفرق الجوهري بين UI و UX',
          'مراحل التفكير التصميمي Design Thinking',
          'أمثلة عملية على تطبيقات مشهورة'
        ],
        videoId: '8TCjKKReoo8',
        isFree: true,
        resources: [
          { name: 'دليل مبادئ تجربة المستخدم (PDF)', type: 'pdf' }
        ]
      },
      {
        id: 'ux_02',
        title: 'فهم المستخدم',
        duration: 20,
        description: 'كيف تجري أبحاث المستخدمين وتبني شخصية العميل المستهدف Persona.',
        objectives: [
          'إجراء المقابلات والاستبيانات',
          'صياغة الـ User Persona وخريطة التعاطف',
          'تحديد المشكلات الحقيقية وصياغتها'
        ],
        videoId: 'LkX8acAE8_A',
        isFree: false,
        resources: [
          { name: 'قوالب الـ Persona الجاهزة (PDF)', type: 'pdf' }
        ]
      },
      {
        id: 'ux_03',
        title: 'الـ Wireframe',
        duration: 25,
        description: 'رسم الهياكل الأولية منخفضة الدقة وتحويل الأفكار إلى مخططات.',
        objectives: [
          'رسم الاسكتشات اليدوية Wireframing',
          'تحديد مسار المستخدم User Flow',
          'التطبيق العملي داخل Figma'
        ],
        videoId: '-qMP94fKHa4',
        isFree: false,
        resources: [
          { name: 'مكتبة عناصر الـ Wireframe (Figma)', type: 'code' }
        ]
      },
      {
        id: 'ux_04',
        title: 'الألوان والخطوط',
        duration: 22,
        description: 'اختيار الألوان وبناء التناسق البصري والتيبوغرافي الملائم للعلامة التجارية.',
        objectives: [
          'نظرية الألوان وعلم النفس البصري',
          'اختيار الخطوط العربية وتحديد التدرج الهرمي',
          'تصميم واجهات متناسقة وسهلة القراءة'
        ],
        videoId: '8TCjKKReoo8',
        isFree: false,
        resources: [
          { name: 'لوحات ألوان وخطوط عربية موصى بها (PDF)', type: 'pdf' }
        ]
      },
      {
        id: 'ux_05',
        title: 'النموذج التفاعلي',
        duration: 30,
        description: 'ربط الشاشات وعمل بروتوتايب تفاعلي حي لاختباره مع المستخدمين.',
        objectives: [
          'أدوات الـ Prototyping في Figma',
          'إضافة الحركات الدقيقة Micro-interactions',
          'اختبار سهولة الاستخدام Usability Testing'
        ],
        videoId: '-qMP94fKHa4',
        isFree: false,
        resources: [
          { name: 'ملف Figma التفاعلي للتدريب', type: 'code' }
        ]
      },
      {
        id: 'ux_06',
        title: 'عرض مشروعك',
        duration: 15,
        description: 'توثيق دراسة الحالة Case Study وعرضها على Behance وبورتفوليو احترافي.',
        objectives: [
          'هيكلة دراسة الحالة وتوضيح الخطوات',
          'تصميم Mockups واقعية للمشروع',
          'نصائح للتقديم على وظائف التصميم'
        ],
        videoId: 'LkX8acAE8_A',
        isFree: false,
        resources: [
          { name: 'قالب دراسة حالة احترافية (PDF)', type: 'pdf' }
        ]
      }
    ]
  },
  marketing: {
    id: 'marketing',
    title: 'التسويق الرقمي وصناعة المحتوى',
    instructor: 'أ. كريم عبد الرحمن',
    instructorRole: 'Growth & Performance Marketing Specialist',
    price: 450,
    lessons: [
      {
        id: 'mkt_01',
        title: 'أساسيات التسويق الرقمي',
        duration: 12,
        description: 'المدخل الشامل للتسويق الحديث وكيف تنمو الشركات عبر القنوات الرقمية.',
        objectives: [
          'مفهوم قمع التسويق Marketing Funnel',
          'الفرق بين التسويق العضوي والإعلانات الممولة',
          'تحديد الأهداف التسويقية SMART Goals'
        ],
        videoId: '7RACMcT0vLg',
        isFree: true,
        resources: [
          { name: 'خارطة طريق المسوق الرقمي (PDF)', type: 'pdf' }
        ]
      },
      {
        id: 'mkt_02',
        title: 'فهم الجمهور',
        duration: 18,
        description: 'تحديد العميل المثالي ودراسة المنافسين ونقاط القوة والضعف.',
        objectives: [
          'تحديد الجمهور المستهدف بدقة',
          'تحليل المنافسين وسد الفجوات السوقية',
          'صياغة القيمة المميزة للعرض Value Proposition'
        ],
        videoId: 'STbhc0Rvzao',
        isFree: false,
        resources: [
          { name: 'نموذج دراسة المنافسين (PDF)', type: 'pdf' }
        ]
      },
      {
        id: 'mkt_03',
        title: 'صناعة المحتوى',
        duration: 28,
        description: 'كتابة محتوى جذاب يبيع ويبني علاقة طويلة الأمد مع المتابعين.',
        objectives: [
          'أنواع المحتوى التسويقي الفعّال',
          'مبادئ كتابة الإعلانات المقنعة Copywriting',
          'صياغة الخطاف Hook والدعوة للفعل CTA'
        ],
        videoId: '5a-RkzUEqAM',
        isFree: false,
        resources: [
          { name: 'قوالب بوستات وحملات جاهزة (PDF)', type: 'pdf' }
        ]
      },
      {
        id: 'mkt_04',
        title: 'الجدولة والنشر',
        duration: 20,
        description: 'تنظيم تقويم المحتوى واستخدام الأدوات الأوتوماتيكية للنشر والمتابعة.',
        objectives: [
          'بناء الـ Content Calendar الشهري',
          'أفضل الممارسات للنشر على كل منصة',
          'أدوات الجدولة والتحليل الأوتوماتيكي'
        ],
        videoId: '7RACMcT0vLg',
        isFree: false,
        resources: [
          { name: 'شيت تقويم المحتوى الشهري (Excel/PDF)', type: 'pdf' }
        ]
      },
      {
        id: 'mkt_05',
        title: 'قياس النتائج',
        duration: 22,
        description: 'قراءة الأرقام والإحصائيات وتحسين الحملات لتقليل تكلفة الاكتساب.',
        objectives: [
          'مؤشرات الأداء الرئيسية KPIs (CTR, CPC, ROI)',
          'تحليل نتائج الحملات وتحديد نقاط الضعف',
          'اختبارات A/B Testing للتحسين المستمر'
        ],
        videoId: 'STbhc0Rvzao',
        isFree: false,
        resources: [
          { name: 'دليل مقاييس ومؤشرات التسويق (PDF)', type: 'pdf' }
        ]
      },
      {
        id: 'mkt_06',
        title: 'مشروع حملة كاملة',
        duration: 30,
        description: 'إطلاق خطة تسويقية متكاملة لعلامة تجارية حقيقية وقياس نتائجها.',
        objectives: [
          'تجهيز عناصر الحملة من البداية للنهاية',
          'إدارة الميزانية وتوزيعها على القنوات',
          'تقديم تقرير نهائي بنتائج الحملة والأرباح'
        ],
        videoId: '5a-RkzUEqAM',
        isFree: false,
        resources: [
          { name: 'قالب التقرير التسويقي النهائي (PDF)', type: 'pdf' }
        ]
      }
    ]
  }
};

export default COURSES_LESSONS;
