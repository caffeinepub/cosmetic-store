import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Runtime "mo:core/Runtime";



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

  public type UserProfile = { name : Text };

  module Product {
    public func compareByPriceAsc(a : Product, b : Product) : Order.Order {
      Float.compare(a.price, b.price);
    };

    public func compareByPriceDesc(a : Product, b : Product) : Order.Order {
      Float.compare(b.price, a.price);
    };
  };

  let products = Map.empty<Nat, Product>();
  var nextId : Nat = 1;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let wishlists = Map.empty<Principal, List.List<Nat>>();

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (isAnonymous(caller)) {
      return null;
    };
    // Simply return the profile if it exists, no permission check needed
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Only allow self or admin access
    // Use safe admin check that doesn't trap for unregistered users
    if (caller != user and not isAdminSafe(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or must be admin");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (isAnonymous(caller)) {
      Runtime.trap("Unauthorized: Anonymous users cannot save profiles");
    };
    // Auto-register user as #user if not already registered
    ensureUserRegistered(caller);
    userProfiles.add(caller, profile);
  };

  // Product management functions
  public shared ({ caller }) func addProduct(
    name : Text,
    brand : Text,
    category : Category,
    description : Text,
    price : Float,
    imageUrl : Text,
    stockQuantity : Nat,
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin access required");
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

  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    brand : Text,
    category : Category,
    description : Text,
    price : Float,
    imageUrl : Text,
    stockQuantity : Nat,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin access required");
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

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin access required");
    };

    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.remove(id);
  };

  public query func searchProducts(searchTerm : Text) : async [Product] {
    let lowerSearch = searchTerm.toLower();

    products.values().toArray().filter(
      func(product) {
        product.name.toLower().contains(#text lowerSearch) or product.brand.toLower().contains(#text lowerSearch);
      }
    );
  };

  public query func filterByCategory(category : Category) : async [Product] {
    products.values().toArray().filter(
      func(product) { product.category == category }
    );
  };

  public query func getProductsSortedByPrice(ascending : Bool) : async [Product] {
    let values = products.values().toArray();
    if (ascending) {
      values.sort(Product.compareByPriceAsc);
    } else {
      values.sort(Product.compareByPriceDesc);
    };
  };

  // Wishlist functions
  public shared ({ caller }) func addToWishlist(productId : Nat) : async () {
    if (isAnonymous(caller)) {
      Runtime.trap("Unauthorized: Cannot add to wishlist for anonymous users");
    };

    // Auto-register user if needed
    ensureUserRegistered(caller);

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let currentWishlist = switch (wishlists.get(caller)) {
          case (null) { List.empty<Nat>() };
          case (?list) { list };
        };

        let exists = currentWishlist.any(func(x) { x == productId });
        if (exists) {
          Runtime.trap("Product already in wishlist");
        };
        currentWishlist.add(productId);
        wishlists.add(caller, currentWishlist);
      };
    };
  };

  public shared ({ caller }) func removeFromWishlist(productId : Nat) : async () {
    if (isAnonymous(caller)) {
      Runtime.trap("Unauthorized: Cannot remove from wishlist for anonymous users");
    };

    // Auto-register user if needed
    ensureUserRegistered(caller);

    let currentWishlist = switch (wishlists.get(caller)) {
      case (null) { Runtime.trap("Wishlist is empty") };
      case (?list) { list };
    };

    let filtered = currentWishlist.filter(func(x) { x != productId });
    wishlists.add(caller, filtered);
  };

  public query ({ caller }) func getCallerWishlist() : async [Product] {
    if (isAnonymous(caller)) {
      // Anonymous callers get empty wishlist (no trap)
      return [];
    };

    // No permission check needed, just get wishlist if it exists
    let wishlistIds = switch (wishlists.get(caller)) {
      case (null) { List.empty<Nat>() };
      case (?list) { list };
    };

    wishlistIds.toArray().map(
      func(id) {
        switch (products.get(id)) {
          case (null) { Runtime.trap("Product not found") };
          case (?product) { product };
        };
      }
    );
  };

  public query ({ caller }) func isProductInWishlist(productId : Nat) : async Bool {
    if (isAnonymous(caller)) {
      return false;
    };

    switch (wishlists.get(caller)) {
      case (null) { false };
      case (?list) {
        list.any(func(x) { x == productId });
      };
    };
  };

  // Helper functions
  func ensureUserRegistered(caller : Principal) {
    if (isAnonymous(caller)) {
      return;
    };
    // Directly check the userRoles map and add if not present
    // This avoids calling hasPermission which would trap for unregistered users
    switch (accessControlState.userRoles.get(caller)) {
      case (null) {
        // User not registered, add them as #user
        accessControlState.userRoles.add(caller, #user);
      };
      case (?_role) {
        // User already registered, do nothing
      };
    };
  };

  func isAdminSafe(caller : Principal) : Bool {
    if (isAnonymous(caller)) {
      return false;
    };
    // Directly check the userRoles map without trapping
    switch (accessControlState.userRoles.get(caller)) {
      case (null) { false };
      case (?role) {
        switch (role) {
          case (#admin) { true };
          case (_) { false };
        };
      };
    };
  };

  func isAnonymous(p : Principal) : Bool {
    let bytes = p.toText();
    bytes == "2vxsx-fae";
  };
};
