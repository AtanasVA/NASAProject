const paginateResults = (request) => {
  const page = Math.abs(request.query.page) || 1;
  const limit = Math.abs(request.query.limit) || 0;
  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
  };
};

module.exports = {
  paginateResults,
};
