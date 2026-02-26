import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Category = {
    #skincare;
    #makeup;
    #haircare;
    #fragrance;
    #bodycare;
  };

  public type Product = {
    id : Nat;
    name : Text;
    brand : Text;
    category : Category;
    description : Text;
    price : Float;
    imageUrl : Text;
    stockQuantity : Nat;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  module Product {
    public func compareByPriceAsc(a : Product, b : Product) : Order.Order {
      Float.compare(a.price, b.price);
    };

    public func compareByPriceDesc(a : Product, b : Product) : Order.Order {
      Float.compare(b.price, a.price);
    };
  };

  let products = Map.empty<Nat, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextId = 1;

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Add product
  public shared ({ caller }) func addProduct(name : Text, brand : Text, category : Category, description : Text, price : Float, imageUrl : Text, stockQuantity : Nat) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can add products");
    };

    let id = nextId;
    nextId += 1;

    let product : Product = {
      id;
      name;
      brand;
      category;
      description;
      price;
      imageUrl;
      stockQuantity;
      createdAt = Time.now();
    };

    products.add(id, product);
    id;
  };

  // Get all products
  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  // Get product by ID
  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  // Update product
  public shared ({ caller }) func updateProduct(id : Nat, name : Text, brand : Text, category : Category, description : Text, price : Float, imageUrl : Text, stockQuantity : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update products");
    };

    let existingProduct = switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    let updatedProduct : Product = {
      id;
      name;
      brand;
      category;
      description;
      price;
      imageUrl;
      stockQuantity;
      createdAt = existingProduct.createdAt;
    };

    products.add(id, updatedProduct);
  };

  // Delete product
  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can delete products");
    };

    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.remove(id);
  };

  // Search products by name or brand
  public query ({ caller }) func searchProducts(searchTerm : Text) : async [Product] {
    let lowerSearch = searchTerm.toLower();

    let filtered = products.values().toArray().filter(
      func(product) {
        product.name.toLower().contains(#text lowerSearch) or product.brand.toLower().contains(#text lowerSearch);
      }
    );

    filtered;
  };

  // Filter by category
  public query ({ caller }) func filterByCategory(category : Category) : async [Product] {
    let filtered = products.values().toArray().filter(
      func(product) { product.category == category }
    );

    filtered;
  };

  // Sort by price
  public query ({ caller }) func getProductsSortedByPrice(ascending : Bool) : async [Product] {
    let values = products.values().toArray();
    if (ascending) {
      values.sort(Product.compareByPriceAsc);
    } else {
      values.sort(Product.compareByPriceDesc);
    };
  };
};
