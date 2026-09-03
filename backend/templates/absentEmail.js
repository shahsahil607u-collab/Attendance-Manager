/**
 * HTML email template for absent student notifications.
 */
const getAbsentEmailHtml = ({ studentName, date, sessionName, topic, startTime, endTime }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attendance Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f9; padding: 32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); padding: 28px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">
                Attendance Notification
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #2d3748; font-size: 16px; margin: 0 0 20px;">
                Dear <strong>${studentName}</strong>,
              </p>
              <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                This is to inform you that you were marked <span style="color: #e53e3e; font-weight: 600;">Absent</span> for the following session:
              </p>
              <!-- Session Details -->
              <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #f7fafc; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <tr>
                  <td style="color: #718096; font-size: 13px; border-bottom: 1px solid #e2e8f0; width: 120px;">Session</td>
                  <td style="color: #2d3748; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e2e8f0;">${sessionName}</td>
                </tr>
                <tr>
                  <td style="color: #718096; font-size: 13px; border-bottom: 1px solid #e2e8f0;">Topic</td>
                  <td style="color: #2d3748; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e2e8f0;">${topic}</td>
                </tr>
                <tr>
                  <td style="color: #718096; font-size: 13px; border-bottom: 1px solid #e2e8f0;">Date</td>
                  <td style="color: #2d3748; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e2e8f0;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="color: #718096; font-size: 13px;">Time</td>
                  <td style="color: #2d3748; font-size: 14px; font-weight: 500;">${startTime} – ${endTime}</td>
                </tr>
              </table>
              <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                If you believe this is an error, please contact the Technical Team Coordinator immediately.
              </p>
              <p style="color: #718096; font-size: 13px; margin: 0;">
                Regular attendance is essential for maintaining good standing in the technical team.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                This is an automated notification from the Technical Team Attendance System.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = { getAbsentEmailHtml };
