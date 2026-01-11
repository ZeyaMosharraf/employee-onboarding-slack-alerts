function BGVUpcomingReminder() {
  try {
    const sheetName = "Joining Alerts";
    const slackWebhookUrl = PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);

    // Create sheet if missing
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    // Ensure headers exist
    const expectedHeaders = ["Employee Name", "Joining Date", "Role", "Team"];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(expectedHeaders);
    }

    // Get data
    const data = sheet.getDataRange().getValues();
    const today = new Date();
    const tenDaysLater = new Date(today);
    tenDaysLater.setDate(today.getDate() + 10);

    let upcomingAlerts = [];

    for (let i = 1; i < data.length; i++) { // skip header
      const [employeeName, joiningDateRaw, role, team] = data[i];
      if (!joiningDateRaw) continue;

      let jd = joiningDateRaw instanceof Date ? joiningDateRaw : new Date(joiningDateRaw);
      if (isNaN(jd)) continue;

      // Send only if joining date is exactly 10 days later
      if (isSameDay(jd, tenDaysLater)) {
        upcomingAlerts.push(
          :wave: Don't forget to create BGV – *${employeeName}* will be joining as *${role}* on ${formatDate(jd)}
        );
      }
    }

    // Send Slack message
    if (upcomingAlerts.length > 0 && slackWebhookUrl) {
      const message = "<!channel>\n\n" + upcomingAlerts.join("\n");
      const payload = { text: message };
      UrlFetchApp.fetch(slackWebhookUrl, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload)
      });
    } else {
      Logger.log("No joiners exactly 10 days from today. No Slack message sent.");
    }

  } catch (err) {
    Logger.log("Error: " + err);
  }
}

// Helper: compare dates ignoring time
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// Format date nicely
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd-MMM-yyyy");
}