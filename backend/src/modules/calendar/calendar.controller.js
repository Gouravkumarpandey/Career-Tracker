const prisma = require('../../config/prisma');
const ApiResponse = require('../../utils/ApiResponse');

const getAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const events = await prisma.calendarEvent.findMany({
      where: { userId },
      orderBy: { eventDate: 'asc' }
    });
    res.status(200).json(new ApiResponse(200, events, 'Calendar events retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, type, eventDate, sendEmail } = req.body;

    const newEvent = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        type,
        eventDate: new Date(eventDate),
        sendEmail: sendEmail !== undefined ? sendEmail : true
      }
    });

    res.status(201).json(new ApiResponse(201, newEvent, 'Calendar event created successfully.'));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, type, eventDate, sendEmail, completed } = req.body;

    const event = await prisma.calendarEvent.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!event) {
      return res.status(404).json(new ApiResponse(404, null, 'Calendar event not found.'));
    }

    const updatedData = {};
    if (title !== undefined) updatedData.title = title;
    if (type !== undefined) updatedData.type = type;
    if (eventDate !== undefined) updatedData.eventDate = new Date(eventDate);
    if (sendEmail !== undefined) updatedData.sendEmail = sendEmail;
    if (completed !== undefined) {
      updatedData.completed = completed;
      if (!completed && event.completed) {
        updatedData.emailSent = false;
      }
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: parseInt(id) },
      data: updatedData
    });

    res.status(200).json(new ApiResponse(200, updatedEvent, 'Calendar event updated successfully.'));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const event = await prisma.calendarEvent.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!event) {
      return res.status(404).json(new ApiResponse(404, null, 'Calendar event not found.'));
    }

    await prisma.calendarEvent.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json(new ApiResponse(200, null, 'Calendar event deleted successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove
};
