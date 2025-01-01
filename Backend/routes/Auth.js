const express = require("express");
const AuthRoutes= express.Router();
const {register,login,logout} = require("../controllers/Auth.js");


AuthRoutes.post("/register",register);
AuthRoutes.post("/login",login);
AuthRoutes.get("/logout",logout);

module.exports = AuthRoutes;
