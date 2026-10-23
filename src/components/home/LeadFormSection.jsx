import React, { useState } from 'react';
import { useKhutwa } from '../../hooks';
import { gid } from '../../utils';

export function LeadFormSection() {
  const { db, saveDb, user } = useKhutwa();
  const [leadForm, setLeadForm] = useState({
    track: 'frontend',
    name: user?.name || '',
    phone: user?.phone || '',
    message: ''
  });
  const [leadSent, setLeadSent] = useState(false);

  // Lead Form submission
  const handleLeadSubmit = (e) => {
    e.preventDefault();
    const newLead = {
      id: gid('q'),
      name: leadForm.name.trim(),
      phone: leadForm.phone.trim(),
      message: leadForm.message ? leadForm.message.trim() : '',
      track: leadForm.track,
      date: Date.now(),
      status: 'new',
      userId: user?.id || null,
      userEmail: user?.email || null
    };
    saveDb({ ...db, leads: [newLead, ...db.leads] });
    setLeadSent(true);
  };

  return (
    <section className="join" id="join">
      <div className={`form ${leadSent ? 'sent' : ''}`}>
        <h2>
          <span>عندك أي استفسار؟</span>
          <span style={{ display: 'block', marginTop: '10px' }}>سيب بياناتك وهنتواصل معاك</span>
        </h2>
        <form id="f" style={{ display: 'grid', gap: '18px' }} onSubmit={handleLeadSubmit}>
          <div className="opts" role="radiogroup" aria-label="المسار">
            <label>
              <input
                type="radio"
                name="track"
                value="frontend"
                checked={leadForm.track === 'frontend'}
                onChange={() => setLeadForm({ ...leadForm, track: 'frontend' })}
              />
              <span>واجهات الويب</span>
            </label>
            <label>
              <input
                type="radio"
                name="track"
                value="ux"
                checked={leadForm.track === 'ux'}
                onChange={() => setLeadForm({ ...leadForm, track: 'ux' })}
              />
              <span>UX/UI</span>
            </label>
            <label>
              <input
                type="radio"
                name="track"
                value="marketing"
                checked={leadForm.track === 'marketing'}
                onChange={() => setLeadForm({ ...leadForm, track: 'marketing' })}
              />
              <span>التسويق</span>
            </label>
          </div>
          <input
            id="lead-name"
            aria-label="الاسم بالكامل"
            className="in"
            name="name"
            dir="rtl"
            placeholder="اسمك"
            required
            autoComplete="name"
            value={leadForm.name}
            onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
          />
          <input
            id="lead-phone"
            aria-label="رقم الهاتف للتواصل"
            className="in"
            name="phone"
            type="tel"
            inputMode="tel"
            dir="rtl"
            placeholder="رقم هاتفك للتواصل"
            required
            autoComplete="tel"
            value={leadForm.phone}
            onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
          />
          <textarea
            id="lead-message"
            aria-label="استفسارك أو سؤالك"
            className="in"
            name="message"
            dir="rtl"
            rows="2"
            placeholder="عندك أي استفسار أو سؤال؟ اكتبه هنا..."
            style={{
              minHeight: '76px',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '1.15rem',
              lineHeight: '1.4'
            }}
            value={leadForm.message}
            onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
          />
          <button className="btn" type="submit">ابدأ خطوتك وأرسل استفسارك</button>
        </form>
        <p className="ok">وصلنا طلبك واستفسارك بنجاح. هنتواصل معاك قريباً جداً.</p>
        <a href="#/auth/register" className="alt">
          أو اعمل حساب وابدأ دلوقتي <i className="fa-solid fa-arrow-left" style={{ marginInlineStart: '4px' }}></i>
        </a>
      </div>

      <div className="side">
        <img src="assets/icon-color.png" alt="أكاديمية خطوة" width="94" height="83" loading="lazy" />
        <div className="words" aria-hidden="true">
          <span>مشاريع حقيقية</span>
          <span>إرشاد فردي أسبوعي</span>
          <span>فرص توظيف للمتفوقين</span>
        </div>
      </div>
    </section>
  );
}

export default LeadFormSection;
