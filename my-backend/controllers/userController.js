const User = require('../models/userModel');
const Role = require('../models/roleModel');
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

exports.createUser = async (req, res) => {
  try {
    const hashedPassword = await hashPassword(req.body.password);

    const roleName = req.body.role || 'user';

    Role.findByName(roleName, (roleErr, roleResults) => {
      if (roleErr) {
        return res.status(500).json({ error: roleErr.message });
      }

      if (!roleResults.length) {
        return res.status(404).json({ error: 'Role not found' });
      }

      const roleId = roleResults[0].id;

      const userData = {
        name: req.body.name || null,
        email: req.body.email,
        password: hashedPassword,
        role_id: roleId,
      };

      User.create(userData, (userErr, result) => {
        if (userErr) {
          return res.status(400).json({ error: userErr.message });
        }

        res.status(201).json({
          id: result.insertId,
          name: userData.name,
          email: userData.email,
          role_id: userData.role_id,
        });
      });
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    User.findById(req.params.id, (err, results) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!results.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(results[0]);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    User.findByEmail(req.body.email, async (err, results) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!results.length) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const user = results[0];

      const passwordMatched = await bcrypt.compare(req.body.password, user.password);

      if (!passwordMatched) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      delete user.password;

      res.status(200).json({
        message: 'Login successful',
        user,
      });
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};