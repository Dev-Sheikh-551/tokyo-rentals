import {
  createWhatsAppUrl,
  createEmailUrl,
  createPhoneUrl,
  hasAnyContactMethod,
} from "../src/lib/contact-links";
import { contactConfig } from "../src/config/contact";
import { vehicles } from "../src/data/vehicles";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

console.log("--- TEST MATRIX CASE E (Default: All Null) ---");
assert(contactConfig.whatsapp === null, "contactConfig.whatsapp is null by default");
assert(contactConfig.email === null, "contactConfig.email is null by default");
assert(contactConfig.phone === null, "contactConfig.phone is null by default");
assert(createWhatsAppUrl() === null, "createWhatsAppUrl() returns null when whatsapp is null");
assert(createEmailUrl() === null, "createEmailUrl() returns null when email is null");
assert(createPhoneUrl() === null, "createPhoneUrl() returns null when phone is null");
assert(hasAnyContactMethod() === false, "hasAnyContactMethod() is false");

console.log("\n--- TEST MATRIX CASE A (All Configured) ---");
contactConfig.whatsapp = "+220 700 1234";
contactConfig.email = "concierge@tokyorentals.gm";
contactConfig.phone = "+220 700 1234";

assert(hasAnyContactMethod() === true, "hasAnyContactMethod() is true");
assert(createPhoneUrl() === "tel:+2207001234", "Phone URI is formatted cleanly");

// General enquiry links
const generalWa = createWhatsAppUrl();
assert(
  generalWa === "https://wa.me/2207001234?text=Hello%2C%20I%E2%80%99d%20like%20to%20make%20an%20enquiry%20about%20Tokyo%20Rentals%20%26%20Concierge.",
  "General WhatsApp URL has clean encoded message"
);

const generalEmail = createEmailUrl();
assert(
  generalEmail === "mailto:concierge@tokyorentals.gm?subject=Tokyo%20Rentals%20%26%20Concierge%20enquiry",
  "General Email URL has clean subject"
);

// Vehicle-aware links
const testVehicle = vehicles[0]; // "Executive Full-Size SUV"
const vehicleWa = createWhatsAppUrl({ vehicle: testVehicle });
assert(
  vehicleWa === `https://wa.me/2207001234?text=Hello%2C%20I%E2%80%99m%20interested%20in%20the%20${encodeURIComponent(testVehicle.name)}.%20I%E2%80%99d%20like%20to%20enquire%20about%20it.`,
  `Vehicle-aware WhatsApp URL correctly formats "${testVehicle.name}"`
);

const vehicleEmail = createEmailUrl({ vehicle: testVehicle });
assert(
  vehicleEmail?.includes(`subject=Vehicle%20enquiry%20%E2%80%94%20${encodeURIComponent(testVehicle.name)}`) ?? false,
  `Vehicle-aware Email URL has correct subject for "${testVehicle.name}"`
);
assert(
  vehicleEmail?.includes(`body=Hello%2C%20I%E2%80%99m%20interested%20in%20the%20${encodeURIComponent(testVehicle.name)}.`) ?? false,
  `Vehicle-aware Email URL has correct body for "${testVehicle.name}"`
);

console.log("\n--- TEST MATRIX CASE B (WhatsApp Only) ---");
contactConfig.whatsapp = "+220 700 1234";
contactConfig.email = null;
contactConfig.phone = null;
assert(createWhatsAppUrl() !== null, "WhatsApp URL is generated");
assert(createEmailUrl() === null, "Email URL returns null");
assert(createPhoneUrl() === null, "Phone URL returns null");
assert(hasAnyContactMethod() === true, "hasAnyContactMethod() is true");

console.log("\n--- TEST MATRIX CASE C (Email Only) ---");
contactConfig.whatsapp = null;
contactConfig.email = "concierge@tokyorentals.gm";
contactConfig.phone = null;
assert(createWhatsAppUrl() === null, "WhatsApp URL returns null");
assert(createEmailUrl() !== null, "Email URL is generated");
assert(createPhoneUrl() === null, "Phone URL returns null");

console.log("\n--- TEST MATRIX CASE D (Phone Only) ---");
contactConfig.whatsapp = null;
contactConfig.email = null;
contactConfig.phone = "+220 700 1234";
assert(createWhatsAppUrl() === null, "WhatsApp URL returns null");
assert(createEmailUrl() === null, "Email URL returns null");
assert(createPhoneUrl() !== null, "Phone URL is generated");

// Reset back to null
contactConfig.whatsapp = null;
contactConfig.email = null;
contactConfig.phone = null;

console.log("\nALL TEST MATRIX CASES PASSED SUCCESSFULLY!");
