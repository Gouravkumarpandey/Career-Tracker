const express = require('express');
const jobController = require('./job.controller');
const validate = require('../../middlewares/validate.middleware');
const auth = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');
const { validateCreateJob, validateApply, validateScheduleInterview } = require('./job.validation');

const router = express.Router();

router.use(auth); // Protect all routes below this middleware

router.get('/search/online', jobController.searchOnlineJobs);
router.get('/recommendations/ai', jobController.getAiRecommendations);
router.post('/external', jobController.createOrGetExternalJob);

// Static routes first to prevent conflict with /:id
router.get('/saved', jobController.getSavedJobs);
router.get('/applications', jobController.getApplications);
router.get('/applications/:id', jobController.getApplicationById);
router.put('/applications/:id/status', jobController.updateApplicationStatus);
router.post('/applications/:id/interviews', validate(validateScheduleInterview), jobController.scheduleInterview);
router.put('/applications/interviews/:interviewId', validate(validateScheduleInterview), jobController.updateInterview);
router.delete('/applications/interviews/:interviewId', jobController.deleteInterview);

// Parameterized routes
router.get('/', jobController.getJobs);
router.post('/', authorize('Admin', 'Mentor'), validate(validateCreateJob), jobController.createJob);
router.get('/:id', jobController.getJobById);
router.post('/:id/save', jobController.saveJob);
router.post('/:id/apply', validate(validateApply), jobController.applyToJob);

module.exports = router;
