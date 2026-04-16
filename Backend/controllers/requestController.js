const Consumable = require('../models/Consumable');
const ConsumableRequest = require('../models/ConsumableRequest');
const InventoryHistory = require('../models/InventoryHistory');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create a new stock modification request (staff only)
exports.createRequest = async (req, res) => {
  try {
    const { consumableId, requestType, quantity, reason, purpose, course, trainer, startDate, endDate } = req.body;
    const userId = req.user.id;
    const requesterName = req.user.username;

    // Validate required fields
    if (!consumableId || !requestType || !quantity) {
      return res.status(400).json({ error: 'consumableId, requestType, and quantity are required.' });
    }

    if (!['Stock In', 'Stock Out'].includes(requestType)) {
      return res.status(400).json({ error: 'requestType must be "Stock In" or "Stock Out".' });
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return res.status(400).json({ error: 'quantity must be a positive integer.' });
    }

    // Get consumable
    const consumable = await Consumable.findByPk(consumableId);
    if (!consumable) {
      return res.status(404).json({ error: 'Consumable not found.' });
    }

    // For Stock Out requests, validate against current main inventory
    if (requestType === 'Stock Out' && quantity > consumable.quantityMain) {
      return res.status(400).json({ 
        error: `Cannot request ${quantity} units. Only ${consumable.quantityMain} units available in main inventory.` 
      });
    }

    // Create the request
    const request = await ConsumableRequest.create({
      consumableId,
      requestedById: userId,
      requestType,
      quantity,
      reason: reason || null,
      purpose: purpose || null,
      course: course || null,
      trainer: trainer || null,
      startDate: startDate || null,
      endDate: endDate || null,
      status: 'pending',
    });

    // Notify all admins
    const admins = await User.findAll({ where: { role: 'admin' } });
    const adminIds = admins.map(a => a.id);

    if (adminIds.length > 0) {
      await Notification.create({
        userId: adminIds[0], // Will broadcast to all via socket
        type: 'stock_requested',
        message: `${requesterName} requested ${requestType === 'Stock In' ? 'to add' : 'to remove'} ${quantity} units of ${consumable.itemName}`,
        metadata: JSON.stringify({
          requestId: request.id,
          consumableId,
          requesterId: userId,
          requesterName,
          itemName: consumable.itemName,
          quantity,
          requestType,
        }),
        isRead: false,
      });

      // Broadcast to all admin sockets
      global.io?.emit('admin_notification', {
        type: 'stock_requested',
        requestId: request.id,
        requesterName,
        itemName: consumable.itemName,
        quantity,
        requestType,
      });
    }

    res.status(201).json({
      message: 'Stock modification request submitted successfully!',
      request,
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create stock modification request.' });
  }
};

// Get all pending requests (admin only)
exports.getRequests = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 10 } = req.query;

    const requests = await ConsumableRequest.findAndCountAll({
      where: { status },
      include: [
        { model: Consumable, as: 'consumable' },
        { model: User, as: 'requestedBy', attributes: ['id', 'username', 'fullName'] },
        { model: User, as: 'approvedBy', attributes: ['id', 'username', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    res.json({
      requests: requests.rows,
      total: requests.count,
      page: parseInt(page),
      totalPages: Math.ceil(requests.count / limit),
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch stock modification requests.' });
  }
};

// Get request history (all approved/rejected requests)
exports.getRequestHistory = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const whereClause = status ? { status: ['approved', 'rejected'] } : { status: ['approved', 'rejected'] };
    if (status && ['approved', 'rejected'].includes(status)) {
      whereClause.status = status;
    }

    const requests = await ConsumableRequest.findAndCountAll({
      where: whereClause,
      include: [
        { model: Consumable, as: 'consumable' },
        { model: User, as: 'requestedBy', attributes: ['id', 'username', 'fullName'] },
        { model: User, as: 'approvedBy', attributes: ['id', 'username', 'fullName'] },
      ],
      order: [['approvedAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    res.json({
      requests: requests.rows,
      total: requests.count,
      page: parseInt(page),
      totalPages: Math.ceil(requests.count / limit),
    });
  } catch (error) {
    console.error('Error fetching request history:', error);
    res.status(500).json({ error: 'Failed to fetch request history.' });
  }
};

// Approve a request (admin only)
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;
    const adminName = req.user.username;

    // Find the request
    const request = await ConsumableRequest.findByPk(id, {
      include: [
        { model: Consumable, as: 'consumable' },
        { model: User, as: 'requestedBy', attributes: ['id', 'username', 'fullName'] },
      ],
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Cannot approve a ${request.status} request.` });
    }

    // Get the consumable
    const consumable = await Consumable.findByPk(request.consumableId);
    if (!consumable) {
      return res.status(404).json({ error: 'Consumable not found.' });
    }

    // Validate stock availability for Stock Out requests
    if (request.requestType === 'Stock Out' && request.quantity > consumable.quantityMain) {
      return res.status(400).json({ 
        error: `Insufficient stock. Only ${consumable.quantityMain} units available.` 
      });
    }

    // Update consumable quantities
    if (request.requestType === 'Stock In') {
      consumable.quantityMain += request.quantity;
      consumable.quantity += request.quantity;
    } else {
      consumable.quantityMain -= request.quantity;
      consumable.quantity -= request.quantity;
    }
    await consumable.save();

    // Create inventory history entry
    const actionType = request.requestType === 'Stock In' ? 'Stock In' : 'Stock Out';
    await InventoryHistory.create({
      consumableId: request.consumableId,
      actionType,
      quantityChanged: request.quantity,
      beginningInventory: request.requestType === 'Stock In' 
        ? consumable.quantityMain - request.quantity
        : consumable.quantityMain + request.quantity,
      endingInventory: consumable.quantityMain,
      description: `Approved request from ${request.requestedBy.username}${request.reason ? ': ' + request.reason : ''}`,
      course: request.course,
      trainer: request.trainer,
      purpose: request.purpose,
      location: 'main',
      performedBy: adminName,
      performedById: adminId,
      startDate: request.startDate,
      endDate: request.endDate,
    });

    // Update request status
    request.status = 'approved';
    request.approvedById = adminId;
    request.approvalNotes = notes || null;
    request.approvedAt = new Date();
    await request.save();

    // Notify staff user
    await Notification.create({
      userId: request.requestedById,
      type: 'request_approved',
      message: `Your request to ${request.requestType === 'Stock In' ? 'add' : 'remove'} ${request.quantity} units of ${consumable.itemName} has been approved.`,
      metadata: JSON.stringify({
        requestId: request.id,
        consumableId: request.consumableId,
        itemName: consumable.itemName,
        quantity: request.quantity,
        approvalNotes: notes,
      }),
      isRead: false,
    });

    // Broadcast to staff user's socket if connected
    global.io?.emit('request_approved', {
      requestId: request.id,
      userId: request.requestedById,
      itemName: consumable.itemName,
      message: `Your request to ${request.requestType === 'Stock In' ? 'add' : 'remove'} ${request.quantity} units has been approved.`,
    });

    res.json({
      message: 'Request approved successfully!',
      request,
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Failed to approve request.' });
  }
};

// Reject a request (admin only)
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;
    const adminName = req.user.username;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required.' });
    }

    // Find the request
    const request = await ConsumableRequest.findByPk(id, {
      include: [
        { model: Consumable, as: 'consumable' },
        { model: User, as: 'requestedBy', attributes: ['id', 'username', 'fullName'] },
      ],
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Cannot reject a ${request.status} request.` });
    }

    // Update request status
    request.status = 'rejected';
    request.approvedById = adminId;
    request.approvalNotes = reason;
    request.approvedAt = new Date();
    await request.save();

    // Get consumable for notification
    const consumable = await Consumable.findByPk(request.consumableId);

    // Notify staff user
    await Notification.create({
      userId: request.requestedById,
      type: 'request_rejected',
      message: `Your request to ${request.requestType === 'Stock In' ? 'add' : 'remove'} ${request.quantity} units of ${consumable?.itemName || 'item'} has been rejected.`,
      metadata: JSON.stringify({
        requestId: request.id,
        consumableId: request.consumableId,
        itemName: consumable?.itemName,
        quantity: request.quantity,
        rejectionReason: reason,
      }),
      isRead: false,
    });

    // Broadcast to staff user's socket if connected
    global.io?.emit('request_rejected', {
      requestId: request.id,
      userId: request.requestedById,
      itemName: consumable?.itemName,
      reason,
      message: `Your request to ${request.requestType === 'Stock In' ? 'add' : 'remove'} ${request.quantity} units has been rejected: ${reason}`,
    });

    res.json({
      message: 'Request rejected successfully!',
      request,
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Failed to reject request.' });
  }
};
