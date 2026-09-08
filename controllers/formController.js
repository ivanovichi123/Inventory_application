const formCreateGet = (req, res) => {
  res.render("formCreate");
};

const formCreatePost = (req, res) => {
  res.redirect("/");
};

const formUpdateGet = (req, res) => {
  res.render("formUpdate");
};

const formUpdatePost = (req, res) => {
  res.redirect("/filter");
};

export { formCreateGet, formCreatePost, formUpdateGet, formUpdatePost };
