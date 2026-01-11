function dailyJoiningReminder() {
  try {
    const sheetName = "Joining Alerts";
    const slackWebhookUrl = PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      Logger.log(Creating new sheet "${sheetName}"...);
      sheet = ss.insertSheet(sheetName);
    }

    // Ensure headers exist
    const expectedHeaders = ["Employee Name", "Joining Date", "Role", "Team"];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(expectedHeaders);
    } else {
      const headers = sheet.getRange(1, 1, 1, expectedHeaders.length).getValues()[0];
      for (let i = 0; i < expectedHeaders.length; i++) {
        if (headers[i] !== expectedHeaders[i]) {
          sheet.getRange(1, i + 1).setValue(expectedHeaders[i]);
        }
      }
    }

    // Get all data
    const data = sheet.getDataRange().getValues();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let tomorrowAlerts = [];

    for (let i = 1; i < data.length; i++) { // skip header row
      const [employeeName, joiningDateRaw, role, team] = data[i];
      if (!joiningDateRaw) continue;

      let jd = joiningDateRaw instanceof Date ? joiningDateRaw : new Date(joiningDateRaw);
      if (isNaN(jd)) continue;

      // Check if joining tomorrow
      if (isSameDay(jd, tomorrow)) {
        tomorrowAlerts.push(
          :pushpin: Heads up! *${employeeName}* will be joining us tomorrow as *${role}* on ${formatDate(jd)}
        );
      }
    }

    // Send Slack message only if there are joiners
    if (tomorrowAlerts.length > 0 && slackWebhookUrl) {
      const message = "<!channel>\n\n" + tomorrowAlerts.join("\n") + "\n\n";
      const payload = { text: message };
      UrlFetchApp.fetch(slackWebhookUrl, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload)
      });
    } else {
      Logger.log("No joiners for tomorrow. No Slack message sent.");
    }

  } catch (err) {
    Logger.log("Error: " + err);
  }
}

function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd-MMM-yyyy");
}