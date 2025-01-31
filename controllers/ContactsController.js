const contactService = require('../services/ContactService');
const asyncHandler = require('../helpers/asyncHandler');

class ContactsController {
  getAll = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;
    const { page = 1, limit = 10, favorite } = req.query;
    const skip = limit * (page - 1);
    const filter = { owner };
    if (favorite) {
      filter.favorite = Boolean(
        favorite.replace(/\s*(false|null|undefined|0)\s*/i, '')
      );
    }
    const data = await contactService.getAll(filter, { skip, limit });
    res.status(200).json({
      code: 200,
      message: 'ok',
      qty: data.length,
      data,
    });
  });

  add = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;
    const contact = await contactService.addContact({ ...req.body, owner });
    res.status(200).json({
      code: 200,
      message: 'ok',
      data: contact,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const contact = await contactService.getContactById(id);

    if (!contact) {
      res.status(404).json({
        code: 404,
        message: 'Not found',
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'ok',
      data: contact,
    });
  });

  remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const contact = await contactService.removeContact(id);

    if (!contact) {
      res.status(404).json({
        code: 404,
        message: 'Not found',
      });
      return;
    }

    res.status(200).json({
      code: 200,
      message: 'contact deleted',
    });
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const contact = await contactService.updateContact(id, req.body);

    if (!contact) {
      res.status(404).json({
        code: 404,
        message: 'Not found',
      });

      return;
    }

    res.status(201).json({
      code: 201,
      message: 'ok',
      data: contact,
    });
  });
}

module.exports = new ContactsController();
