import { baseDocumentStyles } from '../../renderers/types'

export const techModernStyles = `
  ${baseDocumentStyles}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: #ffffff;
    color: #24292f;
    padding: 34px 38px;
    font-size: 11px;
    line-height: 1.45;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #0969da;
    padding-bottom: 14px;
    margin-bottom: 16px;
    gap: 16px;
  }
  .header-left { flex: 1; }
  .name {
    font-size: 24px;
    font-weight: 800;
    color: #0969da;
    letter-spacing: -0.3px;
    line-height: 1.15;
  }
  .role {
    font-size: 12.5px;
    font-weight: 600;
    color: #57606a;
    margin-top: 3px;
  }
  .header-right {
    text-align: right;
    font-size: 10px;
    color: #57606a;
    line-height: 1.55;
  }
  .contact-link {
    color: #0969da;
    text-decoration: none;
  }

  /* Section Titles */
  .section { margin-bottom: 15px; }
  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #0969da;
    border-bottom: 1px solid #d0d7de;
    padding-bottom: 3px;
    margin-bottom: 8px;
  }

  /* Entries */
  .entry { margin-bottom: 10px; }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .entry-title {
    font-size: 11.5px;
    font-weight: 700;
    color: #24292f;
  }
  .entry-date {
    font-size: 10px;
    color: #57606a;
    font-weight: 500;
    white-space: nowrap;
  }
  .entry-sub {
    font-size: 10.5px;
    font-weight: 600;
    color: #57606a;
    margin-top: 1px;
  }

  /* Bullets */
  ul.bullets {
    margin: 3px 0 0;
    padding-left: 15px;
  }
  ul.bullets li {
    font-size: 10.5px;
    color: #24292f;
    line-height: 1.45;
    margin-bottom: 2px;
  }

  /* Categorized Skills Table */
  .skills-table {
    width: 100%;
    border-collapse: collapse;
  }
  .skills-table td {
    font-size: 10.5px;
    padding: 2.5px 0;
    vertical-align: top;
  }
  .skills-cat {
    font-weight: 700;
    color: #24292f;
    width: 180px;
    white-space: nowrap;
  }
  .skills-val {
    color: #57606a;
  }

  /* Grid 2-col */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`
