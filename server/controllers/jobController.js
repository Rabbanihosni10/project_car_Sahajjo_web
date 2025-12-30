const Job = require('../models/Job');

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Owner only)
exports.createJob = async (req, res) => {
  try {
    const { title, location, salary, carModel, description, requirements, jobType, interviewDate } = req.body;

    const job = await Job.create({
      title,
      location,
      salary,
      carModel,
      description,
      requirements,
      jobType,
      interviewDate,
      owner: req.user.id,
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' })
      .populate('owner', 'name email phone photo')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('owner', 'name email phone photo')
      .populate('applications.driver', 'name email phone photo licenseInfo');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Driver only)
exports.applyForJob = async (req, res) => {
  try {
    const { message } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const alreadyApplied = job.applications.find(
      (app) => app.driver.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    job.applications.push({
      driver: req.user.id,
      message,
      status: 'pending',
    });

    await job.save();

    res.json({ success: true, message: 'Application submitted successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/jobs/:id/applications/:applicationId
// @access  Private (Owner only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const application = job.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;

    if (status === 'accepted') {
      job.status = 'filled';
    }

    await job.save();

    res.json({ success: true, message: 'Application status updated', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my jobs (for owners)
// @route   GET /api/jobs/my/posted
// @access  Private (Owner only)
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ owner: req.user.id })
      .populate('applications.driver', 'name email phone photo')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my applications (for drivers)
// @route   GET /api/jobs/my/applications
// @access  Private (Driver only)
exports.getMyApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ 'applications.driver': req.user.id })
      .populate('owner', 'name email phone photo')
      .sort({ createdAt: -1 });

    const applications = jobs.map((job) => {
      const app = job.applications.find((a) => a.driver.toString() === req.user.id);
      return {
        job: {
          id: job._id,
          title: job.title,
          location: job.location,
          salary: job.salary,
          carModel: job.carModel,
          owner: job.owner,
        },
        applicationStatus: app.status,
        appliedAt: app.appliedAt,
      };
    });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
