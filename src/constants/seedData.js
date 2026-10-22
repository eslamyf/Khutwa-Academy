// Database seed and storage keys
export const DB_KEY = 'khutwa_db_v1';
export const SESSION_KEY = 'khutwa_session';

export const gid = (p) => p + Math.random().toString(36).slice(2, 9);
export const L = (a) => a.map(([title, min, url]) => ({ id: gid('l'), title, min, url: url || '' }));

export const TX = { topup: 'شحن رصيد', purchase: 'اشتراك', adjust: 'تعديل', grant: 'اشتراك من الأدمن' };
export const YEARS = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'خريج'];
export const GOALS = ['عمل حر', 'وظيفة', 'تغيير مجال', 'تطوير مهاراتي'];

export function initialSeed() {
  return {
    v: 3,
    settings: {
      whatsapp: '201000000000',
      vodafone: '01012345678',
      instapay: 'khutwa@instapay'
    },
    users: [
      {
        id: 'u_admin',
        name: 'مدير خطوة',
        email: 'admin@khutwa.com',
        pass: 'admin123',
        role: 'admin',
        balance: 0,
        phone: '',
        profile: {},
        status: 'active',
        created: Date.now()
      }
    ],
    courses: [
      {
        id: 'frontend',
        title: 'معسكر تطوير واجهات الويب',
        weeks: 8,
        price: 650,
        pub: true,
        img: '',
        desc: '٨ أسابيع تبني فيها واجهات مواقع حقيقية خطوة بخطوة، مع إرشاد فردي أسبوعي.',
        outcomes: [
          'تبني صفحة ويب متجاوبة من الصفر',
          'تربط التصميم بالكود وتنظم مشروعك على GitHub',
          'ترفع مشروعك أونلاين وتضيفه للبورتفوليو'
        ],
        lessons: L([
          ['إزاي بيشتغل الويب', 12, 'https://www.youtube.com/watch?v=edBBbWSdfAg'],
          ['HTML من الصفر', 60, 'https://www.youtube.com/watch?v=6QAELgirvjs'],
          ['CSS والتخطيط', 30, 'https://www.youtube.com/watch?v=R6Ygwllc_a8'],
          ['JavaScript أساسيات', 35, 'https://www.youtube.com/watch?v=GM6dQBmc-Xg'],
          ['مشروع الأسبوع: صفحة شخصية', 28, 'https://www.youtube.com/watch?v=UB1O30fR-EE'],
          ['التجاوب مع الموبايل', 22, 'https://www.youtube.com/watch?v=R6Ygwllc_a8'],
          ['رفع المشروع أونلاين', 15, 'https://www.youtube.com/watch?v=LbChVEs_mLs']
        ])
      },
      {
        id: 'ux',
        title: 'مسار التصميم UX/UI',
        weeks: 6,
        price: 500,
        pub: true,
        img: '',
        desc: '٦ أسابيع تتعلم فيها تصمم تجربة مستخدم كاملة من الفكرة للنموذج التفاعلي.',
        outcomes: [
          'تفهم المستخدم وتحوّله لمشكلة تتحل',
          'ترسم Wireframe وتطوره لتصميم نهائي',
          'تعرض مشروعك في بورتفوليو'
        ],
        lessons: L([
          ['يعني إيه UX؟', 10, 'https://www.youtube.com/watch?v=8TCjKKReoo8'],
          ['فهم المستخدم', 20, 'https://www.youtube.com/watch?v=LkX8acAE8_A'],
          ['الـ Wireframe', 25, 'https://www.youtube.com/watch?v=-qMP94fKHa4'],
          ['الألوان والخطوط', 22, 'https://www.youtube.com/watch?v=8TCjKKReoo8'],
          ['النموذج التفاعلي', 30, 'https://www.youtube.com/watch?v=-qMP94fKHa4'],
          ['عرض مشروعك', 15, 'https://www.youtube.com/watch?v=LkX8acAE8_A']
        ])
      },
      {
        id: 'marketing',
        title: 'التسويق الرقمي وصناعة المحتوى',
        weeks: 6,
        price: 450,
        pub: true,
        img: '',
        desc: '٦ أسابيع تخطط فيها محتوى حقيقي وتنشره وتقيس نتيجته.',
        outcomes: [
          'تحدد جمهورك وتكتب خطة محتوى',
          'تنشر وتجدول على المنصات',
          'تقيس النتائج وتحسّن'
        ],
        lessons: L([
          ['أساسيات التسويق الرقمي', 12, 'https://www.youtube.com/watch?v=7RACMcT0vLg'],
          ['فهم الجمهور', 18, 'https://www.youtube.com/watch?v=STbhc0Rvzao'],
          ['صناعة المحتوى', 28, 'https://www.youtube.com/watch?v=5a-RkzUEqAM'],
          ['الجدولة والنشر', 20, 'https://www.youtube.com/watch?v=7RACMcT0vLg'],
          ['قياس النتائج', 22, 'https://www.youtube.com/watch?v=STbhc0Rvzao'],
          ['مشروع حملة كاملة', 30, 'https://www.youtube.com/watch?v=5a-RkzUEqAM']
        ])
      }
    ],
    enr: [],
    tx: [],
    leads: [],
    subRequests: []
  };
}
