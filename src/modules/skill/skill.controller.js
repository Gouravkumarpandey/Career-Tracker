const skillService = require('./skill.service');
const ApiResponse = require('../../utils/ApiResponse');

const getAll = async (req, res, next) => {
  try {
    const skills = await skillService.getSkills(req.user.id, req.query);
    res.status(200).json(new ApiResponse(200, skills, 'Skills retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const skill = await skillService.getSkillById(req.user.id, id);
    res.status(200).json(new ApiResponse(200, skill, 'Skill retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const skill = await skillService.createSkill(req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, skill, 'Skill created successfully.'));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const skill = await skillService.updateSkill(req.user.id, id, req.body);
    res.status(200).json(new ApiResponse(200, skill, 'Skill updated successfully.'));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await skillService.deleteSkill(req.user.id, id);
    res.status(200).json(new ApiResponse(200, result, 'Skill deleted successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
