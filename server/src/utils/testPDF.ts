import puppeteer from 'puppeteer'

// This is the shape of data we'll pass in — matches your Prisma Job model
interface PODData {
  job_id: number
  driver: string
  customer: string
  origin: string
  destination: string
  commodity: string
  status: string
  notes: string
  created_at: string
}

// Separate function so we can reuse it anywhere in the app later
export async function generatePODPDF(data: PODData): Promise<Buffer> {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // Format the date nicely
  const formattedDate = new Date(data.created_at).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // HTML template with real data injected
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: monospace;
            padding: 40px;
            background: white;
            color: #111;
          }
          .header {
            border-bottom: 2px solid #111;
            padding-bottom: 16px;
            margin-bottom: 32px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .brand {
            font-size: 11px;
            letter-spacing: 3px;
            color: #888;
            margin-bottom: 4px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
          }
          .doc-number {
            font-size: 12px;
            color: #888;
            text-align: right;
          }
          .row {
            display: flex;
            gap: 40px;
            margin-bottom: 24px;
          }
          .field {
            flex: 1;
          }
          .field-label {
            font-size: 11px;
            color: #888;
            letter-spacing: 2px;
            margin-bottom: 4px;
          }
          .field-value {
            font-size: 14px;
            font-weight: bold;
          }
          .status {
            display: inline-block;
            background: #1a2a3a;
            color: #4a9eff;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            letter-spacing: 1px;
          }
          .divider {
            border: none;
            border-top: 1px solid #eee;
            margin: 24px 0;
          }
          .notes-box {
            background: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 6px;
            padding: 16px;
            font-size: 13px;
            line-height: 1.6;
            min-height: 60px;
          }
          .footer {
            margin-top: 60px;
            border-top: 1px solid #eee;
            padding-top: 16px;
            font-size: 11px;
            color: #888;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">FIELD FRAME</div>
            <div class="title">Proof of Delivery</div>
          </div>
          <div class="doc-number">
            <div>POD #${data.job_id}</div>
            <div>${formattedDate}</div>
          </div>
        </div>

        <div class="row">
          <div class="field">
            <div class="field-label">JOB ID</div>
            <div class="field-value">#${data.job_id}</div>
          </div>
          <div class="field">
            <div class="field-label">STATUS</div>
            <div class="field-value">
              <span class="status">${data.status.toUpperCase()}</span>
            </div>
          </div>
          <div class="field">
            <div class="field-label">DATE</div>
            <div class="field-value">${formattedDate}</div>
          </div>
        </div>

        <hr class="divider" />

        <div class="row">
          <div class="field">
            <div class="field-label">DRIVER</div>
            <div class="field-value">${data.driver}</div>
          </div>
          <div class="field">
            <div class="field-label">CUSTOMER</div>
            <div class="field-value">${data.customer}</div>
          </div>
        </div>

        <div class="row">
          <div class="field">
            <div class="field-label">ORIGIN</div>
            <div class="field-value">${data.origin}</div>
          </div>
          <div class="field">
            <div class="field-label">DESTINATION</div>
            <div class="field-value">${data.destination}</div>
          </div>
          <div class="field">
            <div class="field-label">COMMODITY</div>
            <div class="field-value">${data.commodity}</div>
          </div>
        </div>

        <hr class="divider" />

        <div class="field">
          <div class="field-label">DELIVERY NOTES</div>
          <div class="notes-box">
            ${data.notes || 'No notes provided.'}
          </div>
        </div>

        <div class="footer">
          <span>Generated by Field Frame</span>
          <span>${new Date().toISOString()}</span>
        </div>
      </body>
    </html>
  `)

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
  })

  await browser.close()
  return Buffer.from(pdf)
}

