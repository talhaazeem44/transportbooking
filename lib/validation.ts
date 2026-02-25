import { z } from "zod";

export const createReservationSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(300),
  phone: z.string().min(6).max(50),

  serviceTypeId: z.string().min(1),
  vehiclePreferenceId: z.string().min(1),

  passengers: z.coerce.number().int().min(1).max(50),
  bags: z.coerce.number().int().min(0).max(50),

  pickupDate: z.string().min(1).regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  pickupTime: z.string()
    .min(1, "Pickup time is required")
    .transform((val) => val.trim())
    .refine(
      (val) => {
        // Accept HH:mm format (24-hour) - HTML5 time input always returns this format
        // Examples: "09:00", "14:30", "23:59"
        const match = val.match(/^(\d{1,2}):(\d{2})$/);
        if (!match) {
          console.error("[Validation] Time format mismatch:", val);
          return false;
        }
        const hour = parseInt(match[1], 10);
        const minute = parseInt(match[2], 10);
        const isValid = hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
        if (!isValid) {
          console.error("[Validation] Time values out of range:", { hour, minute, original: val });
        }
        return isValid;
      },
      { message: "Time must be in HH:mm format (24-hour, e.g., 09:00, 14:30). Hour: 0-23, Minute: 0-59" }
    ),

  pickupAddress: z.string().min(1).max(400),
  destinationAddress: z.string().min(1).max(400),
  airline: z.string().max(200).optional().or(z.literal("")),
  flightNumber: z.string().max(100).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
});

export function toPickupAt(pickupDate: string, pickupTime: string): Date {
  // Interpret as local time on server machine.
  // Format expected: YYYY-MM-DD and HH:mm (24-hour format).
  // Example: "2024-01-15" and "14:30" -> Jan 15, 2024 at 2:30 PM
  
  if (!pickupDate || !pickupTime) {
    throw new Error("Pickup date and time are required");
  }

  // Validate date format (YYYY-MM-DD)
  const dateMatch = pickupDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) {
    throw new Error(`Invalid date format: ${pickupDate}. Expected YYYY-MM-DD`);
  }

  // Validate time format (HH:mm)
  const timeMatch = pickupTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) {
    throw new Error(`Invalid time format: ${pickupTime}. Expected HH:mm (24-hour format, e.g., 09:00, 14:30)`);
  }

  const [, y, m, d] = dateMatch.map((x) => Number(x));
  const [, hh, mm] = timeMatch.map((x) => Number(x));

  // Validate time values
  if (hh < 0 || hh > 23) {
    throw new Error(`Invalid hour: ${hh}. Hour must be between 0 and 23`);
  }
  if (mm < 0 || mm > 59) {
    throw new Error(`Invalid minute: ${mm}. Minute must be between 0 and 59`);
  }

  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
}

