const errorHandler = (err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  };
  
  module.exports = errorHandler;