import { Component, OnInit, Inject } from '@angular/core';
import { CartService } from '../../service/cart-service/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { ProductsService } from '../../../shared/services/products-service/products.service';
import { Cart } from 'src/app/shared/Models/cart';
import { Product } from 'src/app/shared/Models/product';
import { CartItem } from 'src/app/shared/Models/CartItem';
import { ProductReview } from 'src/app/shared/Models/product-review';
import { AccountService } from 'src/app/shared/services/account-service/account.service';
import { ReviewService } from '../../service/review-service/review.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  cart: Cart;
  product:Product;
  productReview:ProductReview=new ProductReview(0,null,2.5,"",0);

  constructor(
    private cartService: CartService,
    private activatedRoute: ActivatedRoute,
    private productService:ProductsService,
    private accountService:AccountService,
    private reviewService: ReviewService,
    private snackBar:MatSnackBar,
    private router: Router
  ) {}

  async ngOnInit() {
    this.cartService.getCart().subscribe(cart=>{
      this.cart=cart;
    });

    this.activatedRoute.paramMap.pipe(take(1)).subscribe(params=>{
      if(params.get('id'))
        this.productService.getProduct(parseInt(params.get('id'))).pipe(take(1)).subscribe(product=>this.product=product);
    });
    this.product.reviews
    this.productReview.user.lastName;
  }

  addToCart(){
    this.cart.items.push(new CartItem(
      0,
      this.product.price,
      1,
      this.product
    ));
    this.cartService.updateCart(this.cart);
  }

  increment(){
    if(this.cart.items[this.cart.indexByProduct(this.product.productId)].itemQuantity<this.product.quantity){
      this.cart.items[this.cart.indexByProduct(this.product.productId)].itemQuantity++;
      this.cartService.updateCart(this.cart);
    }
    else{
      this.snackBar.open("Stock out, there is no more items","Ok",{duration:2000});
    }
  }

  decrement(){
    this.cart.items[this.cart.indexByProduct(this.product.productId)].itemQuantity--;
    if(this.cart.items[this.cart.indexByProduct(this.product.productId)].itemQuantity===0)
      this.cart.items.splice(this.cart.indexByProduct(this.product.productId),1);
    this.cartService.updateCart(this.cart);
  }
  saveReview(){
    this.productReview.productId=this.product.productId;
    this.accountService.getCurrentUser().pipe(take(1)).subscribe(user=>{
      if(user.userEmail){
        this.productReview.user=user;
        this.reviewService.addReview(this.productReview).pipe(take(1)).subscribe(review=>{
          this.snackBar.open("Review Added","OK",{duration:2000});
          this.productService.getProduct(this.product.productId).pipe(take(1)).subscribe(product=>this.product=product);
          this.productReview=new ProductReview(0,null,2.5,"",0);
        },error=>{
          console.log(error);
          this.snackBar.open("Error, try later","Ok",{duration:2000});
        });
      }
      else{
        this.router.navigate(["auth/signin"]);
      }
    });
  }
}
