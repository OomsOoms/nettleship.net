const userService = require('../services/userService');

class userController {

    static registerUser = async (req, res) => {
        const { username, email, password } = req.body;
        try {
          const { user, token } = await userService.registerUser(username, email, password);
          res.json({ token });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    };

    static loginUser = async (req, res) => {
        const { email, password } = req.body;
        try {
          const { user, token } = await userService.loginUser(email, password);
          res.json({ token });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    };

    static getUserById = async (req, res) => {
        const { id } = req.user;
        try {
          const user = await userService.getUserById(id);
          res.json({ user });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    };

    static updateUser = async (req, res) => {
        const { id } = req.user;
        const { password, newUsername, newEmail, newPassword } = req.body;
        try {
          const { user, token } = await userService.updateUser(id, password, newUsername, newEmail, newPassword);
          res.json({ token });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    };

    static deleteUser = async (req, res) => {
        const { id } = req.user;
        const { password } = req.body;
        try {
          await userService.deleteUser(id, password);
          res.json({ message: 'User deleted' });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    };
}

module.exports = userController;
