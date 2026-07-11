const validateCreateCert = (data) => {
  const { name, issuingOrg, issueDate, expiryDate, credentialUrl, score, badge, fileUrl } = data;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return 'Certification name is required.';
  }
  if (!issuingOrg || typeof issuingOrg !== 'string' || issuingOrg.trim().length === 0) {
    return 'Issuing organization (Provider) is required.';
  }
  if (!issueDate || isNaN(Date.parse(issueDate))) {
    return 'Valid issue date is required.';
  }
  if (expiryDate && isNaN(Date.parse(expiryDate))) {
    return 'Expiry date must be a valid date.';
  }
  if (credentialUrl && typeof credentialUrl !== 'string') {
    return 'Credential URL must be a string.';
  }
  if (score && typeof score !== 'string') {
    return 'Score must be a string.';
  }
  if (badge && typeof badge !== 'string') {
    return 'Badge must be a string.';
  }
  if (fileUrl && typeof fileUrl !== 'string') {
    return 'File URL must be a string.';
  }
  return null;
};

const validateUpdateCert = (data) => {
  const { name, issuingOrg, issueDate, expiryDate, credentialUrl, score, badge, fileUrl } = data;
  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return 'Certification name cannot be empty.';
  }
  if (issuingOrg !== undefined && (typeof issuingOrg !== 'string' || issuingOrg.trim().length === 0)) {
    return 'Issuing organization cannot be empty.';
  }
  if (issueDate !== undefined && isNaN(Date.parse(issueDate))) {
    return 'Issue date must be a valid date.';
  }
  if (expiryDate !== undefined && expiryDate !== null && isNaN(Date.parse(expiryDate))) {
    return 'Expiry date must be a valid date.';
  }
  if (credentialUrl !== undefined && typeof credentialUrl !== 'string') {
    return 'Credential URL must be a string.';
  }
  if (score !== undefined && typeof score !== 'string') {
    return 'Score must be a string.';
  }
  if (badge !== undefined && typeof badge !== 'string') {
    return 'Badge must be a string.';
  }
  if (fileUrl !== undefined && typeof fileUrl !== 'string') {
    return 'File URL must be a string.';
  }
  return null;
};

module.exports = {
  validateCreateCert,
  validateUpdateCert
};
