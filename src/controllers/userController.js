// Import native 'node.js' modules
import path from "path";

// Import dependencies
import bcrypt from "bcrypt";
import passport from "passport";

// Import models
import { UserModel } from "../models/UserModel.js";
import { ProductModel } from "../models/ProductModel.js";

// Import constants from own file 'app-config.js'
import {
  VIEWS, SALT_ROUNDS

} from "./../config/app-config.js";

const User = new UserModel();
const Product = new ProductModel();
// Controller class
export class UserController {

  goToLogin(req, res){
    res.render(path.resolve(VIEWS, "public", "user", "login.ejs"), {
      title: "Login",
      layout: "./public/layouts/layout-user",
      csrfToken: req.csrfToken()
    });
  }

  goToRegister(req, res){
    res.render(path.resolve(VIEWS, "public", "user", "register.ejs"), {
      title: "Register",
      layout: "./public/layouts/layout-user",
      csrfToken: req.csrfToken()
    });
  }

  goToReset(req, res){
    res.render(
      path.resolve(VIEWS, "public", "user", "reset.ejs"), {
        title: "Reset password",
        layout: "./public/layouts/layout-user",
        csrfToken: req.csrfToken()
      }
    );
  }

  async goToProfile(req, res){
    let user = req.user;
    let cart = [];
    if (typeof(user) !== "undefined") {
      cart = await Product.getUserCart(user.id);
    }

    res.render(
      path.resolve(VIEWS, "public", "user", "profile.ejs"), {
        title: "Profile",
        user: user,
        cart: cart,
        csrfToken: req.csrfToken()
      }
    );
  }
  
  async goToEditProfile(req, res){
    let user = req.user;

    res.render(
      path.resolve(VIEWS, "public", "user", "edit.ejs"), {
        title: "Edit profile",
        user: user,
        csrfToken: req.csrfToken()
      }
    );
  }

  async goToPreferences(req, res){
    let user = req.user;

    res.render(
      path.resolve(VIEWS, "public", "user", "preference.ejs"), {
        title: "Preference",
        user: user,
        csrfToken: req.csrfToken()
      }
    );
  }

  async newUser(req, res){
    const fullname = req.body.registerName;
    const email = req.body.registerEmail;
    const password = req.body.registerPassword;
    const hashedPassword = await bcrypt.hash(password, parseInt(SALT_ROUNDS));
    const createAt = Date.now();
    const promise = User.create([fullname, email, hashedPassword, createAt]);
    promise.then(result => {
      req.flash('success_msg', result);
      res.redirect('/user/login');
    }).catch(error => {
      res.render(
        path.resolve(VIEWS, "public", "user", "register.ejs"), {
          title: "Register",
          layout: "./public/layouts/layout-user",
          message: error,
          fullname: fullname,
          email: email,
          password: password,
          csrfToken: req.csrfToken()
        }
      );
    })
  }

  async newPassword(req, res){
    const email = req.body.resetEmail;
    const newPassword = generateString(6);
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(SALT_ROUNDS));
    const promise = User.getByEmail(email);
    promise.then(results => {
      return User.resetPassword(results[0], hashedPassword)
    }).then(result => {
      res.render(
        path.resolve(VIEWS, "public", "user", "reset.ejs"), {
          title: "Reset password",
          layout: "./public/layouts/layout-user",
          message: result,
          csrfToken: req.csrfToken()
        }
      );
      console.log(newPassword)
    }).catch(error => {
      res.render(
        path.resolve(VIEWS, "public", "user", "reset.ejs"), {
          title: "Reset password",
          layout: "./public/layouts/layout-user",
          message: error,
          csrfToken: req.csrfToken()
        }
      )
    })
  }
  
  async updateProfile(req, res){
    let { profileName, newPassword, confirmPassword } = req.body;
    
    let hashedPassword = '';
    if(newPassword !== '' && confirmPassword !== '') {
      hashedPassword = await bcrypt.hash(newPassword, parseInt(SALT_ROUNDS));
    }
    if (newPassword !== confirmPassword) {
      let error = new Error("Passwords do not match");
      console.log(error);
      res.render(
        path.resolve(VIEWS, "public", "user", "edit.ejs"), {
          title: "Edit Profile",
          user: req.user,
          message: error,
          csrfToken: req.csrfToken()
        }
      );
    } else {
      profileName  = profileName || req.user.fullname;
      hashedPassword = hashedPassword || req.user.password;
      const updatedAt = Date.now();
      const promise = User.update(req.user, [profileName, hashedPassword, updatedAt]);
      promise
      .then(result => {
          req.user.fullname = profileName;
          req.user.password = hashedPassword;
          req.user.updatedAt = updatedAt;
          res.render(
            path.resolve(VIEWS, "public", "user", "profile.ejs"), {
              title: "Profile",
              user: req.user,
              message: result,
              csrfToken: req.csrfToken()
            }
          );
        })
        .catch(error => {
          res.render(
            path.resolve(VIEWS, "public", "user", "edit.ejs"), {
              title: "Edit Profile",
              user: req.user,
              message: error,
              csrfToken: req.csrfToken()
            }
          );
        });
    }
  }

  authenticate(req, res, next){
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: 'login',
      failureFlash: true
    })(req, res, next);
  }

  logout(req, res){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect("/user/login");
  }
}

// Helper function to generate random string
function generateString(length) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}