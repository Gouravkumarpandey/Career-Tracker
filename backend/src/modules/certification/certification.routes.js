const express = require('express');
const multer = require('multer');
const certificationController = require('./certification.controller');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const { validateCreateCert, validateUpdateCert } = require('./certification.validation');

const router = express.Router();

// Configure multer for memory storage of uploaded certificate files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(auth); // Protect all routes below this middleware

router.get('/', certificationController.getAll);
router.post('/', upload.single('file'), validate(validateCreateCert), certificationController.create);
router.get('/:id', certificationController.getById);
router.put('/:id', upload.single('file'), validate(validateUpdateCert), certificationController.update);
router.delete('/:id', certificationController.remove);

module.exports = router;
