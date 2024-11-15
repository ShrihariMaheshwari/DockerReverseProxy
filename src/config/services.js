module.exports = {
  'service1.localhost': process.env.NODE_ENV === 'production' 
    ? 'http://service1:3001'  // Docker service name
    : 'http://localhost:3001', // Local development
  'service2.localhost': process.env.NODE_ENV === 'production' 
    ? 'http://service2:3002'
    : 'http://localhost:3002',
  'service3.localhost': process.env.NODE_ENV === 'production' 
    ? 'http://service3:3003'
    : 'http://localhost:3003'
};