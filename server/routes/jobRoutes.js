const express = require('express');
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getJobById,
  applyForJob,
  updateApplicationStatus,
  getMyJobs,
  getMyApplications,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, authorize('owner'), createJob);
router.get('/', getAllJobs);
router.get('/my/posted', protect, authorize('owner'), getMyJobs);
router.get('/my/applications', protect, authorize('driver'), getMyApplications);
router.get('/:id', getJobById);
router.post('/:id/apply', protect, authorize('driver'), applyForJob);
router.put('/:id/applications/:applicationId', protect, authorize('owner'), updateApplicationStatus);

module.exports = router;
