import { Order } from '../types';

export interface EmailDispatchLog {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  timestamp: string;
  status: 'sent' | 'failed' | 'simulated';
}

/**
 * Triggers an email alert when a new client order is received.
 * Dispatches to latephub@gmail.com and CCs the user requested admin address.
 */
export async function sendNewOrderEmailAlert(order: Order): Promise<EmailDispatchLog> {
  const adminEmail = 'latephub@gmail.com';
  const backupAdminEmail = 'arphaxadnjoroge@gmail.com';
  const timestamp = new Date().toISOString();
  
  const subject = `🔥 NEW ORDER SUBMITTED: ${order.id} - Ksh ${order.totalPrice}`;
  const body = `
    Latep Hub - New Order Alert
    --------------------------------------------------
    Order Tracking ID: ${order.id}
    Client Name: ${order.customerName}
    Client Email: ${order.customerEmail}
    Service Module: ${order.serviceType.toUpperCase()} (${order.audience})
    Scope of Work: ${order.pageCount} ${order.serviceType === 'latex' ? 'pages' : 'slides'}
    Urgency Track: ${order.urgency.toUpperCase()}
    Net Receivable: Ksh ${order.totalPrice}.00
    
    PAYMENT INFORMATION:
    --------------------------------------------------
    Status: ${order.status.toUpperCase()}
    M-Pesa / Card Transaction reference code: ${order.id}
    
    ATTACHMENTS:
    --------------------------------------------------
    ${order.attachments.map(att => `- ${att.name} (${att.size})`).join('\n') || 'No files attached'}
    
    SYSTEM LINK:
    --------------------------------------------------
    Open your Latep Hub admin portal to verify the payment receipt and assign typesetting work.
  `;

  // We save this dispatch history in the browser's session/state logs for live visibility.
  const currentLogs = localStorage.getItem('peak_minds_email_outbox');
  const logsArray: EmailDispatchLog[] = currentLogs ? JSON.parse(currentLogs) : [];
  
  const newLog: EmailDispatchLog = {
    id: `MAIL-ADMIN-${Date.now()}`,
    recipient: adminEmail,
    subject,
    body,
    timestamp,
    status: 'simulated'
  };

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: "0cf965ee-bfd8-4f93-bda6-eabfa7684061", // Simple sandbox submission key for demonstrations
        subject: subject,
        from_name: "Latep Hub Automated Alerts",
        email: adminEmail,
        cc: backupAdminEmail,
        message: body,
      })
    });
    
    if (response.ok) {
      newLog.status = 'sent';
    }
  } catch (error) {
    console.warn("Real static email dispatch deferred. Logging simulated alert locally.", error);
  }

  logsArray.unshift(newLog);
  localStorage.setItem('peak_minds_email_outbox', JSON.stringify(logsArray.slice(0, 50)));

  return newLog;
}

/**
 * Triggers an email alert to the client when their typesetting or design is ready for review or completed!
 */
export async function sendClientWorkAlert(order: Order, type: 'review' | 'completed'): Promise<EmailDispatchLog> {
  const timestamp = new Date().toISOString();
  const recipient = order.customerEmail;
  const downloadLinks = order.deliverableLinks && order.deliverableLinks.length > 0 
    ? order.deliverableLinks.map(dl => `- ${dl.label}: ${dl.url}`).join('\n')
    : 'Will be attached in the main tracking dashboard';

  const subject = type === 'review'
    ? `✨ Latep Hub: Your Document Draft is ready for Review! [${order.id}]`
    : `🎉 Latep Hub: Project Completed & Compiled! [${order.id}]`;

  const body = `
    Dear ${order.customerName || 'Customer'},

    We are pleased to inform you that your typesetting and layout structuring order has been processed by our Latep Hub experts!

    Order ID: ${order.id}
    Project Title: ${order.title}
    Current Status: ${type === 'review' ? 'PROOFING REVIEW STAGE' : '100% COMPLETE & RELEASED'}

    ${type === 'review' 
      ? `Please review the draft compile. You can post revision requests directly in our tracking workstation portal at any time!` 
      : `Your completed high-fidelity publication-quality formats have been securely built and verified.`
    }

    DELIVERABLES & LINKS:
    --------------------------------------------------
    ${downloadLinks}

    HOW TO ACCESS:
    --------------------------------------------------
    1. Open the Latep Hub application.
    2. Go to the "Order Tracking" tab.
    3. Input your secret Tracking ID: ${order.id} to view the complete history and leave revisions.

    Should you have any questions or require custom assistance, reply directly to this mail, or contact us via latephub@gmail.com.

    Best regards,
    The LaTeX & design typesetting specialists
    Latep Hub (latephub@gmail.com)
  `;

  const currentLogs = localStorage.getItem('peak_minds_email_outbox');
  const logsArray: EmailDispatchLog[] = currentLogs ? JSON.parse(currentLogs) : [];

  const newLog: EmailDispatchLog = {
    id: `MAIL-CLIENT-${Date.now()}`,
    recipient,
    subject,
    body,
    timestamp,
    status: 'simulated'
  };

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: "0cf965ee-bfd8-4f93-bda6-eabfa7684061",
        subject: subject,
        from_name: "Latep Hub Delivery Team",
        email: recipient,
        reply_to: "latephub@gmail.com",
        message: body,
      })
    });
    
    if (response.ok) {
      newLog.status = 'sent';
    }
  } catch (error) {
    console.warn("Real email dispatch deferred. Saved locally.", error);
  }

  logsArray.unshift(newLog);
  localStorage.setItem('peak_minds_email_outbox', JSON.stringify(logsArray.slice(0, 50)));

  return newLog;
}

export function getEmailDispatchLogs(): EmailDispatchLog[] {
  const logs = localStorage.getItem('peak_minds_email_outbox');
  return logs ? JSON.parse(logs) : [];
}
