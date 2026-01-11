function weeklyUpcomingReminder() {
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
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);

    let upcomingAlerts = [];

    for (let i = 1; i < data.length; i++) { // skip header row
      const [employeeName, joiningDateRaw, role, team] = data[i];
      if (!joiningDateRaw) continue;

      let jd = joiningDateRaw instanceof Date ? joiningDateRaw : new Date(joiningDateRaw);
      if (isNaN(jd)) continue;

      // Upcoming joiners in the next 14 days (excluding tomorrow)
      if (jd > tomorrow && jd <= twoWeeksLater) {
        upcomingAlerts.push(
          :wave: Don't forget – *${employeeName}* will be joining as *${role}* on ${formatDate(jd)}
        );
      }
    }

    // Send Slack message only if there are upcoming joiners
    if (upcomingAlerts.length > 0 && slackWebhookUrl) {
      const message = "<!channel>\n\n" + upcomingAlerts.join("\n");
      const payload = { text: message };
      UrlFetchApp.fetch(slackWebhookUrl, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload)
      });
    } else {
      Logger.log("No upcoming joiners in the next two weeks. No Slack message sent.");
    }

  } catch (err) {
    Logger.log("Error: " + err);
  }
}

function isSameDays(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function formatDates(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd-MMM-yyyy");
}