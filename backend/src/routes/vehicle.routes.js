import {Router} from 'express';
import {registerVehicle,getVehicleQr,generateVehicleQR,maskedCall,messageOwner,emergency,getMyVehicle} from '../controllers/vehicle.controller.js';

const router=Router();

router.route("/register").post(registerVehicle);
router.route("/scan/:vehicleId").get(getVehicleQr);
router.route("/generate-qr/:vehicleId").get(generateVehicleQR);
router.route("/masked-call/:vehicleId").post(maskedCall);
router.route("/message-owner/:vehicleId").post(messageOwner)
router.route("/emergency/:vehicleId").post(emergency)
router.route("/my-vehicle") .get(getMyVehicle)

export default router;
