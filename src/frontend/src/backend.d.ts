import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Product {
    id: bigint;
    stockQuantity: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    imageUrl: string;
    category: Category;
    brand: string;
    price: number;
}
export enum Category {
    fragrance = "fragrance",
    skincare = "skincare",
    makeup = "makeup",
    bodycare = "bodycare",
    haircare = "haircare"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, brand: string, category: Category, description: string, price: number, imageUrl: string, stockQuantity: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    filterByCategory(category: Category): Promise<Array<Product>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProduct(id: bigint): Promise<Product>;
    getProductsSortedByPrice(ascending: boolean): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    updateProduct(id: bigint, name: string, brand: string, category: Category, description: string, price: number, imageUrl: string, stockQuantity: bigint): Promise<void>;
}
