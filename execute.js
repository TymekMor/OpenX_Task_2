const functions = require("./app");
const {
  getData,
  findTotalValueOfCategories,
  findHighestValueCart,
  findTwoUsersLivingFarthestAway,
} = functions;

// Below is the program that will operate on data from our API's
async function executeProgram() {
  // 1.
  const userData = await getData("https://fakestoreapi.com/users");
  const productData = await getData("https://fakestoreapi.com/products");
  const cartData = await getData(
    "https://fakestoreapi.com/carts/?startdate=2000-01-01&enddate=2023-04-07"
  );
  // 2.
  console.log(
    "Categories with their total values:",
    await findTotalValueOfCategories(productData, cartData)
  );
  // 3.
  console.log(
    "The most expensive cart value and its owner:",
    await findHighestValueCart(productData, cartData, userData)
  );
  // 4.
  console.log(
    "The two users which live the farthest away from one another:",
    findTwoUsersLivingFarthestAway(userData)
  );
  module.exports = functions;
}
executeProgram();
