const Signup = require('../models/models')
const mongoose = require('mongoose')
const express = require('express')
const app = express()


const videoPage = async (req, res, next) => {
    try {
        let user = await req.session.user_name
        res.render('index',{user: user})
    } catch (error) {
        console.error(error.message)
        
    }
}

const loginPage = async (req, res, next) => {
    res.render("login")
}

const signupPage = async (req, res, next) => {
    res.render("signup")
}

const signupPagepost = async (req, res, next) => {
    let password = req.body.password;
    let confirm_password = req.body.confirmpassword;
    if (password === confirm_password) {
        let msg = "";
        let signup = new Signup({
            username: req.body.username,
            e_mail: req.body.e_mail,
            password: password,
            confirm_password: confirm_password
        })
        let registerd = signup.save();
        msg = "Signup Sccessful"
        res.redirect(302, "/login?msg=" + msg)

    } else {
        res.redirect(404, "pas not match?msg=" + msg)
        msg = "Password does not matched"
    }
}


const loginPagepost = (req, res, next) => {
    let msg = "";
    let email_id = req.body.email_id;
    let password = req.body.password;
    Signup.find({ e_mail: email_id })
        .then((data) => {
            if (password === data[0].password) {
                req.session.user_name = data[0].username;
                // console.log(req.session.user_id = data);
                req.session.isAuthenticated = true;
                msg = "login successful"
                res.redirect(302, "/video?msg=" + msg);
            } else {
                msg = "login failed"
                res.redirect(500,'/login?msg="' + msg)
            }
        }).catch((err) => {
            msg = "the given detail is worng"
            res.redirect('/login?msg=' + msg);
            console.error(err.message);
        })

}

const logoutPage = (req, res, next) => {
    req.session.destroy((err) => {
        if(err) throw err;
        return res.redirect("/login?msg=logout success");
    })
}

const isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
      next();
    }
    else {
      res.redirect('/login');
    }
  }



module.exports = {
    videoPage,
    loginPage,
    signupPage,
    signupPagepost,
    loginPagepost,
    isAuthenticated,
    logoutPage
}