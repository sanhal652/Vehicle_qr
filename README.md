# VehiQR

A QR-based vehicle contact system that lets a bystander privately reach a vehicle owner — without either party's phone number ever being exposed.

**Live demo:** https://vehiqr-ten.vercel.app

**Backend API:** https://vehiqr.onrender.com

**GitHub:** https://github.com/sanhal652/Vehicle_qr

> Note: the backend is hosted on Render's free tier, which sleeps after ~15 minutes of inactivity. The first request after a period of idle time may take 20–30 seconds while the server wakes up.

---

## The problem

Anyone who's parked in a crowded lot knows this: you come back to find another car has blocked yours in, and there's no way to find out whose car it is or how to reach them. VehiQR solves this with a simple QR sticker — scan it, verify you're actually at the vehicle, and reach the owner directly, with neither person's phone number ever exchanged.

## How it works

1. **Owner registers**  using their vehicle (name, mobile number, engine number, plate number, optional emergency contact) after verifying their mobile number via OTP.
2. They receive a **QR code** to print or screenshot and stick on their car's windshield.
3. If someone needs to reach them — blocked parking, or a genuine accident/incident — they **scan the QR**, enter the **last 4 digits of the plate** (proving they're physically at the vehicle, not just someone who happened to find the link), and get three options:
   - **Call** — A masked call connects the bystander and owner without either seeing the other's real number
   - **Message** — Sends an SMS notification to the owner
   - **Emergency** — Simultaneously calls the owner, texts the owner, texts a backup emergency contact (if one was set), and surfaces India's emergency number (112) for the bystander to call directly
4. If an owner ever loses access to their QR code, they can **retrieve it at any time** using their engine number + plate number — no need to register again.

---

## Tech stack

**Backend:** Node.js, Express, MongoDB (Mongoose)

**Frontend:** React (Vite), Tailwind CSS v4, React Router

**Telephony:** Exotel (masked calling)

**SMS:** Fast2SMS (OTP + messaging)

**QR generation:** `qrcode` npm package

**Hosting:** Render (backend), Vercel (frontend)

---

## Architecture & key decisions

- **OTP-gated registration** — Vehicle registration requires a verified OTP for that mobile number (TTL-based, auto-expires after 5 minutes) before the vehicle is created, preventing someone from registering a vehicle against a number that isn't theirs.
- **Plate-digit verification on scan** — This is the actual privacy mechanism of the app. Even though `vehicleId` is technically visible in the QR's URL, nobody can see the owner's contact options without correctly entering the last 4 digits of the plate. This ensures only someone physically standing at the vehicle can unlock contact — the link alone isn't enough.
- **Masked calling** — The bystander's and owner's real numbers are never exchanged; the telephony provider connects both call legs through a shared virtual number.
- **Emergency alert fires multiple channels concurrently** using `Promise.allSettled` (not `Promise.all`) — so if one channel fails (e.g. the call attempt fails but SMS succeeds), the owner is still notified through whatever channel did work, rather than the entire alert failing silently.
- **Idempotent registration** — If a vehicle's engine number/plate already exists under the same mobile number (e.g. the page crashed right after a successful registration), resubmitting returns the existing vehicle instead of throwing a duplicate error.
- **Owner recovery flow** — engine number +  vehicle number plate act as a proof-of-ownership pair (mirroring what's printed on real vehicle documents) to let an owner retrieve their QR code at any time, without repeating OTP verification.

---

## Known limitations (intentional, explained below)

This was built as a college project, and three specific pieces of real-world infrastructure could not be fully completed — not because they weren't designed for, but because they require compliance/verification steps that are inaccessible to an individual student without a registered business.

### 1. Masked calling is not live — requires telecom KYC

Outbound calling in India (via providers like Exotel or Twilio) is regulated under TRAI rules and requires **business KYC** (trade license or formal business registration) before an account can make live outbound calls to arbitrary numbers. This documentation is not available for an individual/student.

The masked-calling integration itself is fully built and functionally correct — request validation, telephony API call construction, error handling, and response shape are all implemented and tested. It runs in a **mock mode** (`CALL_MODE=mock`) that executes the exact same code path but replaces the actual outbound call with a logged simulation, so the full flow can be demonstrated end-to-end without a live phone call actually connecting.

### 2. SMS (OTP + messaging) is not live — requires SMS gateway verification

Sending transactional SMS in India (OTP codes, notifications) via providers like Fast2SMS requires either **DLT (Distributed Ledger Technology) registration** or business website verification — again, a business-level compliance requirement not available to a student project.

Like calling, this runs in **mock mode** (`SMS_MODE=mock`) — the same validation and API-call logic executes, but the actual message is logged to the server console instead of being delivered to a real phone. This means OTPs and notifications are visible only in the server logs, not sent to an actual device, so the app cannot currently be used end-to-end by a stranger without the developer manually relaying the OTP.

### 3. No RTO (vehicle registration authority) verification

The app currently has no way to confirm that a person registering a vehicle actually owns it — anyone can enter any name, engine number, and plate number and register it as their own. In a production version, this would require integration with India's RTO (Regional Transport Office) vehicle database or a similar government verification API to confirm the registering person's identity matches the vehicle's actual registered owner. This integration is out of scope for a student project, both due to API access restrictions and the identity-verification infrastructure it would require.

**In short:** The application's logic, validation, and integration code for all three of these systems is complete and correct — what's missing is the real-world compliance/verification layer that sits *outside* the code itself, which requires resources (a registered business, government API access) not available to an individual student.

---

## Project structure
VehiQR/

├── backend/

│ ├── src/

│ │ ├── controllers/

│ │ │ ├── vehicle.controller.js

│ │ │ └── otp.controller.js

│ │ ├── models/

│ │ │ ├── vehicle.model.js

│ │ │ └── otp.model.js

│ │ ├── routes/

│ │ │ ├── vehicle.routes.js

│ │ │ └── otp.routes.js

│ │ ├── utils/

│ │ │ ├── sendMaskedCall.js

│ │ │ ├── sendSms.js

│ │ │ ├── ApiError.js

│ │ │ ├── ApiResponse.js

│ │ │ └── asyncHandler.js

│ │ ├── db/

│ │ │ └── index.js

│ │ ├── app.js

│ │ └── index.js

│ └── .env

│
└── frontend/

├── src/

│ ├── api/

│ │ └── client.js

│ ├── components/

│ │ ├── TextInput.jsx

│ │ ├── PlateInput.jsx

│ │ └── SubmitButton.jsx

│ ├── pages/

│ │ ├── Home.jsx

│ │ ├── Register.jsx

│ │ ├── QrDisplay.jsx

│ │ ├── Scan.jsx

│ │ └── RetrieveQr.jsx

│ ├── index.css

│ └── main.jsx

├── vercel.json

└── .env



---

## API routes

### OTP (`/api/otp`)
| Method | Route | Description |
|---|---|---|
| POST | `/send-otp` | Sends a 6-digit OTP to the given mobile number |
| POST | `/verify-otp` | Verifies the OTP, marks it valid for the next registration attempt |

### Vehicle (`/api/vehicle`)
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Registers a vehicle (requires a verified OTP for the given mobile) |
| GET | `/scan/:vehicleId?lastFourDigits=XXXX` | Verifies plate digits, returns owner name + plate on success |
| GET | `/generate-qr/:vehicleId` | Generates a QR code (base64) linking to the scan page |
| POST | `/masked-call/:vehicleId` | Initiates a masked call between bystander and owner |
| POST | `/message-owner/:vehicleId` | Sends an SMS notification to the owner |
| POST | `/emergency/:vehicleId` | Fires call + owner SMS + emergency contact SMS together |
| GET | `/my-vehicle?engineNumber=&vehicleNumberPlate=` | Retrieves a previously registered vehicle for QR recovery |

---

## Local setup

### Backend
```bash
cd backend
npm install
```
Create `backend/.env`:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*
FRONTEND_URL=http://localhost:5173

CALL_MODE=mock
SMS_MODE=mock

EXOTEL_SID=your_exotel_sid
EXOTEL_API_KEY=your_exotel_api_key
EXOTEL_API_TOKEN=your_exotel_api_token
EXOTEL_SUBDOMAIN=api.exotel.com
EXOTEL_CALLER_ID=your_exophone_number

FAST2SMS_API_KEY=your_fast2sms_api_key

```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
```
Create `frontend/.env`:
VITE_API_BASE_URL=http://localhost:5000/api

```bash
npm run dev
```

Visit `http://localhost:5173`.

---

## Deployment

- **Backend** deployed on Render (free tier) — environment variables set directly in Render's dashboard.
- **Frontend** deployed on Vercel (free tier) — requires `vercel.json` with a rewrite rule so client-side routes (e.g. `/scan/:vehicleId`) resolve correctly on direct page loads:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Future improvements

- Complete DLT registration (SMS) and business KYC (calling) to make both fully live
- RTO/government vehicle-ownership verification during registration
- Owner dashboard (view/edit registered vehicles, would require proper authentication)
- OCR-based plate scanning as an alternative to manual digit entry
- Push notifications instead of/alongside SMS

---

## Author

Built as a college project by Sangita Halder.
