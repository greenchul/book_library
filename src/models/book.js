module.exports = (connection, DataTypes) => {
  const schema = {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: [true],
          msg: "Title can not be empty",
        },
        notNull: {
          msg: "Title can not be empty",
        },
      },
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: [true],
          msg: "Author can not be empty",
        },
        notNull: {
          msg: "Author can not be empty",
        },
      },
    },
    genre: {
      type: DataTypes.STRING,
    },
    ISBN: {
      type: DataTypes.STRING,
    },
  };

  const BookModel = connection.define("Book", schema);
  return BookModel;
};
