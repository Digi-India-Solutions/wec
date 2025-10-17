const fetch = require("node-fetch");
const FormData = require("form-data");

const API_URL_11za = "https://app.11za.in/apis/template/sendTemplate";
const authToken_11za = "U2FsdGVkX1/R3Dvznq1e0S+QRvIfFac3XfAMYcjsuBSONCNWnNTGblIyFjTKJkR89w1lYYf1TCWSluX/y2O2bVLKa16qP7LzS3gtHOOlF5M2QyxQcleJ2AsFD4JwZektEKSz3MpUXLagDXkyKj0ZmZkLgHlK8VeMLb1IEH9MAMR2wwTFgXjRJy6O6p+k9SBB";
const ORIGIN_WEBSITE = "http://www.swagside.in/";


const sendWhatsAppMessage = async ({ sendTo, templateName = "", data, language = "en", buttonValue = "", isTinyURL = "yes", }) => {
  try {
    if (!sendTo || typeof sendTo !== "string") {
      throw new Error("Invalid 'sendTo' value; expected string.");
    }

    if (!templateName || typeof templateName !== "string") {
      throw new Error("Invalid 'templateName' value; expected string.");
    }

    const form = new FormData();
    form.append("authToken", authToken_11za);
    form.append("sendto", sendTo);
    form.append("originWebsite", ORIGIN_WEBSITE);
    form.append("templateName", templateName);
    if (data.title === 'Anibhavi Creation') {
      form.append("data1", data.name),
        form.append("data2", data.email),
        form.append("data3", data.phone),
        form.append("data4", data?.title)
    } else {
      form.append("data", data.name);
    }
    form.append("language", language);
    if (buttonValue) form.append("buttonValue", buttonValue);
    form.append("isTinyURL", isTinyURL);
    const response = await fetch(API_URL_11za, { method: "POST", body: form, });

    const result = await response.text();
    console.log(`✅ WhatsApp message sent (${templateName}):`, result);
  } catch (error) {
    console.error(`❌ Error sending WhatsApp message (${templateName}):`, error.message);
  }
};

const sendOrderNotificationByAdminOnWhatsapp = async ({ name, mobile, email }) => {
  const data = { name, mobile, email, };
  await sendWhatsAppMessage({ sendTo: mobile, templateName: "customare_order_notification_copy_1", data, });
};

const sendOrderThankByUserOnWhatsapp = async ({ name, mobile, email }) => {
  const data = { name, mobile, email, };
  await sendWhatsAppMessage({ sendTo: mobile, templateName: "thank_your_for_order", data, });
};

const sendWhatsAppByUserForRequastActiveAccount = async ({ name, phone }) => {
  const data = { name, phone };
  await sendWhatsAppMessage({ sendTo: phone, templateName: "active_account", data, });
};

const sendWhatsAppByUserForRequastDeactiveAccount = async ({ name, phone, isActive }) => {
  const data = { name, phone, isActive };
  await sendWhatsAppMessage({ sendTo: phone, templateName: isActive ? "active_account" : "deactivate_account_copy_1", data, });
};

const sendWhatsAppByAdminForRequastActiveAccount = async ({ email, name, phone }) => {
  const data = { email, name, phone, title: "Anibhavi Creation" };
  await sendWhatsAppMessage({ sendTo: phone, templateName: "create_admin_accounte", data, });
}

module.exports = {
  sendOrderNotificationByAdminOnWhatsapp,
  sendOrderThankByUserOnWhatsapp,
  sendWhatsAppByUserForRequastActiveAccount,
  sendWhatsAppByUserForRequastDeactiveAccount,
  sendWhatsAppByAdminForRequastActiveAccount
};
