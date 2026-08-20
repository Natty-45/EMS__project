import jwt from 'jsonwebtoken';

//generate token
const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15d' })
    //send cookie

    res.cookie('user_token', token, {
        httpOnly: true, //accessible only by the web server
        sameSite: 'strict', //cookie can only be sent to the same site
        maxAge: 15 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV !== 'development',
    });

    return token;
}
export default generateToken;