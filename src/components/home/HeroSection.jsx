import React from 'react';

export function HeroSection() {
  return (
    <section className="hero">
      <div>
        <h1 className="hero-title">
          <span className="l l-brand"><span>أكاديمية خطوة —</span></span>
          <span className="l l-main"><span>معاك خطوة بخطوة لحد ما توصل للقمة</span></span>
          <span className="l l-sub"><span>من غير وعود وهمية بخطوات حقيقية</span></span>
        </h1>
        <a className="btn" href="#j">شوف المسارات</a>
      </div>
      <div className="stairs" aria-hidden="true">
        <i style={{ '--n': 1 }}></i><i style={{ '--n': 2 }}></i><i style={{ '--n': 3 }}></i>
        <i style={{ '--n': 4 }}></i><i style={{ '--n': 5 }}></i><i style={{ '--n': 6 }}></i>
        <img className="hop" src="assets/icon-cyan.png" alt="" />
      </div>
      <div className="scrollcue" id="cue" aria-hidden="true">
        <span>انزل وابدأ الرحلة</span><i></i>
      </div>
    </section>
  );
}

export default HeroSection;
