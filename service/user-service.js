const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require("uuid");
const emailService = require('./email-service')
const tokenService = require('../service/token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')
class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({email})
    if (candidate) {
      throw ApiError.BadRequest(`User with this email ${email} was created`)
    }
    const hashPass = await bcrypt.hash(password, 3)
    const activationLink = uuid.v4()
    const user = await UserModel.create({email, password: hashPass, activationLink})
    await emailService.sendActivationEmail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({...userDto})
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return {...tokens, user: userDto}
  }

  async activate(activationLink) {
    const user = await  UserModel.findOne({activationLink})
    if (!user) {
      throw ApiError.BadRequest('Incorrect link')
    }
    user.isActivated = true;
    await user.save();
  }
  async login(email, password) {
    const user = await UserModel.findOne({email})
    if (!user) {
      throw ApiError.BadRequest('User not found')
    }
    const pass = await bcrypt.compare(password, user.password)
    if (!pass) {
      throw ApiError.BadRequest('Password not correct')
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto})
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return {...tokens, user: userDto}
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken)
    return token;
  }
  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }
    const userData = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDb = await tokenService.findToken(refreshToken)
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError()
    }
    const user = await UserModel.findById(userData.id)
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto})
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return {...tokens, user: userDto}
  }
  async gelAllUsers() {
    const users = await UserModel.find();
    return users;
  }

}

module.exports = new UserService()