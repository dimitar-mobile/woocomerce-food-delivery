import React from 'react';
import { connect } from 'react-redux';

import { View, StyleSheet, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import {fromJS, List, Map} from 'immutable';
import Container from 'src/containers/Container';
import ProductItem from 'src/containers/ProductItem';

import { columnProductSelector, currencySelector, defaultCurrencySelector, daysBeforeNewProductSelector  } from 'src/modules/common/selectors';
import { prepareProductItem } from 'src/utils/product';

import { padding, margin } from 'src/components/config/spacing';
import { removeCart, changeQuantity } from 'src/modules/cart/actions';
import { checkQuantity } from 'src/utils/product';
import {addListToCart} from 'src/modules/cart/actions';
import { selectCartList, cartSizeSelector } from 'src/modules/cart/selectors';
const { width } = Dimensions.get('window');

const widthImage = (col = 1) => {
  const widthFlatList = width - 2 * padding.large;
  const widthDistantImage = (col - 1) * padding.small;
  return (widthFlatList - widthDistantImage) / col;
};
const heightImage = (w = 168) => {
  return (w * 200) / 168;
};

class ProductView extends React.Component {
  state = {
    bupdate: false
  }
  renderFooter = () => {
    if (!this.props.loadingMore) return <View style={styles.viewFooter} />;

    return (
      <View style={[styles.viewFooter, styles.viewLoadingFooter]}>
        <ActivityIndicator animating size="small" />
      </View>
    );
  };

  changeQuantity = (item, quantity) => {
    if( item.length === 0 )
    {
      this.addToCart();
      return;
    }

    const {dispatch} = this.props;
    const product = item.length === 0 ? []: item[0].product;
    const check = item.length === 0 ? true : checkQuantity(product, quantity);
    if (check) {
      if (quantity > 0) {
        dispatch(changeQuantity(item[0], quantity));
      } else {
        dispatch(removeCart(item[0]));
      }
    } else {
      showMessage({
        message: 'Can\'t change quantity',
        description: 'The quantity out of stock on store.',
        type: 'danger',
      });
    }
  };

  addToCart = (item) => {
    const {dispatch} = this.props;
    let list = [];
    list = list.concat({
            product_id: item.id,
            quantity: 1,
            variation: Map(),
            product : item,
            meta_data: List(),
          });
      dispatch(addListToCart(list));
      this.setState({bupdate: !this.state.bupdate});
  };

  render() {
    const { data, line_items, column, refreshing, handleLoadMore, handleRefresh, currency, defaultCurrency, days  } = this.props;
    const wImage = widthImage(column);
    const hImage = heightImage(wImage);
    const dataPrepare = data.map(item => prepareProductItem(item, currency, defaultCurrency, days ));
    const cartData = line_items.toJS();
    return (
      <FlatList
        showsHorizontalScrollIndicator={false}
        key={column}
        numColumns={column}
        columnWrapperStyle={column > 1 ? styles.viewCol : null}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={item => `${item.id}`}
        data={dataPrepare.toJS()}
        renderItem={({ item }) => {
          const cart = cartData.filter((dt) =>{ return( dt.product_id === item.id)});
          return(
          <Container disable={column > 1 ? 'all' : 'none'}>
            {cart.length === 0 ? <ProductItem item={item} width={wImage} height={hImage} cart = {cart} changeQuantity={()=>
                 this.addToCart(item)
              }/>:
              <ProductItem item={item} width={wImage} height={hImage} cart = {cart} changeQuantity={
                this.changeQuantity
             }/>}
          </Container>
          )
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        ListFooterComponent={this.renderFooter}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    );
  }
}

const styles = StyleSheet.create({
  viewCol: {
    justifyContent: 'space-between',
    paddingHorizontal: padding.large,
  },
  separator: {
    height: 36,
  },
  viewFooter: {
    marginBottom: 26,
  },
  viewLoadingFooter: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
  },
});

const mapStateToProps = state => {
  return {
    line_items: selectCartList(state),
    column: columnProductSelector(state),
    currency: currencySelector(state),
    defaultCurrency: defaultCurrencySelector(state),
    days: daysBeforeNewProductSelector(state),
  };
};
ProductView.defaultProps = {
  data: fromJS([]),
  loadingMore: false,
  refreshing: false,
  handleLoadMore: () => {},
  handleRefresh: () => {},
};

export default connect(mapStateToProps)(ProductView);
