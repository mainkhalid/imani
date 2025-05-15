// server/services/email.service.js
const nodemailer = require('nodemailer');

/**
 * Create a nodemailer transporter using SMTP settings
 * @param {Object} settings - Email settings
 * @returns {Object} - Nodemailer transporter
 */
const createTransporter = (settings) => {
  if (!settings || !settings.emailHost || !settings.emailPort || 
      !settings.emailUser || !settings.emailPass) {
    throw new Error('Incomplete email configuration');
  }

  try {
    return nodemailer.createTransport({
      host: settings.emailHost,
      port: settings.emailPort,
      secure: settings.emailPort === 465, // true for 465, false for other ports
      auth: {
        user: settings.emailUser,
        pass: settings.emailPass
      }
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw new Error(`Failed to create email transporter: ${error.message}`);
  }
};

/**
 * Send a test email to verify email settings
 * @param {Object} settings - Email settings
 * @returns {Promise} - Result of sending the email
 */
const sendTestEmail = async (settings) => {
  if (!settings || !settings.emailHost || !settings.emailPort || 
      !settings.emailUser || !settings.emailPass || !settings.emailFrom) {
    throw new Error('Incomplete email configuration');
  }

  try {
    const transporter = createTransporter(settings);
    
    // Send a test email to the admin
    const info = await transporter.sendMail({
      from: `"Imani Foundation" <${settings.emailFrom}>`,
      to: settings.emailUser,
      subject: 'Email Configuration Test',
      text: 'This is a test email to verify your email configuration.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #e86225;">Email Configuration Test</h2>
          <p>This is a test email to verify your email configuration.</p>
          <p>If you're seeing this message, your email configuration is working correctly!</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #777;">
              This is an automated message from Imani Foundation. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    });
    
    return info;
  } catch (error) {
    console.error('Error sending test email:', error);
    throw new Error(`Failed to send test email: ${error.message}`);
  }
};

/**
 * Send donation notification email to admin
 * @param {Object} settings - Email settings
 * @param {Object} donation - Donation data
 * @returns {Promise} - Result of sending the email
 */
const sendDonationNotification = async (settings, donation) => {
  if (!settings || !donation) {
    throw new Error('Email settings or donation data is missing');
  }

  // Check if admin wants to receive donation notifications
  if (!settings.customSettings?.receiveDonationNotifications) {
    console.log('Admin has disabled donation notifications');
    return null;
  }

  const transporter = createTransporter(settings);
  
  const info = await transporter.sendMail({
    from: `"Imani Foundation" <${settings.emailFrom}>`,
    to: settings.emailUser,
    subject: 'New Donation Received',
    text: `You have received a new donation of ${donation.amount} ${donation.currency} from ${donation.donorName || 'Anonymous'}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #e86225;">New Donation Received</h2>
        <p>You have received a new donation with the following details:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Amount</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${donation.amount} ${donation.currency}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Donor</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${donation.donorName || 'Anonymous'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${donation.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${donation.email || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Payment Method</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${donation.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Date</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(donation.createdAt).toLocaleString()}</td>
          </tr>
        </table>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #777;">
            This is an automated message from Imani Foundation. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  });
  
  return info;
};

/**
 * Send monthly donation report to admin
 * @param {Object} settings - Email settings
 * @param {Object} reportData - Report data with donations and statistics
 * @returns {Promise} - Result of sending the email
 */
const sendMonthlyReport = async (settings, reportData) => {
  if (!settings || !reportData) {
    throw new Error('Email settings or report data is missing');
  }

  // Check if admin wants to receive monthly reports
  if (!settings.customSettings?.receiveMonthlyReports) {
    console.log('Admin has disabled monthly reports');
    return null;
  }

  const transporter = createTransporter(settings);
  
  const info = await transporter.sendMail({
    from: `"Imani Foundation" <${settings.emailFrom}>`,
    to: settings.emailUser,
    subject: `Monthly Donation Report - ${reportData.monthName} ${reportData.year}`,
    text: `Monthly donation report for ${reportData.monthName} ${reportData.year}. Total donations: ${reportData.totalDonations}, Total amount: ${reportData.totalAmount} ${reportData.currency}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #e86225;">Monthly Donation Report - ${reportData.monthName} ${reportData.year}</h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">Summary</h3>
          <p><strong>Total Donations:</strong> ${reportData.totalDonations}</p>
          <p><strong>Total Amount:</strong> ${reportData.totalAmount} ${reportData.currency}</p>
          <p><strong>Average Donation:</strong> ${reportData.averageDonation} ${reportData.currency}</p>
        </div>
        
        <h3>Donation Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Date</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Donor</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Amount</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Method</th>
          </tr>
          ${reportData.donations.map(donation => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(donation.createdAt).toLocaleDateString()}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${donation.donorName || 'Anonymous'}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${donation.amount} ${donation.currency}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${donation.paymentMethod}</td>
            </tr>
          `).join('')}
        </table>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #777;">
            This is an automated report from Imani Foundation. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  });
  
  return info;
};

module.exports = {
  sendTestEmail,
  sendDonationNotification,
  sendMonthlyReport
};