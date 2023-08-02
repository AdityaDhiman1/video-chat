const express = require("express");
const router = express();
const controller = require('../controllers/controllers')

router.get('/video',controller.isAuthenticated,controller.videoPage);
// router.get('/video/:id',controller.isAuthenticated,controller.videoPage);
router.get('/', controller.loginPage);
router.get('/login', controller.loginPage);
router.post('/login',controller.loginPagepost)
router.get('/signup',controller.signupPage);
router.post('/signup', controller.signupPagepost);
router.post('/logout',controller.logoutPage)


module.exports = router;
