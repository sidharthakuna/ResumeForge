import { baseDocumentStyles } from '../../renderers/types'

export const techAtsStyles = `
  ${baseDocumentStyles}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .page {
    font-family: Arial, Helvetica, sans-serif;
    background: #ffffff;
    color: #111111;
    padding: 36px 42px;
    font-size: 11px;
    line-height: 1.45;
  }

  /* Single Column ATS Header */
  .header {
    text-align: center;
    border-bottom: 1.5px solid #111111;
    padding-bottom: 10px;
    margin-bottom: 14px;
  }
  .name {
    font-size: 22px;
    font-weight: bold;
    color: #111111;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .role {
    font-size: 12px;
    font-weight: bold;
    color: #333333;
    margin-top: 2px;
    margin-bottom: 4px;
  }
  .contact-line {
    font-size: 10px;
    color: #444444;
    line-height: 1.4;
  }

  /* Standard ATS Sections */
  .section { margin-bottom: 14px; }
  .section-title {
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    color: #111111;
    border-bottom: 1px solid #111111;
    padding-bottom: 2px;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
  }

  .entry { margin-bottom: 8px; }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .entry-title {
    font-size: 11px;
    font-weight: bold;
    color: #111111;
  }
  .entry-date {
    font-size: 10px;
    color: #333333;
    font-weight: bold;
  }
  .entry-sub {
    font-size: 10.5px;
    font-style: italic;
    color: #333333;
  }

  ul.bullets {
    margin: 2px 0 0;
    padding-left: 18px;
  }
  ul.bullets li {
    font-size: 10.5px;
    color: #111111;
    line-height: 1.4;
    margin-bottom: 2px;
  }

  .skills-row {
    font-size: 10.5px;
    margin-bottom: 3px;
    color: #111111;
  }
  .skills-row strong {
    font-weight: bold;
  }
`
