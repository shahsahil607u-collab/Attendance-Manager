/**
 * HTML email template for HOD attendance report.
 */
const getHodReportHtml = ({ session, totalStudents, presentCount, absentCount, attendancePercentage, absentStudents }) => {
  const formattedDate = new Date(session.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const absentRows = (absentStudents || [])
    .map((s, i) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-size: 14px;">${i + 1}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #2d3748; font-size: 14px; font-weight: 500;">${s.fullName}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #4a5568; font-size: 14px;">${s.rollNumber}</td>
      </tr>
    `)
    .join('');

  const percentage = totalStudents > 0 ? attendancePercentage.toFixed(2) : 'N/A';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attendance Report</title>
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
                Technical Team Attendance Report
              </h1>
            </td>
          </tr>
          <!-- Session Info -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #f7fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="color: #718096; font-size: 13px; border-bottom: 1px solid #e2e8f0; width: 120px;">Session</td>
                  <td style="color: #2d3748; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e2e8f0;">${session.sessionName}</td>
                </tr>
                <tr>
                  <td style="color: #718096; font-size: 13px; border-bottom: 1px solid #e2e8f0;">Topic</td>
                  <td style="color: #2d3748; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e2e8f0;">${session.topic}</td>
                </tr>
                <tr>
                  <td style="color: #718096; font-size: 13px; border-bottom: 1px solid #e2e8f0;">Date</td>
                  <td style="color: #2d3748; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e2e8f0;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="color: #718096; font-size: 13px;">Time</td>
                  <td style="color: #2d3748; font-size: 14px; font-weight: 500;">${session.startTime} – ${session.endTime}</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Summary Stats -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="12">
                <tr>
                  <td style="background-color: #ebf8ff; border-radius: 6px; padding: 16px; text-align: center; width: 25%;">
                    <div style="color: #2b6cb0; font-size: 24px; font-weight: 700;">${totalStudents}</div>
                    <div style="color: #4a5568; font-size: 12px; margin-top: 4px;">Total</div>
                  </td>
                  <td style="background-color: #f0fff4; border-radius: 6px; padding: 16px; text-align: center; width: 25%;">
                    <div style="color: #276749; font-size: 24px; font-weight: 700;">${presentCount}</div>
                    <div style="color: #4a5568; font-size: 12px; margin-top: 4px;">Present</div>
                  </td>
                  <td style="background-color: #fff5f5; border-radius: 6px; padding: 16px; text-align: center; width: 25%;">
                    <div style="color: #c53030; font-size: 24px; font-weight: 700;">${absentCount}</div>
                    <div style="color: #4a5568; font-size: 12px; margin-top: 4px;">Absent</div>
                  </td>
                  <td style="background-color: #faf5ff; border-radius: 6px; padding: 16px; text-align: center; width: 25%;">
                    <div style="color: #6b46c1; font-size: 24px; font-weight: 700;">${percentage}%</div>
                    <div style="color: #4a5568; font-size: 12px; margin-top: 4px;">Attendance</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Absent Students List -->
          ${absentCount > 0 ? `
          <tr>
            <td style="padding: 0 32px 32px;">
              <h3 style="color: #2d3748; font-size: 16px; margin: 0 0 12px;">Absent Students</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                <tr style="background-color: #f7fafc;">
                  <th style="padding: 10px 12px; text-align: left; color: #718096; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">#</th>
                  <th style="padding: 10px 12px; text-align: left; color: #718096; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Name</th>
                  <th style="padding: 10px 12px; text-align: left; color: #718096; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Roll No</th>
                </tr>
                ${absentRows}
              </table>
            </td>
          </tr>
          ` : ''}
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                This is an automated report from the Technical Team Attendance System.
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

module.exports = { getHodReportHtml };
