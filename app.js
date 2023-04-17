const fetch = require("node-fetch");

const functions = {
  async getData(url, timeout = 5000) {
    // due to frequent timeout errors (poor internet connection), I added my own abort controll, which executes much faster
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "pl,en-US;q=0.7,en;q=0.3",
          "Alt-Used": "fakestoreapi.com",
          Connection: "keep-alive",
          Host: "fakestoreapi.com",
        },
        mode: "cors",
        cache: "default",
      });
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error);
    } finally {
      clearTimeout(timeoutId);
    }
  },
  async findTotalValueOfCategories(products, carts) {
    const priceAndCategory = new Object();
    const categoriesTotalValue = new Object();

    products.forEach((product) => {
      let key = product.category;
      if (!categoriesTotalValue.hasOwnProperty(key)) {
        categoriesTotalValue[`${key}`] = 0;
      }
      key = product.id;
      if (!priceAndCategory.hasOwnProperty(key)) {
        priceAndCategory[`${key}`] = [product.price, product.category];
      }
    });

    carts.forEach((cart) => {
      for (product of cart.products) {
        const id = product.productId;
        const quantity = product.quantity;
        const category = priceAndCategory[`${id}`][1];
        const value = priceAndCategory[`${id}`][0] * quantity;
        categoriesTotalValue[`${category}`] += value;
      }
    });
    return categoriesTotalValue;
  },
  async findHighestValueCart(products, carts, users) {
    const productPrice = new Object();
    products.forEach((product) => {
      const key = product.id;
      if (!productPrice.hasOwnProperty(key)) {
        productPrice[`${key}`] = product.price;
      }
    });
    let maxValue = 0;
    let userId = "";

    carts.forEach((cart) => {
      let totalValue = 0;
      for (product of cart.products) {
        const productId = product.productId;
        const quantity = product.quantity;
        const price = productPrice[`${productId}`];
        totalValue += quantity * price;
      }
      if (maxValue < totalValue) {
        maxValue = totalValue;
        userId = cart.userId - 1; // not the safest approach but user ids are just indexes + 1 so this way it works
      }
    });

    return { name: users[`${userId}`].name, value: maxValue };
  },
  findTwoUsersLivingFarthestAway(users) {
    const farAwayUsers = new Object({ userOne: {}, userTwo: {}, distance: 0 });
    for (user_i of users) {
      for (user_j of users) {
        const i = user_i.address.geolocation;
        const j = user_j.address.geolocation;
        if (i === j) {
          continue;
        }
        const x = distanceBetweenTwoPoints(i.lat, j.lat, i.long, j.long);
        if (x > farAwayUsers.distance) {
          farAwayUsers.userOne = user_i.name;
          farAwayUsers.userTwo = user_j.name;
          farAwayUsers.distance = x;
        }
      }
    }
    return farAwayUsers;
  },
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};
const distanceBetweenTwoPoints = (lat1, lat2, lon1, lon2) => {
  const R = 6371; // radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const b = 2 * Math.asin(Math.sqrt(a));
  const distance = Number((R * b).toFixed(4));
  return distance; // result is in kilometers
};

module.exports = functions;
