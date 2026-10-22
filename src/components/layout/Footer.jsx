import React from 'react';

export function Footer() {
  return (
    <footer>
      <span>
        <img className="logo-d" src="assets/Asset_103.png" alt="أكاديمية خطوة" />
        <img className="logo-l" src="assets/Asset_42.png" alt="أكاديمية خطوة" />
      </span>
      <div className="footer-socials">
        <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
        <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
        <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
        <a href="https://wa.me/201012345678" target="_blank" rel="noreferrer" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
      </div>
      <small>Your Way To Success © {new Date().getFullYear()}</small>
    </footer>
  );
}

export default Footer;
