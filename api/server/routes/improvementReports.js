const express = require('express');
const { logger } = require('@librechat/data-schemas');
const { submitImprovementReport } = require('@librechat/api');
const { requireJwtAuth } = require('~/server/middleware');
const { sendEmail } = require('~/server/utils');
const { createImprovementReport, markImprovementReportEmailSent } = require('~/models');

const router = express.Router();

const DEFAULT_RECIPIENT = 'support@digitalautomations.it';

router.post('/', requireJwtAuth, async (req, res) => {
  try {
    const result = await submitImprovementReport({
      body: req.body,
      reporter: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        username: req.user.username,
      },
      recipient: process.env.IMPROVEMENT_REPORT_EMAIL || DEFAULT_RECIPIENT,
      appVersion: process.env.npm_package_version,
      createImprovementReport,
      markImprovementReportEmailSent,
      sendEmail,
    });

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.status(201).json(result.data);
  } catch (error) {
    logger.error('[submitImprovementReport] Error submitting report', error);
    res.status(500).json({ message: 'Error submitting report' });
  }
});

module.exports = router;
