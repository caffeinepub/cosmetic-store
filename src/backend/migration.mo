import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type Category = {
    #skincare;
    #makeup;
    #haircare;
    #fragrance;
    #bodycare;
  };

  type Product = {
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

  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    products : Map.Map<Nat, Product>;
    userProfiles : Map.Map<Principal, UserProfile>;
    wishlists : Map.Map<Principal, List.List<Nat>>;
    nextId : Nat;
  };

  type NewActor = {
    products : Map.Map<Nat, Product>;
    userProfiles : Map.Map<Principal, UserProfile>;
    wishlists : Map.Map<Principal, List.List<Nat>>;
    nextId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
