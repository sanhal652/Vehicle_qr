import {Router} from 'express';
import {registerVehicle,getVehicleQr,generateVehicleQR,maskedCall} from '../controllers/vehicle.controller.js';

const router=Router();

router.route("/register").post(registerVehicle);
router.route("/scan/:vehicleId").get(getVehicleQr);
router.route("/generate-qr/:vehicleId").get(generateVehicleQR);
router.route("/masked-call/:vehicleId").post(maskedCall);

export default router;
