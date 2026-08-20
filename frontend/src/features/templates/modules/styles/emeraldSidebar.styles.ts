import { baseDocumentStyles } from '../../renderers/types'

export const emeraldSidebarStyles = `
  ${baseDocumentStyles}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #2b2b2b;
    line-height: 1.45;
    display: flex;
    flex-direction: row;
    min-height: 297mm;
    padding: 0 !important;
    background: #ffffff;
  }

  /* ---------- Left Dark Emerald Sidebar ---------- */
  .sidebar {
    width: 33%;
    background-color: #233d32;
    color: #ffffff;
    padding: 32px 22px;
    flex-shrink: 0;
  }

  .photo-container {
    text-align: center;
    margin-bottom: 16px;
  }

  .profile-photo {
    width: 108px;
    height: 108px;
    border-radius: 50%;
    border: 3.5px solid rgba(255, 255, 255, 0.9);
    object-fit: cover;
    display: block;
    margin: 0 auto;
    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  }

  .photo-placeholder {
    width: 108px;
    height: 108px;
    border-radius: 50%;
    border: 3.5px solid rgba(255, 255, 255, 0.9);
    background-color: #1a2f26;
    color: #a3c9b8;
    font-size: 36px;
    font-weight: 700;
    line-height: 100px;
    text-align: center;
    display: block;
    margin: 0 auto;
  }

  .name {
    font-size: 22px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.18;
    letter-spacing: -0.2px;
    margin-top: 8px;
    text-align: center;
  }

  .title {
    font-size: 12px;
    font-weight: 500;
    color: #a3c9b8;
    margin-top: 4px;
    margin-bottom: 18px;
    text-align: center;
  }

  .sidebar-section-title {
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    font-weight: 700;
    color: #e2f0ea;
    margin-top: 18px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.22);
    padding-bottom: 2.5px;
  }

  .sidebar-item {
    margin-bottom: 6px;
    color: #d1e7dd;
    font-size: 10.5px;
    line-height: 1.45;
    word-break: break-word;
  }

  .sidebar-item strong {
    color: #ffffff;
    display: block;
    font-size: 10.5px;
  }

  .sidebar-item .sub {
    color: #9ec5b3;
    font-size: 9.5px;
  }

  .sidebar-skills {
    color: #d1e7dd;
    font-size: 10.5px;
    line-height: 1.6;
  }

  /* ---------- Right Main Canvas ---------- */
  .main-content {
    width: 67%;
    padding: 32px 30px;
    flex-grow: 1;
    background-color: #ffffff;
  }

  .section {
    margin-bottom: 18px;
  }

  .section-title {
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.1px;
    color: #233d32;
    border-bottom: 1.5px solid #233d32;
    padding-bottom: 3px;
    margin-bottom: 10px;
  }

  .summary-text {
    font-size: 11px;
    line-height: 1.6;
    color: #333333;
    text-align: justify;
  }

  .entry {
    margin-bottom: 12px;
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }

  .entry-title {
    font-size: 12px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .entry-subtitle {
    font-size: 11px;
    font-weight: 600;
    color: #444444;
    margin-top: 1px;
  }

  .entry-date {
    font-size: 10px;
    color: #666666;
    white-space: nowrap;
  }

  ul.bullets {
    margin: 4px 0 0;
    padding-left: 16px;
  }

  ul.bullets li {
    font-size: 10.5px;
    color: #333333;
    line-height: 1.5;
    margin-bottom: 2.5px;
  }

  .declaration-box {
    font-size: 10px;
    font-style: italic;
    color: #555555;
    margin-top: 6px;
    line-height: 1.45;
  }

  .signature {
    font-style: normal;
    font-weight: 700;
    color: #233d32;
    margin-top: 4px;
  }
`
