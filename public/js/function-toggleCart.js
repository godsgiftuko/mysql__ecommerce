/**
 * Helper function to toggle functionality 
 * between "add to cart" and "remove from cart".
 */
function toggleCart(){
  
  let customerId = parseInt($(this).attr('data-userid'));
  let productId = parseInt($(this).attr('data-productid'));
  let setButtonByPage = ['Add to cart', 'Remove', 'lni lni-plus', 'lni lni-minus']; 
  
  let token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  let action = "";
  // if (window.location.href.includes('product')) {
  //   setButtonByPage
  // }
  
  if ($(this).attr('cart-action') == 'addToCart') {
    action = "addToCart"
  } else if ($(this).attr('cart-action') == 'removeFromCart') {
    action = "removeFromCart"
  }
  // console.log(action);
  // return
  $.ajax({
    url: '/cart/' + action,
    xhrFields: { withCredentials: true },
    headers: {'x-csrf-token': token},
    method: 'POST',
    data: {
      customer_id: customerId,
      product_id: productId
    }
  }).done(response => {
    console.log(response  );
    let productCount = parseInt($('#productCount').text());
    // $(this).toggleClass('btn-danger');
    if (response.messageCart == "Product added to customer cart") {
      $('#productCount').text(productCount + 1);
      $(this).attr('cart-action', 'removeFromCart').find('i').attr('class', 'lni lni-minus text-white');
      $(this).removeClass('btn-outline-info');
      $(this).addClass('btn-outline-danger');

      if ($('#product-detail-stock') !== null) {
        let stock = parseInt($('#product-detail-stock').text())
        $('#product-detail-stock').text(stock - 1)
      }
    } else if (response.messageCart == "Product removed from customer cart") {
      $('#productCount').text(productCount - 1);
      $(this).attr('cart-action', 'addToCart').find('i').attr('class', 'lni lni-plus text-white');
      $(this).removeClass('btn-outline-danger');
      $(this).addClass('btn-outline-info');
      if ($('#product-detail-stock') !== null) {
        let stock = parseInt($('#product-detail-stock').text())
        $('#product-detail-stock').text(stock + 1)
      }
    }
  });
}