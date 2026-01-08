const Job = require('../models/Job');
const User = require('../models/User');
const { sendNotification } = require('./notificationController');

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Owner only)
exports.createJob = async (req, res) => {
  try {
    // Admins cannot create jobs
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot create jobs' });
    }

    const { title, location, salary, carModel, description, requirements, jobType, interviewDate } = req.body;

    // Validate required fields
    if (!title || !location || !salary || !carModel || !description) {
      return res.status(400).json({ message: 'Missing required fields: title, location, salary, carModel, description' });
    }

    // Validate salary
    if (Number(salary) <= 0) {
      return res.status(400).json({ message: 'Salary must be greater than 0' });
    }

    console.log('Creating job for user:', req.user._id, 'with data:', { title, location, salary, carModel, jobType });

    const jobData = {
      title: title.trim(),
      location: location.trim(),
      salary: Number(salary),
      carModel: carModel.trim(),
      description: description.trim(),
      jobType: jobType || 'fulltime',
      owner: req.user._id,
      status: 'open',
    };

    if (requirements && requirements.trim()) {
      jobData.requirements = requirements.trim();
    }

    if (interviewDate) {
      jobData.interviewDate = interviewDate;
    }

    const job = await Job.create(jobData);
    console.log('Job created successfully:', job._id);

    // Populate owner details before responding
    await job.populate('owner', 'name email phone photo');

    // Notify approved drivers about the new job
    const targetDrivers = await User.find({ role: 'driver', isApproved: true }).select('_id');
    await Promise.all(
      targetDrivers.map((driver) =>
        sendNotification(
          driver._id,
          'New Job Available',
          `${req.user.name} posted a new job: ${job.title}`,
          'job',
          job._id,
          'Job'
        )
      )
    );

    res.status(201).json({ success: true, message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Create Job Error:', error);
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
    // Admins cannot apply for jobs
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot apply for jobs' });
    }

    const { message } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const userId = req.user._id.toString();

    // Check if already applied
    const alreadyApplied = job.applications.find(
      (app) => app.driver.toString() === userId
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    job.applications.push({
      driver: req.user._id,
      message: message || '',
      status: 'pending',
      appliedAt: new Date(),
    });

    await job.save();
    
    // Populate driver details before sending response
    await job.populate('applications.driver', 'name email phone photo licenseInfo');

    // Notify job owner about new application
    await sendNotification(
      job.owner,
      'New Job Application',
      `${req.user.name} has applied for your job: ${job.title}`,
      'job',
      job._id,
      'Job'
    );

    res.json({ success: true, message: 'Application submitted successfully', job });
  } catch (error) {
    console.error('Apply for Job Error:', error);
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

    if (job.owner.toString() !== req.user._id.toString()) {
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

    // Notify driver about application status change
    const statusMessages = {
      accepted: `Congratulations! Your application for ${job.title} has been accepted`,
      rejected: `Your application for ${job.title} has been rejected`,
      shortlisted: `You have been shortlisted for ${job.title}`
    };
    
    if (statusMessages[status]) {
      await sendNotification(
        application.driver,
        'Job Application Update',
        statusMessages[status],
        'job',
        job._id,
        'Job'
      );
    }

    res.json({ success: true, message: 'Application status updated', job });
  } catch (error) {
    console.error('Update Application Status Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my jobs (for owners)
// @route   GET /api/jobs/my/posted
// @access  Private (Owner only)
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ owner: req.user._id })
      .populate('applications.driver', 'name email phone photo')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error('Get My Jobs Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my applications (for drivers)
// @route   GET /api/jobs/my/applications
// @access  Private (Driver only)
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const jobs = await Job.find({ 'applications.driver': userId })
      .populate('owner', 'name email phone photo')
      .sort({ createdAt: -1 });

    const applications = jobs.map((job) => {
      const app = job.applications.find((a) => a.driver.toString() === userId);
      return {
        _id: app._id,
        job: {
          _id: job._id,
          title: job.title,
          location: job.location,
          salary: job.salary,
          carModel: job.carModel,
          description: job.description,
          owner: job.owner,
        },
        applicationStatus: app.status,
        appliedAt: app.appliedAt || app.createdAt,
      };
    });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    console.error('Get My Applications Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
