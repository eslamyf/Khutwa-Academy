import React from 'react';

export function StatsSection() {
  return (
    <section className="stats-sec" id="stats">
      <div className="stats-wrap">
        <div className="stats-header">
          <span className="stats-tag">أرقام وإحصائيات حقيقية من أرض الواقع</span>
          <h2>مش مجرد وعود.. أرقام تثبت الفرق</h2>
          <p>
            بدأنا كمبادرة شبابية ودرّبنا مئات الطلاب بكليات مصر الإقليمية والنظرية، وفتحنا لهم طريق العمل الحر والوظائف في السوق الرقمي.
          </p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-num">+200</div>
            <div className="stat-title">طالب وخريج تدربوا معنا</div>
            <div className="stat-desc">تخرجوا بتطبيقات حقيقية وتدريب تفاعلي مركز ومتابعة مستمرة.</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">3</div>
            <div className="stat-title">مسارات رقمية مطلوبة</div>
            <div className="stat-desc">تطوير واجهات الويب، تصميم وتجربة UX/UI، والتسويق وصناعة المحتوى.</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">100%</div>
            <div className="stat-title">مشاريع عملية للبورتفوليو</div>
            <div className="stat-desc">تطبيق عملي بعيداً عن الحشو النظري عشان تخرج بمشاريع حقيقية على أرض الواقع.</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">1-on-1</div>
            <div className="stat-title">إرشاد وتوجيه فردي أسبوعي</div>
            <div className="stat-desc">مينتور متخصص يتابع تقدمك الشخصي ويحل معاك كل خطوة وتحدي.</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">+85%</div>
            <div className="stat-title">نسبة التوظيف والعمل الحر</div>
            <div className="stat-desc">خريجون اقتنصوا فرص تدريب ووظائف وعملاء فريلانس حقيقيين.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
