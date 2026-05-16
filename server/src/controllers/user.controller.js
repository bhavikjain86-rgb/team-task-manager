const prisma = require('../config/prisma');

const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    const currentUserId = req.user.userId;
    const currentUserRole = req.user.role;

    if (id !== currentUserId && currentUserRole !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    
    // Only admins can change roles
    if (role && currentUserRole === 'ADMIN') {
      dataToUpdate.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUser
};
