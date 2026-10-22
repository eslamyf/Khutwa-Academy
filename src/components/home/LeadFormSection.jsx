import React, { useState } from 'react';
import { useKhutwa } from '../../hooks';
import { gid } from '../../utils';

export function LeadFormSection() {
  const { db, saveDb } = useKhutwa();
  const [leadForm, setLeadForm] = useState({ track: 'frontend', name: '', phone: '' });
  const [leadSent, setLeadSent] = useState(false);

  // Lead Form submission
  const handleLeadSubmit = (e) => {
    e.preventDefault();
    const newLead = {
      id: gid('q'),
      name: leadForm.name.trim(),
      phone: leadForm.phone.trim(),
      track: leadForm.track,
      date: Date.now(),
      status: 'new'
    };
    saveDb({ ...db, leads: [newLead, ...db.leads] });
    setLeadSent(true);
  };

  return (
    <section className="join" id="join">
      <div className={`form ${leadSent ? 'sent' : ''}`}>
        <h2>جاهز؟<br />سيب رقمك وهن1تواصل معاك</h2>
        <form id="f" style={{ display: 'grid', gap: '20px' }} onSubmit={handleLeadSubmit}>
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
            className="in"
            name="phone"
            type="tel"
            inputMode="tel"
            dir="rtl"
            placeholder="رقم واتساب"
            required
            autoComplete="tel"
            value={leadForm.phone}
            onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
          />
          <button className="btn" type="submit">ابدأ خطوتك</button>
        </form>
        <p className="ok">وصلنا طلبك. هنكلمك على واتساب.</p>
        <a href="#/auth/register" className="alt">أو اعمل حساب وابدأ دلوقتي ←</a>
      </div>

      <div className="side">
        <img src="assets/icon-color.png" alt="" />
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
