// @flow
import React from 'react';
import ItemDefault from './ItemDefault';
import ItemWishlist from './ItemWishlist';
import ItemCart from './ItemCart';
import ItemOrder from './ItemOrder';

type Props = {
  type: 'default' | 'wishlist' | 'cart' | 'order',
};
const ProductItem = (props: Props) => {

  const { type, item, cart, ...rest } = props;
  onChange = quantity => {
    const {changeQuantity} = props;
    changeQuantity(cart, quantity);
  };
  const quantity = cart === undefined || cart.length == 0  ? 0 : cart[0].quantity;
  if (!item || !item.id) {
    return null;
  }
  if (type === 'wishlist') {
    return <ItemWishlist item={item} {...rest} />;
  } else if (type === 'cart') {
    return <ItemCart item={item} {...rest} />;
  } else if (type === 'order') {
    return <ItemOrder item={item} {...rest} />;
  }
  return <ItemDefault item={item} quantity = {quantity} {...rest} onChange={onChange}  />;
};

ProductItem.defaultProps = {
  type: 'default',
};

export default ProductItem;
