// Import native 'node.js' modules
import path from "path";

// Import models
import { ProductModel } from "../models/ProductModel.js";
const Product = new ProductModel();
import { ImageModel } from "../models/ImageModel.js";
const Image = new ImageModel();

// Import VIEWS path
import {
  VIEWS
} from "./../config/app-config.js";

// Controller class
export class PublicController {

  async paginatedIndex(req, res){
    try{
      let results = await Product.getNumProducts();
      let numProducts = results[0].numProducts;
      let pageSize = Product.pageSize;
      let totalPages = Math.ceil(numProducts / pageSize);
      let products = await Product.getPage(1);
      let images = await Image.get();
      let user = req.user;
      let cart = [];
      if (typeof(user) !== "undefined") {
        cart = await Product.getUserCart(user.id);
      }
      
      res.render(
        path.resolve(VIEWS, "public", "homepage"), {
          title: "Homepage",
          images: images,
          products: products,
          totalPages: totalPages,
          user: user,
          cart: cart,
          csrfToken: req.csrfToken()
        }
      )
    } catch(e) {
      res.status(404).render(path.resolve(VIEWS, "404.ejs"), {title: "Error", layout: "./public/layouts/layout-user"});
      throw e;
    }
  }

  async getPageContent(req, res){
    try{
      let products = await Product.getPage(req.params.page);
      let images = await Image.get();
      let user = req.user;
      let cart = [];
      if (typeof(user) !== "undefined") {
        cart = await Product.getUserCart(user.id);
      }
      res.send({
        products: products,
        images: images,
        cart: cart
      });
    } catch(e) {
      throw e;
    }
  }

  async goToProduct(req, res){
    try {
      let product = await Product.getById(req.params.id);
      let images = await Image.getByProductId(req.params.id);
      let user = req.user;
      let cart = [];
      if (typeof(user) !== "undefined") {
        cart = await Product.getUserCart(user.id);
      }

      res.render(
        path.resolve(VIEWS, "public", "product", "product-details"), {
          title: "Product",
          product: product,
          images: images,
          user: user,
          cart: cart,
          csrfToken: req.csrfToken()
        }
      );
    } catch(e) {
      res.status(404).render(path.resolve(VIEWS, "404.ejs"), {title: "Error", layout: "./public/layouts/layout-user"});
      throw e;
    }
  }

  async goToCart(req, res){
    let user = req.user;
    let cart = [];
    let products = [];
    let images = [];
    if (typeof(user) !== "undefined") {
      cart = await Product.getUserCart(user.id);
      products = await Product.get();
      images = await Image.get();
    }

    res.render(
      path.resolve(VIEWS, "public", "product", "cart.ejs"), {
        title: "Shopping cart",
        user: user,
        cart: cart,
        products: products,
        images: images,
        csrfToken: req.csrfToken()
      }
    );
  }

  async goToCheckout(req, res){
    let step = req.params.step;
    let checkoutView = "checkout-" + step + ".ejs";

    let user = req.user;
    let cart = [];
    if (typeof(user) !== "undefined") {
      cart = await Product.getUserCart(user.id);
    }

    res.render(
      path.resolve(VIEWS, "public", "product", checkoutView), {
        title: "Checkout",
        user: user,
        cart: cart,
        csrfToken: req.csrfToken()
      }
    );
  }

  async addToCart(req, res){
    try{
      const { customer_id, product_id } = req.body
      let result = await Product.createInCart(customer_id, product_id)
      res.send({
        result: result
      });
    } catch(e) {
      throw e;
    }
  }

  async removeFromCart(req, res){
    try{
      const { customer_id, product_id } = req.body
      let result = await Product.deleteInCart(customer_id, product_id)
      res.send({
        result: result
      });
    } catch(e) {
      throw e;
    }
  }
}