# 🛠️ Manual Configuration Guide

This project requires two manual steps in the Google Apps Script UI: setting up **Environment Variables** (Script Properties) and configuring **Time-based Triggers**.

---

## 1. Configure Script Properties (Security)
To avoid hardcoding sensitive keys (like your Webhook URL) in the code, we use Script Properties.

1.  Open your Google Sheet (**"Joining Alerts"**).
2.  Click on **Extensions** > **Apps Script**.
3.  In the left sidebar, click the **Project Settings** (⚙️ Gear Icon).
4.  Scroll down to the **Script Properties** section.
5.  Click **Edit Script Properties** > **Add Script Property**.
6.  Enter the following:
    * **Property:** `SLACK_WEBHOOK_URL`
    * **Value:** `https://hooks.slack.com/services/YOUR_UNIQUE_WEBHOOK_URL`
7.  Click **Save Script Properties**.

> **Why?** This allows `PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL")` to work safely in the code.

---

## 2. Trigger Configurations (Automation)
Since triggers cannot be pushed via CLASP, you must set them manually.

1.  In the left sidebar, click the **Triggers** (⏰ Alarm Clock Icon).
2.  Click the blue **+ Add Trigger** button (bottom right) for each of the following:

### A. Operations Trigger (Daily Reminder)
* **Function to run:** `dailyJoiningReminder`
* **Deployment:** `Head`
* **Event Source:** `Time-driven`
* **Type of time based trigger:** `Day timer`
* **Time of day:** `9am to 10am`
* **Purpose:** Checks if anyone is joining *tomorrow* (T+1).

### B. Compliance Trigger (BGV Alert)
* **Function to run:** `BGVUpcomingReminder`
* **Deployment:** `Head`
* **Event Source:** `Time-driven`
* **Type of time based trigger:** `Day timer`
* **Time of day:** `10am to 11am`
* **Purpose:** Checks if anyone is joining in *exactly 10 days* (T+10).

### C. Planning Trigger (Weekly Summary)
* **Function to run:** `weeklyUpcomingReminder`
* **Deployment:** `Head`
* **Event Source:** `Time-driven`
* **Type of time based trigger:** `Week timer`
* **Day of week:** `Every Friday`
* **Time of day:** `4pm to 5pm`
* **Purpose:** Sends a summary of all joiners for the *next 14 days*.

---

## 3. Verify Setup
Once finished, your Triggers dashboard should look like this:

| Function | Event | Last Run |
| :--- | :--- | :--- |
| `dailyJoiningReminder` | Time-driven | ... |
| `BGVUpcomingReminder` | Time-driven | ... |
| `weeklyUpcomingReminder` | Time-driven | ... |