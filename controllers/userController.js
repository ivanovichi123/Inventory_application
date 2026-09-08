const userIndexGet = (req, res) => {
  console.log("Index get");
  res.render("index");
};

const userFilterGet = (req, res) => {
  console.log("Filter get");
  res.render("filter");
};

export { userIndexGet, userFilterGet };
