const functions = require("./app");
const {
  getData,
  findTotalValueOfCategories,
  findHighestValueCart,
  findTwoUsersLivingFarthestAway,
} = functions;
// This function gets all keys along with nested ones, as opposed to Object.keys()
const getAllKeys = (object) => {
  const keys = [];
  for (key in object) {
    keys.push(key);
    if (typeof object[key] === "object") {
      keys.push(...getAllKeys(object[key]));
    }
  }
  return keys;
};

describe("1. Tests regarding data retrieval", () => {
  test("Check if error is thrown correctly", async () => {
    const invalid_url = "well it should not work";
    try {
      await getData(invalid_url);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
  test("Check if every User object has correct keys", async () => {
    const mockUserData = {
      address: {
        geolocation: { lat: "-37.3159", long: "81.1496" },
        city: "kilcoole",
        street: "new road",
        number: 7682,
        zipcode: "12926-3874",
      },
      id: 1,
      email: "john@gmail.com",
      username: "johnd",
      password: "m38rmF$",
      name: { firstname: "john", lastname: "doe" },
      phone: "1-570-236-7033",
      __v: 0,
    };
    const mockKeys = getAllKeys(mockUserData);
    const retrievedData = await getData("https://fakestoreapi.com/users");
    expect(retrievedData).toBeDefined();
    retrievedData.forEach((element) => {
      const retrievedKeys = getAllKeys(element);
      expect(retrievedKeys).toEqual(mockKeys);
    });
  });
  test("Check if every Cart object has correct keys", async () => {
    const mockCartData = {
      id: 1,
      userId: 1,
      date: "2020-03-02T00:00:00.000Z",
      products: [
        { productId: 1, quantity: 4 },
        { productId: 2, quantity: 1 },
        { productId: 3, quantity: 6 },
      ],
      __v: 0,
    };
    const mockKeys = Object.keys(mockCartData); // in this case we dont want to check nested keys because there may or may not be any products inside
    const retrievedData = await getData(
      "https://fakestoreapi.com/carts/?startdate=2000-01-01&enddate=2023-04-07"
    );
    expect(retrievedData).toBeDefined();
    retrievedData.forEach((element) => {
      const retrievedKeys = Object.keys(element);
      expect(retrievedKeys).toEqual(mockKeys);
    });
  });
  test("Check if every Product object has correct keys", async () => {
    const mockProcuctData = {
      id: 1,
      title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
      price: 109.95,
      description:
        "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
      category: "men's clothing",
      image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
      rating: { rate: 3.9, count: 120 },
    };
    const mockKeys = getAllKeys(mockProcuctData);
    const retrievedData = await getData("https://fakestoreapi.com/products");
    expect(retrievedData).toBeDefined();
    retrievedData.forEach((element) => {
      const retrievedKeys = getAllKeys(element);
      expect(retrievedKeys).toEqual(mockKeys);
    });
  });
});
describe("Tests regarding data analysis and implementation of data structures containing retrieved data", () => {
  test("2. Check if findTotalValueOfCategories() found totalValue of each category with correct total values", async () => {
    const mockCarts = [
      {
        id: 1,
        products: [{ productId: 1, quantity: 10 }],
      },
      {
        id: 2,
        products: [
          { productId: 2, quantity: 10 },
          { productId: 4, quantity: 10 },
        ],
      },
      {
        id: 3,
        products: [
          { productId: 3, quantity: 10 },
          { productId: 1, quantity: 10 },
        ],
      },
    ];
    const mockProducts = [
      {
        id: 1,
        category: "Clothing",
        price: 100,
      },
      {
        id: 2,
        category: "Food",
        price: 50,
      },
      {
        id: 3,
        category: "Food",
        price: 250,
      },
      {
        id: 4,
        category: "Electronics",
        price: 500,
      },
    ];
    const categoriesTotalValue = await findTotalValueOfCategories(
      mockProducts,
      mockCarts
    );
    expect(categoriesTotalValue).toBeDefined();
    expect(Object.keys(categoriesTotalValue).length).toBe(3);
    expect(categoriesTotalValue).toMatchObject({
      Clothing: 2000,
      Food: 3000,
      Electronics: 5000,
    });
  });

  test("3. Check if findHighestValueCart() finds a cart that belongs to Anna Smith with value equal to 3500 ", async () => {
    const mockUsers = [
      {
        name: { firstname: "John", lastname: "Kowalski" },
        id: 1,
      },
      { name: { firstname: "Anna", lastname: "Smith" }, id: 2 },
    ];
    const mockProducts = [
      {
        id: 1,
        price: 100,
      },
      {
        id: 2,
        price: 50,
      },
      {
        id: 3,
        price: 250,
      },
    ];
    const mockCarts = [
      {
        id: 1,
        userId: 1,
        products: [{ productId: 1, quantity: 10 }],
      },
      {
        id: 2,
        userId: 2,
        products: [{ productId: 2, quantity: 10 }],
      },
      {
        id: 3,
        userId: 2,
        products: [
          { productId: 3, quantity: 10 },
          { productId: 1, quantity: 10 },
        ],
      },
    ];
    const highestValueCart = await findHighestValueCart(
      mockProducts,
      mockCarts,
      mockUsers
    );
    const expectedCart = {
      name: { firstname: "Anna", lastname: "Smith" },
      value: 3500,
    };
    expect(highestValueCart).toEqual(expectedCart);
  });

  test("4. Check if findTwoUsersLivingFarthestAway() finds two users living the farthest away ", () => {
    const mockUsers = [
      {
        name: { firstname: "John", lastname: "Kowalski" },
        address: { geolocation: { lat: 0, long: 0 } },
      },
      {
        name: { firstname: "Anna", lastname: "Smith" },
        address: { geolocation: { lat: 10, long: 10 } },
      },
      {
        name: { firstname: "Zachary", lastname: "Powell" },
        address: { geolocation: { lat: 20, long: 20 } },
      },
    ];
    const farAwayUsers = findTwoUsersLivingFarthestAway(mockUsers);
    expect(farAwayUsers).toMatchObject({
      userOne: { firstname: "John", lastname: "Kowalski" },
      userTwo: { firstname: "Zachary", lastname: "Powell" },
      distance: expect.anything(),
    });
  });
});
