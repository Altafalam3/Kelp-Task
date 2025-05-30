const errorHandler = (err, req, res, next) => {
   console.error('Error handler:', err);

   res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
   });
};

export default errorHandler;
